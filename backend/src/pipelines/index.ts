import { JobData } from '../schemas/job';
import { withRetries } from '../utils/safety';
import { runModule0 } from './modules/module0-input';
import { runModule1Classifier } from './modules/module1-classifier';
import { runModule2Coverage } from './modules/module2-coverage';
import { runModule3Clarifications } from './modules/module3-clarifications';
import { runModule4Evidence } from './modules/module4-evidence';
import { runModule5Engines } from './modules/module5-engines';
import { runModule6Critic } from './modules/module6-critic';
import { runModule7Scenarios } from './modules/module7-scenarios';
import { runModule8OutputComposer } from './modules/module8-output';
import { logger } from '../logger';
import { inputPreprocess } from '../utils/input-preprocess';

type ExtractionQuality = { status: 'ok' | 'low'; message?: string };

export type PipelineProgressHandler = (job: JobData) => void;

function appendClarificationAnswers(job: JobData): string {
  if (!job.clarifications.answers.length) return '';
  const lines = job.clarifications.answers.map((a) => `پاسخ ${a.questionId}: ${a.answer}`);
  return `\n\nپاسخ‌های روشن‌سازی:\n${lines.join('\n')}`;
}

export async function runPipeline(
  job: JobData,
  onProgress?: PipelineProgressHandler
): Promise<JobData> {
  const steps = 8;
  let currentJob: JobData = { ...job, outputs: job.outputs ?? {} };
  const extraction = currentJob.input.extraction;

  const bump = (step: number) => {
    currentJob = { ...currentJob, progress: Math.min(0.98, step / steps) };
    if (onProgress) onProgress(currentJob);
  };

  const preprocessedInput = inputPreprocess(currentJob.input.text ?? '');
  const clarificationAddendum = appendClarificationAnswers(currentJob);
  // Ensure downstream stages only see the cleaned, normalized input before text assessment/chunking.
  const baseText = inputPreprocess(`${preprocessedInput}${clarificationAddendum}`);
  const extractionQuality = assessExtractionQuality(preprocessedInput);

  const baseMeta = {
    job_id: currentJob.id,
    extracted_chars: extraction?.extracted_chars ?? baseText.length,
    extractor_used: extraction?.extractor_used,
    chunk_count: currentJob.chunks.length
  };

  // M0
  const module0 = await runStage('module0-input', baseMeta, async () =>
    withRetries(async () => runModule0(baseText), 1)
  );
  currentJob = { ...currentJob, chunks: module0.chunks };
  bump(1);

  const metaWithChunks = {
    ...baseMeta,
    extracted_chars: module0.cleanedText.length,
    chunk_count: module0.chunks.length
  };

  // M1
  const classifier = await runStage('module1-classifier', metaWithChunks, async () =>
    withRetries(async () => runModule1Classifier(module0.cleanedText), 1)
  );
  currentJob.outputs.classifier = classifier;
  bump(2);

  // M2
  const coverage = await runStage('module2-coverage', metaWithChunks, async () =>
    withRetries(async () => runModule2Coverage(module0.cleanedText), 1)
  );
  currentJob.outputs.coverage = coverage;
  bump(3);

  // M3
  const clarifications = await runStage('module3-clarifications', metaWithChunks, async () =>
    withRetries(async () => runModule3Clarifications(coverage), 1)
  );
  currentJob.outputs.clarifications = clarifications;
  currentJob.clarifications.questions = clarifications.questions;
  bump(4);

  // M4
  const evidence = await runStage('module4-evidence', metaWithChunks, async () =>
    withRetries(async () => runModule4Evidence(module0.chunks), 1)
  );
  currentJob.outputs.evidence = evidence;
  bump(5);

  // M5
  const engines = await runStage('module5-engines', metaWithChunks, async () =>
    withRetries(
      async () => runModule5Engines(coverage, evidence, classifier.domain ?? 'حوزه نامشخص'),
      1
    )
  );
  currentJob.outputs.trends = engines.trends;
  currentJob.outputs.weak_signals = engines.weak_signals;
  currentJob.outputs.critical_uncertainties = engines.critical_uncertainties;
  bump(6);

  // M6
  const critic = await runStage('module6-critic', metaWithChunks, async () =>
    withRetries(
      async () =>
        runModule6Critic(engines.trends, engines.weak_signals, engines.critical_uncertainties),
      1
    )
  );
  currentJob.outputs.critic = critic;
  bump(7);

  // M7
  const scenarios = await runStage('module7-scenarios', metaWithChunks, async () =>
    withRetries(async () => runModule7Scenarios(engines.critical_uncertainties), 1)
  );
  currentJob.outputs.scenarios = scenarios;
  const uncertaintiesStatus: 'ok' | 'low' =
    (engines.critical_uncertainties?.length ?? 0) >= 2 ? 'ok' : 'low';
  // M8
  const composer = await runStage('module8-output', metaWithChunks, async () =>
    withRetries(
      async () =>
          runModule8OutputComposer({
            classifier,
            coverage,
            clarifications,
            trends: engines.trends,
            weakSignals: engines.weak_signals,
            uncertainties: engines.critical_uncertainties,
          uncertaintiesStatus,
            scenarios,
            evidence,
            extractionQuality
          }),
      1
    )
  );
  currentJob.outputs.report = composer;
  currentJob.report = composer;
  bump(8);

  currentJob.progress = 1;
  return currentJob;
}

async function runStage<T>(
  stage: string,
  meta: {
    job_id: string;
    extracted_chars?: number;
    chunk_count?: number;
    extractor_used?: string;
  },
  fn: () => Promise<T>
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    logger.info(
      {
        ...meta,
        stage,
        duration_ms: Date.now() - start
      },
      'Stage completed'
    );
    return result;
  } catch (err) {
    logger.error(
      {
        err,
        ...meta,
        stage,
        duration_ms: Date.now() - start
      },
      'Stage failed'
    );
    throw err;
  }
}

function assessExtractionQuality(text: string): ExtractionQuality {
  const cleaned = text.replace(/\s+/g, ' ').trim();
  const uniqueWords = new Set(
    cleaned
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => w.toLowerCase())
  ).size;
  if (cleaned.length < 300 || uniqueWords < 40) {
    return {
      status: 'low',
      message: 'کیفیت استخراج متن پایین است و ممکن است شواهد ناقص باشند.'
    };
  }
  return { status: 'ok' };
}

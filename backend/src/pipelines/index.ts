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

export type PipelineProgressHandler = (job: JobData) => void;

function appendClarificationAnswers(job: JobData): string {
  if (!job.clarifications.answers.length) return '';
  const lines = job.clarifications.answers.map((a) => `پاسخ به ${a.questionId}: ${a.answer}`);
  return `\n\nپاسخ‌های کاربر:\n${lines.join('\n')}`;
}

export async function runPipeline(
  job: JobData,
  onProgress?: PipelineProgressHandler
): Promise<JobData> {
  const steps = 8;
  let currentJob: JobData = { ...job, outputs: job.outputs ?? {} };
  const bump = (step: number) => {
    currentJob = { ...currentJob, progress: Math.min(0.98, step / steps) };
    if (onProgress) onProgress(currentJob);
  };

  const baseText = `${currentJob.input.text ?? ''}${appendClarificationAnswers(currentJob)}`;

  // M0
  const module0 = await withRetries(async () => runModule0(baseText), 1);
  currentJob = { ...currentJob, chunks: module0.chunks };
  bump(1);

  // M1
  const classifier = await withRetries(async () => runModule1Classifier(module0.cleanedText), 1);
  currentJob.outputs.classifier = classifier;
  bump(2);

  // M2
  const coverage = await withRetries(async () => runModule2Coverage(module0.cleanedText), 1);
  currentJob.outputs.coverage = coverage;
  bump(3);

  // M3
  const clarifications = await withRetries(async () => runModule3Clarifications(coverage), 1);
  currentJob.outputs.clarifications = clarifications;
  currentJob.clarifications.questions = clarifications.questions;
  bump(4);

  // M4
  const evidence = await withRetries(async () => runModule4Evidence(module0.chunks), 1);
  currentJob.outputs.evidence = evidence;
  bump(5);

  // M5
  const engines = await withRetries(
    async () => runModule5Engines(coverage, evidence, classifier.domain ?? 'حوزه'),
    1
  );
  currentJob.outputs.trends = engines.trends;
  currentJob.outputs.weak_signals = engines.weak_signals;
  currentJob.outputs.critical_uncertainties = engines.critical_uncertainties;
  bump(6);

  // M6
  const critic = await withRetries(
    async () =>
      runModule6Critic(engines.trends, engines.weak_signals, engines.critical_uncertainties),
    1
  );
  currentJob.outputs.critic = critic;
  bump(7);

  // M7
  const scenarios = await withRetries(
    async () => runModule7Scenarios(engines.critical_uncertainties),
    1
  );
  currentJob.outputs.scenarios = scenarios;

  // M8
  const composer = await withRetries(
    async () =>
      runModule8OutputComposer({
        classifier,
        coverage,
        clarifications,
        trends: engines.trends,
        weakSignals: engines.weak_signals,
        uncertainties: engines.critical_uncertainties,
        scenarios,
        evidence
      }),
    1
  );
  currentJob.outputs.report = composer;
  currentJob.report = composer;
  bump(8);

  currentJob.progress = 1;
  return currentJob;
}

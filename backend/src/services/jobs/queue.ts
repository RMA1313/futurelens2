import { nanoid } from 'nanoid';
import { env } from '../../config/env';
import { logger } from '../../logger';
import { JobStatusSchema } from '../../schemas/common';
import {
  AnalyzeRequest,
  AnalyzeRequestSchema,
  ClarificationAnswerSchema,
  JobData
} from '../../schemas/job';
import { runPipeline } from '../../pipelines';
import { persistJob, loadJob } from '../storage/sqlite';
import { AppError } from '../../utils/errors';
import { normalizePersianText } from '../../utils/chunking';
import { extractTextFromFile, ExtractionMeta } from '../../utils/text-extract';

const runningJobs = new Set<string>();

async function ensureTextFromRequest(
  req: AnalyzeRequest
): Promise<{ text: string; extraction: ExtractionMeta }> {
  if (req.text && req.text.trim().length > 0) {
    const cleaned = normalizePersianText(req.text);
    return {
      text: cleaned,
      extraction: {
        extracted_chars: cleaned.length,
        extractor_used: 'plain-text',
        pages_detected: 0,
        is_scanned_heuristic: false
      }
    };
  }
  if (req.fileBuffer) {
    const extracted = await extractTextFromFile(req.fileBuffer, req.fileName);
    return { text: normalizePersianText(extracted.text), extraction: extracted.meta };
  }
  throw new AppError('متن یا فایل برای تحلیل ارسال نشده است.', 400);
}

export async function createJob(rawPayload: Partial<AnalyzeRequest>): Promise<JobData> {
  const parsed = AnalyzeRequestSchema.parse(rawPayload);
  let text = '';
  let extraction: ExtractionMeta | undefined;
  let extractionError: string | undefined;
  try {
    const result = await ensureTextFromRequest(parsed);
    text = result.text;
    extraction = result.extraction;
  } catch (err) {
    extractionError = err instanceof AppError ? err.message : 'خطا در استخراج متن.';
  }
  const now = new Date().toISOString();
  const job: JobData = {
    id: `job_${nanoid(10)}`,
    status: extractionError ? JobStatusSchema.enum.failed : JobStatusSchema.enum.queued,
    progress: extractionError ? 1 : 0,
    input: {
      text: text || undefined,
      fileName: parsed.fileName,
      extraction
    },
    chunks: [],
    outputs: {},
    clarifications: { questions: [], answers: [] },
    report: undefined,
    error: extractionError,
    demoMode: env.DEMO_MODE,
    created_at: now,
    updated_at: now
  };
  persistJob(job);
  if (!extractionError) {
    queueJob(job.id);
  }
  return job;
}

export function getJob(id: string): JobData | null {
  return loadJob(id);
}

export async function submitClarifications(
  id: string,
  answers: { questionId: string; answer: string }[]
): Promise<JobData> {
  const job = loadJob(id);
  if (!job) throw new AppError('کار موردنظر پیدا نشد.', 404);
  const parsedAnswers = answers.map((a) => ClarificationAnswerSchema.parse(a));
  const updated: JobData = {
    ...job,
    clarifications: {
      questions: job.clarifications.questions,
      answers: [...job.clarifications.answers, ...parsedAnswers]
    },
    status: JobStatusSchema.enum.queued,
    progress: 0,
    outputs: {},
    report: undefined,
    error: undefined
  };
  persistJob(updated);
  queueJob(updated.id, true);
  return updated;
}

function queueJob(id: string, isRetry = false) {
  if (runningJobs.has(id)) return;
  runningJobs.add(id);
  setImmediate(async () => {
    let job = loadJob(id);
    if (!job) {
      runningJobs.delete(id);
      return;
    }
    try {
      job = { ...job, status: JobStatusSchema.enum.running, error: undefined };
      persistJob(job);
      const result = await runPipeline(job, (partial) => persistJob(partial));
      result.status = JobStatusSchema.enum.succeeded;
      result.progress = 1;
      persistJob(result);
    } catch (err) {
      const message = err instanceof AppError ? err.message : 'خطا در اجرای تحلیل.';
      logger.error({ err, job_id: id }, 'Job failed');
      job = {
        ...job,
        status: JobStatusSchema.enum.failed,
        error: message,
        progress: 1
      };
      persistJob(job);
    } finally {
      runningJobs.delete(id);
    }
  });
}

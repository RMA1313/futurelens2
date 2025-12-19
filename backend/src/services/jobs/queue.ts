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

const runningJobs = new Set<string>();

function ensureTextFromRequest(req: AnalyzeRequest): string {
  if (req.text && req.text.trim().length > 0) return normalizePersianText(req.text);
  if (req.fileBuffer) {
    return normalizePersianText(req.fileBuffer.toString('utf-8'));
  }
  throw new AppError('متن یا فایل معتبر ارسال نشده است', 400);
}

export async function createJob(rawPayload: Partial<AnalyzeRequest>): Promise<JobData> {
  const parsed = AnalyzeRequestSchema.parse(rawPayload);
  const text = ensureTextFromRequest(parsed);
  const now = new Date().toISOString();
  const job: JobData = {
    id: `job_${nanoid(10)}`,
    status: JobStatusSchema.enum.queued,
    progress: 0,
    input: {
      text,
      fileName: parsed.fileName
    },
    chunks: [],
    outputs: {},
    clarifications: { questions: [], answers: [] },
    report: undefined,
    error: undefined,
    demoMode: env.DEMO_MODE,
    created_at: now,
    updated_at: now
  };
  persistJob(job);
  queueJob(job.id);
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
  if (!job) throw new AppError('شغل پیدا نشد', 404);
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
      const message = err instanceof Error ? err.message : 'خطای نامشخص';
      logger.error({ err }, 'Job failed');
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

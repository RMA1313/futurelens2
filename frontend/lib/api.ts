import { z } from 'zod';
import {
  AnalyzeResponseSchema,
  ClarificationAnswerSchema,
  HealthSchema,
  JobStatusSchema,
  ReportSchema
} from './schemas';

const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

async function handleResponse<T>(res: Response, schema: z.ZodSchema<T>): Promise<T> {
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'خطا در ارتباط با سرویس');
  }
  const data = await res.json();
  const parsed = schema.safeParse(data);
  if (!parsed.success) {
    throw new Error('پاسخ نامعتبر از سرویس');
  }
  return parsed.data;
}

export async function fetchHealth() {
  const res = await fetch(`${baseURL}/api/health`, { cache: 'no-store' });
  return handleResponse(res, HealthSchema);
}

export async function createJob({
  text,
  file
}: {
  text?: string;
  file?: File | null;
}): Promise<string> {
  let res: Response;
  if (file) {
    const form = new FormData();
    if (text) form.append('text', text);
    form.append('file', file);
    res = await fetch(`${baseURL}/api/analyze`, {
      method: 'POST',
      body: form
    });
  } else {
    res = await fetch(`${baseURL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
  }
  const data = await handleResponse(res, AnalyzeResponseSchema);
  return data.jobId;
}

export async function fetchJob(jobId: string) {
  const res = await fetch(`${baseURL}/api/jobs/${jobId}`, { cache: 'no-store' });
  return handleResponse(res, JobStatusSchema);
}

export async function submitClarifications(jobId: string, answers: { questionId: string; answer: string }[]) {
  const validated = answers.map((a) => ClarificationAnswerSchema.parse(a));
  const res = await fetch(`${baseURL}/api/jobs/${jobId}/clarifications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ answers: validated })
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'خطا در ارسال پاسخ‌ها');
  }
  return true;
}

export async function fetchReport(jobId: string) {
  const res = await fetch(`${baseURL}/api/jobs/${jobId}/report`, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || 'خطا در دریافت گزارش');
  }
  const data = await res.json();
  const parsed = ReportSchema.safeParse(data);
  if (parsed.success) return parsed.data;
  const partial = ReportSchema.partial().safeParse(data);
  if (partial.success) {
    return partial.data as any;
  }
  throw new Error('گزارش دریافتی ناقص یا نامعتبر است');
}

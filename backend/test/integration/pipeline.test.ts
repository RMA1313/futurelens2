import fs from 'fs';
import path from 'path';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import type { FastifyInstance } from 'fastify';

let app: FastifyInstance;
const dbPath = path.resolve(process.cwd(), 'data', 'test.db');
let database: { close: () => void } | null = null;

async function waitForJobStatus(jobId: string) {
  for (let i = 0; i < 30; i++) {
    const res = await app.inject({ method: 'GET', url: `/api/jobs/${jobId}` });
    const body = JSON.parse(res.body as string);
    if (body.status === 'succeeded' || body.status === 'failed') {
      return body;
    }
    await new Promise((resolve) => setTimeout(resolve, 150));
  }
  throw new Error('timeout waiting for job');
}

beforeAll(async () => {
  process.env.DATABASE_FILE = './data/test.db';
  process.env.LLM_API_KEY = '';
  process.env.DEMO_MODE = 'true';
  const mod = await import('../../src/server');
  app = await mod.buildServer();
  const storage = await import('../../src/services/storage/sqlite');
  database = storage.db;
});

afterAll(async () => {
  if (app) {
    await app.close();
  }
  try {
    database?.close();
  } catch (_) {
    // ignore
  }
  if (fs.existsSync(dbPath)) {
    try {
      fs.rmSync(dbPath);
    } catch (_) {
      // ignore
    }
  }
});

describe('pipeline integration', () => {
  it('runs analyze and produces report', async () => {
    const analyze = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { text: 'این یک متن آزمایشی درباره آینده هوش مصنوعی و سیاست‌گذاری است.' }
    });
    expect(analyze.statusCode).toBe(202);
    const jobId = JSON.parse(analyze.body as string).jobId;
    expect(jobId).toBeTruthy();

    const jobBody = await waitForJobStatus(jobId);
    expect(jobBody.status).toBe('succeeded');

    const reportRes = await app.inject({ method: 'GET', url: `/api/jobs/${jobId}/report` });
    expect(reportRes.statusCode).toBe(200);
    const report = JSON.parse(reportRes.body as string);
    expect(report.executive_brief).toBeTruthy();
    expect(report.dashboard?.evidence?.length).toBeGreaterThan(0);
  });

  it('accepts clarifications and reruns job', async () => {
    const analyze = await app.inject({
      method: 'POST',
      url: '/api/analyze',
      payload: { text: 'متنی کوتاه که نیاز به توضیح بیشتری دارد.' }
    });
    expect(analyze.statusCode).toBe(202);
    const jobId = JSON.parse(analyze.body as string).jobId;

    let jobBody = await waitForJobStatus(jobId);
    expect(jobBody.status).toBe('succeeded');
    const questions = jobBody.clarifications?.questions ?? [];
    expect(questions.length).toBeGreaterThan(0);

    const submit = await app.inject({
      method: 'POST',
      url: `/api/jobs/${jobId}/clarifications`,
      payload: { answers: [{ questionId: questions[0].id, answer: 'پاسخ نمونه کاربر' }] }
    });
    expect(submit.statusCode).toBe(202);

    jobBody = await waitForJobStatus(jobId);
    expect(jobBody.status).toBe('succeeded');
  });
});

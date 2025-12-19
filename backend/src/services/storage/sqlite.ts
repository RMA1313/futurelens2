import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { env } from '../../config/env';
import { logger } from '../../logger';
import { JobData, JobDataSchema } from '../../schemas/job';

const dbPath = path.resolve(process.cwd(), env.DATABASE_FILE);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS jobs (
    id TEXT PRIMARY KEY,
    status TEXT NOT NULL,
    progress REAL NOT NULL,
    data_json TEXT NOT NULL,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  )
`);

const upsertJobStmt = db.prepare(`
  INSERT INTO jobs (id, status, progress, data_json, created_at, updated_at)
  VALUES (@id, @status, @progress, @data_json, @created_at, @updated_at)
  ON CONFLICT(id) DO UPDATE SET
    status=excluded.status,
    progress=excluded.progress,
    data_json=excluded.data_json,
    updated_at=excluded.updated_at
`);

const getJobStmt = db.prepare(`SELECT * FROM jobs WHERE id = ?`);

export function persistJob(job: JobData): void {
  const payload: JobData = {
    ...job,
    updated_at: new Date().toISOString()
  };
  upsertJobStmt.run({
    id: payload.id,
    status: payload.status,
    progress: payload.progress,
    data_json: JSON.stringify(payload),
    created_at: payload.created_at,
    updated_at: payload.updated_at
  });
}

export function loadJob(id: string): JobData | null {
  const row = getJobStmt.get(id) as
    | {
        id: string;
        status: string;
        progress: number;
        data_json: string;
        created_at: string;
        updated_at: string;
      }
    | undefined;
  if (!row) return null;
  try {
    const parsed = JobDataSchema.parse(JSON.parse(row.data_json));
    return parsed;
  } catch (err) {
    logger.error({ err }, 'خطا در خواندن داده شغل');
    return null;
  }
}

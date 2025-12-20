import { config } from 'dotenv';
import { z } from 'zod';

config();

const EnvSchema = z.object({
  PORT: z.coerce.number().default(3002),
  FRONTEND_PORT: z.coerce.number().default(3000),
  DATABASE_FILE: z.string().default('./data/futurelenz.db'),
  LLM_PROVIDER: z.string().default('openai'),
  LLM_MODEL: z.string().default('gpt-4o-mini'),
  LLM_BASE_URL: z.string().default('https://api.avalai.ir/v1'),
  LLM_API_KEY: z.string().optional().default(''),
  LOG_LEVEL: z.string().default('info'),
  RATE_LIMIT_MAX: z.coerce.number().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(60_000),
  DEMO_MODE: z
    .string()
    .optional()
    .transform((val) => (val === undefined ? undefined : val === 'true' || val === '1'))
});

const parsed = EnvSchema.parse({
  PORT: process.env.PORT,
  FRONTEND_PORT: process.env.FRONTEND_PORT,
  DATABASE_FILE: process.env.DATABASE_FILE,
  LLM_PROVIDER: process.env.LLM_PROVIDER,
  LLM_MODEL: process.env.LLM_MODEL,
  LLM_BASE_URL: process.env.LLM_BASE_URL,
  LLM_API_KEY: process.env.LLM_API_KEY,
  LOG_LEVEL: process.env.LOG_LEVEL,
  RATE_LIMIT_MAX: process.env.RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS: process.env.RATE_LIMIT_WINDOW_MS,
  DEMO_MODE: process.env.DEMO_MODE
});

export const env = {
  ...parsed,
  DEMO_MODE: parsed.DEMO_MODE ?? !parsed.LLM_API_KEY
};

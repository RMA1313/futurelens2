import OpenAI from 'openai';
import { ZodSchema } from 'zod';
import { env } from '../../config/env';
import { repairJson } from '../../utils/jsonRepair';
import { logger } from '../../logger';

const openaiClient =
  env.LLM_API_KEY && !env.DEMO_MODE ? new OpenAI({ apiKey: env.LLM_API_KEY }) : null;

type CallArgs<T> = {
  prompt: string;
  input: unknown;
  schema: ZodSchema<T>;
  fallback: () => T;
  timeoutMs?: number;
  maxRetries?: number;
  signal?: AbortSignal;
};

export async function callStructuredLLM<T>({
  prompt,
  input,
  schema,
  fallback,
  timeoutMs = 20_000,
  maxRetries = 2,
  signal
}: CallArgs<T>): Promise<T> {
  if (!openaiClient) {
    return fallback();
  }

  const baseDelay = 400;
  const inputJson = JSON.stringify(input, null, 2).slice(0, 12_000);

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    let timer: NodeJS.Timeout | undefined;
    try {
      const controller = new AbortController();
      timer = setTimeout(() => controller.abort(), timeoutMs);
      const completion = await openaiClient.chat.completions.create(
        {
          model: env.LLM_MODEL,
          messages: [
            {
              role: 'system',
              content:
                'فقط JSON معتبر برگردان. متن کاملاً فارسی باشد. اگر داده ناکافی است صریح اعلام کن و از جعل اطلاعات خودداری کن.'
            },
            {
              role: 'user',
              content: `${prompt.trim()}\n\nورودی JSON:\n${inputJson}`
            }
          ],
          response_format: { type: 'json_object' }
        },
        { signal: signal ?? controller.signal }
      );
      const content = completion.choices?.[0]?.message?.content ?? '';
      const repaired = repairJson(content);
      const parsed = JSON.parse(repaired);
      const validated = schema.parse(parsed);
      return validated;
    } catch (err) {
      logger.warn({ err, attempt }, 'خطا در فراخوانی LLM، تلاش مجدد');
      if (attempt === maxRetries) break;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise((resolve) => setTimeout(resolve, delay));
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  return fallback();
}

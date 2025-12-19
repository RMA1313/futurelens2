import { nanoid } from 'nanoid';
import {
  ClarificationOutput,
  ClarificationOutputSchema,
  CoverageEntry
} from '../../schemas/modules';
import { module3ClarificationsPrompt } from '../../prompts/module3-clarifications';
import { callStructuredLLM } from '../../services/llm/client';

function fallbackClarifications(coverage: CoverageEntry[]) {
  const questions = coverage
    .filter((c) => c.status !== 'active')
    .map((c) => ({
      id: `q-${nanoid(6)}`,
      module: c.module,
      question: `برای تکمیل ماژول ${c.module} چه داده یا شواهدی اضافه‌ای دارید؟`
    }));
  return ClarificationOutputSchema.parse({ questions });
}

export async function runModule3Clarifications(
  coverage: CoverageEntry[]
): Promise<ClarificationOutput> {
  return callStructuredLLM<ClarificationOutput>({
    prompt: module3ClarificationsPrompt,
    input: { coverage },
    schema: ClarificationOutputSchema,
    fallback: () => fallbackClarifications(coverage)
  });
}

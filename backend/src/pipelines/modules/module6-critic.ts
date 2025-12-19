import { z } from 'zod';
import {
  CriticOutput,
  CriticOutputSchema,
  TrendItem,
  WeakSignalItem,
  CriticalUncertainty
} from '../../schemas/modules';
import { module6CriticPrompt } from '../../prompts/module6-critic';
import { callStructuredLLM } from '../../services/llm/client';

function fallbackCritic(
  trends: TrendItem[],
  weakSignals: WeakSignalItem[],
  uncertainties: CriticalUncertainty[]
): CriticOutput {
  const labels = [
    ...trends.map((t) => ({
      item_ref: t.id,
      label: t.label_type ?? 'inference',
      confidence: t.confidence ?? 0.55,
      note: 'مبنای استدلال در شواهد محدود است.'
    })),
    ...weakSignals.map((w) => ({
      item_ref: w.id,
      label: w.label_type ?? 'assumption',
      confidence: w.confidence ?? 0.45,
      note: 'به داده بیشتر برای تأیید نیاز دارد.'
    })),
    ...uncertainties.map((u) => ({
      item_ref: u.id,
      label: u.label_type ?? 'inference',
      confidence: u.confidence ?? 0.5,
      note: 'عدم قطعیت ذاتی در محرک‌های کلیدی.'
    }))
  ];

  return CriticOutputSchema.parse({
    contradictions: [],
    unsupported: [],
    labels
  });
}

export async function runModule6Critic(
  trends: TrendItem[],
  weakSignals: WeakSignalItem[],
  uncertainties: CriticalUncertainty[]
): Promise<CriticOutput> {
  const schema = z.object({
    contradictions: CriticOutputSchema.shape.contradictions,
    unsupported: CriticOutputSchema.shape.unsupported,
    labels: CriticOutputSchema.shape.labels
  });

  return callStructuredLLM<CriticOutput>({
    prompt: module6CriticPrompt,
    input: { trends, weak_signals: weakSignals, critical_uncertainties: uncertainties },
    schema,
    fallback: () => fallbackCritic(trends, weakSignals, uncertainties)
  });
}

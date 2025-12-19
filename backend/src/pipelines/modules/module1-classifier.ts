import { DocumentClassifier, DocumentClassifierSchema } from '../../schemas/modules';
import { module1ClassifierPrompt } from '../../prompts/module1-classifier';
import { callStructuredLLM } from '../../services/llm/client';

function fallbackClassifier(text: string): DocumentClassifier {
  const lower = text.toLowerCase();
  const domain = lower.includes('هوش مصنوعی') || lower.includes('ai')
    ? 'هوش مصنوعی'
    : lower.includes('انرژی') || lower.includes('نفت') || lower.includes('گاز')
      ? 'انرژی'
      : lower.includes('دفاع') || lower.includes('امنیت')
        ? 'دفاع و امنیت'
        : lower.includes('سلامت') || lower.includes('پزشکی')
          ? 'سلامت'
          : 'عمومی';

  const horizon = text.match(/20[3-9]\d/) || text.includes('دهه') || text.includes('ده سال')
    ? 'بلندمدت'
    : text.includes('سال آینده') || text.includes('یک تا سه سال')
      ? 'کوتاه‌مدت'
      : 'میان‌مدت';

  return DocumentClassifierSchema.parse({
    document_type: text.length > 1500 ? 'گزارش سیاستی' : 'یادداشت تحلیلی',
    domain,
    horizon,
    analytical_level: text.includes('باید') ? 'هنجاری' : 'تحلیلی'
  });
}

export async function runModule1Classifier(text: string): Promise<DocumentClassifier> {
  return callStructuredLLM<DocumentClassifier>({
    prompt: module1ClassifierPrompt,
    input: { text: text.slice(0, 6000) },
    schema: DocumentClassifierSchema,
    fallback: () => fallbackClassifier(text)
  });
}

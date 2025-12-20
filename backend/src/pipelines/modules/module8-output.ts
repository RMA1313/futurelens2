import {
  CoverageEntry,
  CriticalUncertainty,
  DocumentClassifier,
  EvidenceItem,
  OutputComposer,
  OutputComposerSchema,
  Scenario,
  TrendItem,
  WeakSignalItem
} from '../../schemas/modules';

export function runModule8OutputComposer(params: {
  classifier: DocumentClassifier;
  coverage: CoverageEntry[];
  clarifications: { questions: { id: string; module: string; question: string }[] };
  trends: TrendItem[];
  weakSignals: WeakSignalItem[];
  uncertainties: CriticalUncertainty[];
  scenarios: Scenario[];
  evidence: EvidenceItem[];
  extractionQuality?: { status: 'ok' | 'low'; message?: string };
}): OutputComposer {
  const {
    classifier,
    coverage,
    clarifications,
    trends,
    weakSignals,
    uncertainties,
    scenarios,
    evidence,
    extractionQuality
  } = params;

  const executive_brief = `این تحلیل بر اساس سند ${classifier.document_type} در حوزه ${classifier.domain} انجام شد. مهم‌ترین روند، «${trends[0]?.label ?? 'شناسایی اولیه روند'}» و نامطمئن‌ترین محرک «${uncertainties[0]?.driver ?? 'محرک در دست بررسی'}» است.`;

  const coverageSummary = coverage
    .map((c) => `${c.module}: ${c.status}`)
    .join(' | ');

  const full_report = [
    `نوع سند: ${classifier.document_type} | افق: ${classifier.horizon} | سطح تحلیل: ${classifier.analytical_level}`,
    `پوشش ماژول‌ها: ${coverageSummary}`,
    `روندها (${trends.length}): ${trends.map((t) => t.label).join(', ') || '---'}`,
    `نشانه‌های ضعیف (${weakSignals.length}): ${weakSignals.map((w) => w.signal).join(', ') || '---'}`,
    `عدم قطعیت‌های بحرانی (${uncertainties.length}): ${uncertainties.map((u) => u.driver).join(', ') || '---'}`,
    scenarios.length
      ? `سناریوها: ${scenarios.map((s) => s.title).join(' / ')}`
      : 'سناریو: داده کافی برای تولید سناریو وجود ندارد',
    `سوالات روشن‌سازی: ${clarifications.questions.length}`
  ].join('\n');

  const output = {
    executive_brief,
    full_report,
    dashboard: {
      document_profile: classifier,
      coverage,
      clarification_questions: clarifications.questions,
      trends,
      weak_signals: weakSignals,
      critical_uncertainties: uncertainties,
      scenarios: scenarios.length ? scenarios : undefined,
      evidence,
      extraction_quality: extractionQuality
    }
  };

  return OutputComposerSchema.parse(output);
}

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

type ExtractionQuality = { status: 'ok' | 'low'; message?: string };
type UncertaintyStatusToken = 'ok' | 'low';
type ScenarioStatusShape = { status: 'ok' | 'insufficient_data'; reason?: string; missing_information?: string[] };

export function runModule8OutputComposer(params: {
  classifier: DocumentClassifier;
  coverage: CoverageEntry[];
  clarifications: { questions: { id: string; module: string; question: string }[] };
  trends: TrendItem[];
  weakSignals: WeakSignalItem[];
  uncertainties: CriticalUncertainty[];
  uncertaintiesStatus: UncertaintyStatusToken;
  scenarios: Scenario[];
  evidence: EvidenceItem[];
  extractionQuality?: ExtractionQuality;
}): OutputComposer {
  const {
    classifier,
    coverage,
    clarifications,
    trends,
    weakSignals,
    uncertainties,
    uncertaintiesStatus,
    scenarios,
    evidence,
    extractionQuality
  } = params;

  const primaryUncertainty = uncertainties[0];
  const uncertaintyReference =
    primaryUncertainty?.driver ?? primaryUncertainty?.uncertainty_reason ?? 'محرک در دست بررسی';
  const uncertaintyLabels = uncertainties.map((u) => u.driver ?? u.uncertainty_reason ?? '---');

  const scenarioStatus: ScenarioStatusShape = scenarios.length
    ? { status: 'ok' }
    : {
        status: 'insufficient_data',
        reason: 'داده کافی برای تولید سناریو وجود ندارد.',
        missing_information: ['حداقل دو عدم قطعیت بحرانی نیاز است.']
      };

  const criticalUncertaintiesStatus =
    uncertaintiesStatus === 'ok'
      ? { status: 'ok', missing_information: [] }
      : {
          status: 'insufficient_data',
          reason: 'شواهد کافی برای استخراج عدم قطعیت‌ها در متن موجود نیست.',
          missing_information: ['متن بیشتری مورد نیاز است.']
        };

  const executive_brief = `این تحلیل بر اساس سند ${classifier.document_type} در حوزه ${classifier.domain} انجام شد. مهم‌ترین روند، «${trends[0]?.label ?? 'شناسایی اولیه روند'}» و نامطمئن‌ترین محرک «${uncertaintyReference}» است.`;

  const coverageSummary = coverage
    .map((c) => `${c.module}: ${c.status}`)
    .join(' | ');

  const full_report = [
    `نوع سند: ${classifier.document_type} | افق: ${classifier.horizon} | سطح تحلیل: ${classifier.analytical_level}`,
    `پوشش ماژول‌ها: ${coverageSummary}`,
    `روندها (${trends.length}): ${trends.map((t) => t.label).join(', ') || '---'}`,
    `نشانه‌های ضعیف (${weakSignals.length}): ${weakSignals.map((w) => w.signal).join(', ') || '---'}`,
    `عدم قطعیت‌های بحرانی (${uncertainties.length}): ${uncertaintyLabels.join(', ') || '---'}`,
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
      critical_uncertainties_status: criticalUncertaintiesStatus,
      scenarios: scenarios.length ? scenarios : undefined,
      scenarios_status: scenarioStatus,
      evidence,
      extraction_quality: extractionQuality
    }
  };

  return OutputComposerSchema.parse(output);
}

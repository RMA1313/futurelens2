import {
  CoverageEntry,
  CriticalUncertainty,
  DocumentClassifier,
  EvidenceItem,
  OutputComposer,
  OutputComposerSchema,
  Scenario,
  Steepd,
  TrendItem,
  WeakSignalItem
} from '../../schemas/modules';

type ExtractionQuality = { status: 'ok' | 'low'; message?: string };
type UncertaintyStatusToken = 'ok' | 'low';
type ScenarioStatusShape = { status: 'ok' | 'insufficient_data'; reason?: string; missing_information?: string[] };

const STEEPD_CATEGORIES: (keyof Steepd)[] = [
  'social',
  'technological',
  'economic',
  'environmental',
  'political',
  'defense'
];

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

  const hasContent = Boolean(
    trends.length || weakSignals.length || uncertainties.length || scenarios.length || coverage.length
  );
  const executive_summary = hasContent
    ? buildExecutiveSummary({
        classifier,
        trends,
        weakSignals,
        uncertainties,
        scenarios,
        uncertaintyReference
      })
    : '';
  const executive_key_points = hasContent
    ? buildExecutiveKeyPoints({
        trends,
        weakSignals,
        uncertainties,
        scenarios,
        uncertaintyReference
      })
    : [];
  const steepd = hasContent
    ? buildSteepd({ trends, weakSignals, uncertainties, scenarios, clarifications, evidence })
    : emptySteepd();

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
    executive_summary,
    executive_key_points,
    full_report,
    steepd,
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

type ExecutiveSummaryParams = {
  classifier: DocumentClassifier;
  trends: TrendItem[];
  weakSignals: WeakSignalItem[];
  uncertainties: CriticalUncertainty[];
  scenarios: Scenario[];
  uncertaintyReference: string;
};

function buildExecutiveSummary(params: ExecutiveSummaryParams) {
  const { classifier, trends, weakSignals, uncertainties, scenarios, uncertaintyReference } = params;
  const sentences: string[] = [];
  sentences.push(
    `این گزارش بر اساس سند ${classifier.document_type} در حوزه ${classifier.domain} با افق ${classifier.horizon} و سطح تحلیل ${classifier.analytical_level} تهیه شده است.`
  );

  if (trends[0]?.label) {
    const trend = trends[0];
    const categoryDesc = trend.category ? `${trend.category}` : 'تحولات کلان';
    sentences.push(
      `روند برجسته «${trend.label}» در چارچوب ${categoryDesc} نشان می‌دهد بازیگران باید برای بازآرایی سریع آماده باشند.`
    );
  }

  const riskFragments: string[] = [];
  if (weakSignals[0]?.signal) {
    riskFragments.push(`نشانه ضعیف «${weakSignals[0].signal}»`);
  }
  if (uncertainties.length && uncertaintyReference) {
    riskFragments.push(`عدم قطعیت ${uncertaintyReference}`);
  }
  if (riskFragments.length) {
    sentences.push(
      `${riskFragments.join(' و ')} ریسک‌ها و فرصت‌های همزمان را یادآوری می‌کنند و رصد مداوم را ضروری می‌سازند.`
    );
  }

  const scenarioTitle = scenarios[0]?.title;
  if (scenarioTitle) {
    sentences.push(
      `سناریوی «${scenarioTitle}» مسیرهای احتمالی را روشن کرده و بازنگری دوره‌ای برنامه‌ها را ضروری می‌سازد.`
    );
  } else {
    sentences.push('بنابراین، بازخوانی سریع‌تر داده‌ها و تنظیم دوره‌ای تحلیل برای آمادگی تصمیمی توصیه می‌شود.');
  }

  return sentences.map(cleanSentence).filter(Boolean).join(' ');
}

function buildExecutiveKeyPoints(params: {
  trends: TrendItem[];
  weakSignals: WeakSignalItem[];
  uncertainties: CriticalUncertainty[];
  scenarios: Scenario[];
  uncertaintyReference: string;
}) {
  const { trends, weakSignals, uncertainties, scenarios, uncertaintyReference } = params;
  const candidates: string[] = [];
  const trend = trends[0];
  if (trend?.label) {
    const categoryDesc = trend.category ? `${trend.category}` : 'تحولات کلان';
    candidates.push(`روند «${trend.label}» در چارچوب ${categoryDesc} بازتعریف روند تصمیم‌گیری را مطالبه می‌کند.`);
  }
  if (weakSignals[0]?.signal) {
    candidates.push(`نشانه ضعیف «${weakSignals[0].signal}» ارزش رصد زودهنگام را یادآور می‌شود.`);
  }
  if (uncertainties.length && uncertaintyReference) {
    candidates.push(`عدم قطعیت ${uncertaintyReference} همچنان مخاطره‌ای حیاتی است که باید پاسخ ساختاری بگیرد.`);
  }
  if (scenarios[0]?.title) {
    candidates.push(`سناریوی «${scenarios[0].title}» چارچوب تصمیمی واضح‌تری برای واکنش‌های بعدی فراهم می‌آورد.`);
  }
  return buildUniquePoints(candidates, 2);
}

function cleanSentence(value?: string) {
  if (!value) return '';
  return value.replace(/\s+/g, ' ').trim();
}

function buildSteepd(params: {
  trends: TrendItem[];
  weakSignals: WeakSignalItem[];
  uncertainties: CriticalUncertainty[];
  scenarios: Scenario[];
  clarifications: { questions: { question: string }[] };
  evidence: EvidenceItem[];
}): Steepd {
  const seeds: Record<keyof Steepd, (string | undefined)[]> = {
    social: [...params.scenarios.flatMap((s) => s.implications)],
    technological: [...params.trends.map((t) => t.label), ...params.weakSignals.map((w) => w.signal)],
    economic: [...params.weakSignals.map((w) => w.rationale), ...params.scenarios.map((s) => s.summary)],
    environmental: [
      ...params.uncertainties.map((u) => u.driver),
      ...params.uncertainties.map((u) => u.impact)
    ],
    political: [
      ...params.clarifications.questions.map((q) => q.question),
      ...params.scenarios.map((s) => s.title)
    ],
    defense: [
      ...params.scenarios.flatMap((s) => s.indicators),
      ...params.evidence.map((e) => e.snippet)
    ]
  };

  return STEEPD_CATEGORIES.reduce((acc, key) => {
    acc[key] = buildUniquePoints(seeds[key]);
    return acc;
  }, {} as Steepd);
}

function emptySteepd(): Steepd {
  return STEEPD_CATEGORIES.reduce((acc, key) => {
    acc[key] = [];
    return acc;
  }, {} as Steepd);
}

function buildUniquePoints(values: (string | undefined)[], limit = 4) {
  return Array.from(
    new Set(values.map((value) => normalizeText(value)).filter(Boolean))
  ).slice(0, limit);
}

function normalizeText(value?: string, maxLength = 160) {
  if (!value) return '';
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) return '';
  return normalized.length <= maxLength
    ? normalized
    : `${normalized.slice(0, maxLength).trim()}…`;
}

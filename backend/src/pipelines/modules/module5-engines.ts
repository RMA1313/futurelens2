import { nanoid } from 'nanoid';
import { z } from 'zod';
import {
  CoverageEntry,
  CriticalUncertainty,
  CriticalUncertaintySchema,
  TrendItem,
  TrendItemSchema,
  WeakSignalItem,
  WeakSignalItemSchema,
  EvidenceItem
} from '../../schemas/modules';
import { module5TrendsPrompt } from '../../prompts/module5-trends';
import { module5WeakSignalsPrompt } from '../../prompts/module5-weak-signals';
import { module5UncertaintiesPrompt } from '../../prompts/module5-uncertainties';
import { callStructuredLLM } from '../../services/llm/client';

type Module5Result = {
  trends: TrendItem[];
  weak_signals: WeakSignalItem[];
  critical_uncertainties: CriticalUncertainty[];
};

function pickEvidenceIds(evidence: EvidenceItem[], count: number): string[] {
  return evidence.slice(0, count).map((e) => e.id);
}

function fallbackTrends(status: string, evidence: EvidenceItem[], domain: string): TrendItem[] {
  if (status === 'inactive') return [];
  return [
    TrendItemSchema.parse({
      id: `t-${nanoid(5)}`,
      label: `روند غالب در حوزه ${domain}`,
      category: 'trend',
      direction: 'صعودی',
      strength: status === 'partial' ? 'متوسط' : 'قوی',
      evidence_ids: pickEvidenceIds(evidence, 2),
      label_type: 'inference',
      confidence: 0.58
    })
  ];
}

function fallbackWeak(evidence: EvidenceItem[]): WeakSignalItem[] {
  if (!evidence.length) return [];
  return [
    WeakSignalItemSchema.parse({
      id: `w-${nanoid(5)}`,
      signal: 'نشانه اولیه تغییر در رفتار بازیگران',
      rationale: 'چند اشاره محدود به تغییر سیاست/فناوری دیده می‌شود.',
      evolution: 'در صورت تداوم به روند تثبیت‌شده تبدیل می‌شود.',
      evidence_ids: pickEvidenceIds(evidence, 1),
      label_type: 'inference',
      confidence: 0.52
    })
  ];
}

function fallbackUncertainty(evidence: EvidenceItem[]): CriticalUncertainty[] {
  if (!evidence.length) return [];
  return [
    CriticalUncertaintySchema.parse({
      id: `u-${nanoid(5)}`,
      driver: 'وابستگی به تصمیمات سیاستی یا فناوری خارجی',
      impact: 'تعیین‌کننده سرعت یا شکست برنامه‌های آینده',
      uncertainty_reason: 'ابهام درباره مسیر سرمایه‌گذاری و مقررات',
      evidence_ids: pickEvidenceIds(evidence, 2),
      label_type: 'inference',
      confidence: 0.5
    })
  ];
}

export async function runModule5Engines(
  coverage: CoverageEntry[],
  evidence: EvidenceItem[],
  classifierDomain: string
): Promise<Module5Result> {
  const coverageMap = Object.fromEntries(coverage.map((c) => [c.module, c.status]));
  const evidencePayload = evidence.map((e) => ({
    id: e.id,
    kind: e.kind,
    chunk_id: e.chunk_id,
    snippet: e.snippet
  }));

  const trendsSchema = z.object({ trends: z.array(TrendItemSchema) });
  const weakSchema = z.object({ weak_signals: z.array(WeakSignalItemSchema) });
  const uncSchema = z.object({ critical_uncertainties: z.array(CriticalUncertaintySchema) });

  const trendsCoverage = coverageMap['trends'] ?? 'inactive';
  const weakCoverage = coverageMap['weak_signals'] ?? 'inactive';
  const uncCoverage = coverageMap['critical_uncertainties'] ?? 'inactive';

  const trends =
    trendsCoverage === 'inactive'
      ? []
      : (
          await callStructuredLLM<{ trends: TrendItem[] }>({
            prompt: module5TrendsPrompt,
            input: {
              coverage_status: trendsCoverage,
              domain: classifierDomain,
              evidence: evidencePayload
            },
            schema: trendsSchema,
            fallback: () => ({ trends: fallbackTrends(trendsCoverage, evidence, classifierDomain) })
          })
        ).trends;

  const weak_signals =
    weakCoverage === 'inactive'
      ? []
      : (
          await callStructuredLLM<{ weak_signals: WeakSignalItem[] }>({
            prompt: module5WeakSignalsPrompt,
            input: {
              coverage_status: weakCoverage,
              evidence: evidencePayload
            },
            schema: weakSchema,
            fallback: () => ({ weak_signals: fallbackWeak(evidence) })
          })
        ).weak_signals;

  const critical_uncertainties =
    uncCoverage === 'inactive'
      ? []
      : (
          await callStructuredLLM<{ critical_uncertainties: CriticalUncertainty[] }>({
            prompt: module5UncertaintiesPrompt,
            input: {
              coverage_status: uncCoverage,
              evidence: evidencePayload
            },
            schema: uncSchema,
            fallback: () => ({ critical_uncertainties: fallbackUncertainty(evidence) })
          })
        ).critical_uncertainties;

  return { trends, weak_signals, critical_uncertainties };
}

export type { Module5Result };

'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../../components/layout/AppShell';
import { HealthStatus } from '../../../../components/system/HealthStatus';
import { fetchJob, fetchReport } from '../../../../lib/api';
import type { Report, EvidenceItem } from '../../../../lib/schemas';
import { DocumentProfileCard } from '../../../../components/dashboard/DocumentProfileCard';
import { CoveragePanel } from '../../../../components/dashboard/CoveragePanel';
import { ControlsPanel } from '../../../../components/dashboard/ControlsPanel';
import { AnalysisPanel } from '../../../../components/dashboard/AnalysisPanel';
import { ScenariosPanel } from '../../../../components/dashboard/ScenariosPanel';
import { EvidenceDrawer } from '../../../../components/evidence/EvidenceDrawer';
import { ExportPanel } from '../../../../components/dashboard/ExportPanel';
import { ClarificationPanel } from '../../../../components/job/ClarificationPanel';
import { formatDateTime, formatId } from '../../../../lib/format';

type ViewState = 'loading' | 'ready' | 'not-ready' | 'error';

export default function ResultsPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const router = useRouter();

  const [view, setView] = React.useState<ViewState>('loading');
  const [report, setReport] = React.useState<Report | null>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');

  const [minConfidence, setMinConfidence] = React.useState(0);
  const [labels, setLabels] = React.useState<Record<string, boolean>>({
    fact: true,
    inference: true,
    assumption: true
  });
  const [focusMode, setFocusMode] = React.useState(false);
  const [compareMode, setCompareMode] = React.useState(false);
  const [compareIds, setCompareIds] = React.useState<string[]>([]);
  const [evidenceOpenId, setEvidenceOpenId] = React.useState<string | null>(null);
  const [highlightPanelId, setHighlightPanelId] = React.useState<string | null>(null);
  const [clarificationState, setClarificationState] = React.useState<'idle' | 'updating' | 'updated' | 'timeout' | 'error'>('idle');
  const [diffSets, setDiffSets] = React.useState<{
    trends: Set<string>;
    weakSignals: Set<string>;
    uncertainties: Set<string>;
    scenarios: Set<string>;
    profile: boolean;
    coverage: boolean;
  }>({
    trends: new Set(),
    weakSignals: new Set(),
    uncertainties: new Set(),
    scenarios: new Set(),
    profile: false,
    coverage: false
  });

  const reportRef = React.useRef<Report | null>(null);

  const load = React.useCallback(async () => {
    try {
      const job = await fetchJob(jobId);
      if (job.status !== 'succeeded') {
        setView('not-ready');
        setError('نتایج هنوز آماده نیست.');
        return;
      }
      const rep = await fetchReport(jobId);
      setReport(rep);
      reportRef.current = rep;
      setDiffSets({
        trends: new Set(),
        weakSignals: new Set(),
        uncertainties: new Set(),
        scenarios: new Set(),
        profile: false,
        coverage: false
      });
      setClarificationState('idle');
      setLastUpdated(new Date().toLocaleString('fa-IR'));
      setView('ready');
      setError(null);
    } catch (err) {
      setError('خطا در دریافت گزارش.');
      setView('error');
    }
  }, [jobId]);

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production' && report) {
      const count = report.dashboard?.critical_uncertainties?.length ?? 0;
      console.debug('[critical-uncertainties] report', { jobId, count });
    }
  }, [report, jobId]);

  const evidence: EvidenceItem[] = report?.dashboard?.evidence ?? [];
  const clarifications = report?.dashboard?.clarification_questions ?? [];

  const toggleLabel = (label: string) => {
    setLabels((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const toggleCompareId = (id: string) => {
    setCompareIds((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 2) return [prev[1], id];
      return [...prev, id];
    });
    setCompareMode(true);
  };

  const filterState = {
    minConfidence,
    labels,
    focusMode,
    compareIds,
    onToggleCompare: toggleCompareId
  };

  const handleCoverageSelect = (moduleName: string) => {
    const normalized = moduleName.toLowerCase();
    const map: { id: string; match: (name: string) => boolean }[] = [
      { id: 'panel-document', match: (name) => name.includes('document') || name.includes('پروفایل') },
      { id: 'panel-coverage', match: (name) => name.includes('coverage') || name.includes('پوشش') },
      { id: 'panel-trends', match: (name) => name.includes('trend') || name.includes('روند') },
      { id: 'panel-weak-signals', match: (name) => name.includes('weak') || name.includes('نشانه') },
      { id: 'panel-uncertainties', match: (name) => name.includes('uncertainty') || name.includes('عدم قطعیت') },
      { id: 'panel-scenarios', match: (name) => name.includes('scenario') || name.includes('سناریو') },
      { id: 'panel-evidence', match: (name) => name.includes('evidence') || name.includes('شاهد') }
    ];
    const target = map.find((entry) => entry.match(normalized))?.id;
    const targetId = target ?? 'panel-coverage';
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setHighlightPanelId(targetId);
      window.setTimeout(() => setHighlightPanelId(null), 1500);
    }
  };

  const startClarificationPolling = async () => {
    const baseline = reportRef.current;
    if (!baseline) return;
    setClarificationState('updating');
    const maxAttempts = 8;
    let delay = 1500;
    for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay + 1200, 5000);
      try {
        const nextReport = await fetchReport(jobId);
        const isChanged = !reportsEqual(baseline, nextReport);
        if (isChanged) {
          setReport(nextReport);
          reportRef.current = nextReport;
          setLastUpdated(new Date().toLocaleString('fa-IR'));
          setDiffSets(buildDiff(baseline, nextReport));
          setClarificationState('updated');
          return;
        }
      } catch (err) {
        setClarificationState('error');
        return;
      }
    }
    setClarificationState('timeout');
  };

  const compareSection =
    compareMode && compareIds.length ? (
      <div className="card">
        <div className="headline" style={{ fontSize: 18 }}>
          مقایسه انتخاب‌ها
        </div>
        <p className="subhead">برای مقایسه، حداکثر دو مورد را انتخاب کنید.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {compareIds.map((id) => (
            <div key={id} className="card" style={{ background: 'var(--color-surface-2)' }}>
              <div style={{ fontWeight: 800 }}>شناسه مورد: {formatId(id)}</div>
              <div className="subhead">جزئیات مقایسه در این بخش نمایش داده می‌شود.</div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <AppShell
      title="داشبورد نتایج"
    >
      <section className="card" style={{ borderColor: 'rgba(106,216,255,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <h2 className="headline" style={{ fontSize: 22 }}>
              جزئیات تحلیل
            </h2>
            <p className="subhead">
              شناسه تحلیل: {formatId(jobId)} | آخرین به‌روزرسانی: {formatDateTime(lastUpdated || 'در حال بارگذاری')}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <HealthStatus />
            <button className="button button-secondary" type="button" onClick={() => router.push(`/jobs/${jobId}`)}>
              بازگشت به وضعیت تحلیل
            </button>
            <button className="button button-secondary" type="button" onClick={load}>
              به‌روزرسانی
            </button>
          </div>
        </div>
      </section>

      {view === 'loading' ? (
        <section className="card">
          <div className="headline" style={{ fontSize: 18 }}>
            در حال بارگذاری نتایج...
          </div>
          <div className="subhead">لطفا کمی صبر کنید.</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
            <div className="skeleton" style={{ height: 160 }} />
          </div>
        </section>
      ) : null}

      {view === 'not-ready' ? (
        <section className="card">
          <div className="headline" style={{ fontSize: 18 }}>نتایج هنوز آماده نیست.</div>
          <div className="subhead">برای مشاهده نتایج، منتظر پایان تحلیل بمانید.</div>
          <button className="button button-primary" onClick={() => router.push(`/jobs/${jobId}`)}>
            بازگشت به وضعیت تحلیل
          </button>
        </section>
      ) : null}

      {view === 'error' ? (
        <section className="card">
          <div className="headline" style={{ fontSize: 18, color: '#ff9b9b' }}>
            خطا در دریافت گزارش
          </div>
          <div className="subhead">{error}</div>
          <button className="button button-primary" onClick={load}>
            تلاش دوباره
          </button>
        </section>
      ) : null}

      {view === 'ready' && report ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '2fr 1fr',
            gap: 12,
            alignItems: 'start'
          }}
        >
          <div className="section-grid">
            <DocumentProfileCard
              profile={report.dashboard?.document_profile}
              highlight={highlightPanelId === 'panel-document' || diffSets.profile}
              panelId="panel-document"
            />
            <CoveragePanel
              coverage={report.dashboard?.coverage}
              onSelect={handleCoverageSelect}
              highlight={highlightPanelId === 'panel-coverage' || diffSets.coverage}
            />

            <AnalysisPanel
              title="روندها"
              items={report.dashboard?.trends?.map((t, index) => ({
                id: t.id,
                key: t.id ?? `${hashTrend(t)}-${index}`,
                title: t.label,
                rationale: t.rationale,
                category: t.category,
                direction: t.direction,
                strength: t.strength,
                label_type: t.label_type as any,
                confidence: t.confidence,
                evidence_ids: t.evidence_ids
              }))}
              evidence={evidence}
              onEvidenceClick={setEvidenceOpenId}
              filter={filterState}
              changedIds={diffSets.trends}
              panelId="panel-trends"
              highlight={highlightPanelId === 'panel-trends'}
              showTrendMeta
            />

            <AnalysisPanel
              title="نشانه‌های ضعیف"
              items={report.dashboard?.weak_signals?.map((w, index) => ({
                id: w.id,
                key: w.id ?? `${hashWeakSignal(w)}-${index}`,
                title: w.signal,
                rationale: w.rationale,
                evolution: w.evolution,
                label_type: w.label_type as any,
                confidence: w.confidence,
                evidence_ids: w.evidence_ids
              }))}
              evidence={evidence}
              onEvidenceClick={setEvidenceOpenId}
              filter={filterState}
              changedIds={diffSets.weakSignals}
              panelId="panel-weak-signals"
              highlight={highlightPanelId === 'panel-weak-signals'}
            />

            <AnalysisPanel
              title="عدم قطعیت‌های کلیدی"
              items={report.dashboard?.critical_uncertainties?.map((u, index) => ({
                id: u.id,
                key: u.id ?? `${hashUncertainty(u)}-${index}`,
                title: u.driver,
                rationale: u.uncertainty_reason,
                impact: u.impact,
                label_type: u.label_type as any,
                confidence: u.confidence,
                evidence_ids: u.evidence_ids
              }))}
              evidence={evidence}
              onEvidenceClick={setEvidenceOpenId}
              filter={filterState}
              changedIds={diffSets.uncertainties}
              panelId="panel-uncertainties"
              highlight={highlightPanelId === 'panel-uncertainties'}
            />

            <ScenariosPanel
              scenarios={report.dashboard?.scenarios?.map((s, index) => ({
                ...s,
                key: s.id ?? `${hashScenario(s)}-${index}`
              }))}
              evidence={evidence}
              onEvidenceClick={setEvidenceOpenId}
              filter={filterState}
              changedIds={diffSets.scenarios}
              panelId="panel-scenarios"
              highlight={highlightPanelId === 'panel-scenarios'}
            />

            {compareSection}
          </div>

          <div className="section-grid">
            <ControlsPanel
              minConfidence={minConfidence}
              onConfidenceChange={setMinConfidence}
              labels={labels}
              onToggleLabel={toggleLabel}
              focusMode={focusMode}
              onToggleFocus={() => setFocusMode((p) => !p)}
              compareMode={compareMode}
              onToggleCompare={() => setCompareMode((p) => !p)}
            />

            <div className={`card ${highlightPanelId === 'panel-evidence' ? 'panel-highlight' : ''}`} id="panel-evidence">
              <div className="headline" style={{ fontSize: 18 }}>
                مرور شواهد
              </div>
              <div className="subhead">
                برای دیدن منبع هر ادعا، روی برچسب شاهد کلیک کنید.
              </div>
            </div>

            {clarifications.length ? (
              <div className="card">
                <div className="headline" style={{ fontSize: 18 }}>
                  روشن‌سازی و اجرای مجدد
                </div>
                <div className="subhead" style={{ marginBottom: 10 }}>
                  پاسخ به سوالات روشن‌سازی باعث بهبود کیفیت تحلیل می‌شود.
                </div>
                <ClarificationPanel jobId={jobId} questions={clarifications} onSubmitted={startClarificationPolling} />
                {clarificationState === 'updating' ? (
                  <div className="pill" style={{ marginTop: 10 }}>
                    در حال دریافت نسخه به‌روزشده گزارش...
                  </div>
                ) : null}
                {clarificationState === 'updated' ? (
                  <div className="pill" style={{ marginTop: 10 }}>
                    گزارش به‌روزرسانی شد و تغییرات برجسته شدند.
                  </div>
                ) : null}
                {clarificationState === 'timeout' ? (
                  <div className="pill" style={{ marginTop: 10 }}>
                    به‌روزرسانی در زمان مقرر دریافت نشد. کمی بعد دوباره تلاش کنید.
                  </div>
                ) : null}
                {clarificationState === 'error' ? (
                  <div className="pill" style={{ marginTop: 10, color: '#ff9b9b' }}>
                    خطا در دریافت نسخه جدید گزارش.
                  </div>
                ) : null}
              </div>
            ) : null}

            <ExportPanel report={report} jobId={jobId} />
          </div>
        </div>
      ) : null}

      <EvidenceDrawer
        evidence={evidence}
        openId={evidenceOpenId}
        onClose={() => setEvidenceOpenId(null)}
        onSelect={(id) => setEvidenceOpenId(id)}
        extractionQuality={report?.dashboard?.extraction_quality}
      />
    </AppShell>
  );
}

function reportsEqual(prev?: Report | null, next?: Report | null) {
  if (!prev || !next) return false;
  return buildSignature(prev) === buildSignature(next);
}

function buildSignature(report: Report) {
  const profile = report.dashboard?.document_profile
    ? [
        report.dashboard.document_profile.document_type,
        report.dashboard.document_profile.domain,
        report.dashboard.document_profile.horizon,
        report.dashboard.document_profile.analytical_level,
        ...(report.dashboard.document_profile.limitations ?? [])
      ].join('|')
    : '';
  const coverage = (report.dashboard?.coverage ?? [])
    .map((c) => `${c.module}:${c.status}:${(c.missing_information ?? []).join(',')}`)
    .join('|');
  const trends = (report.dashboard?.trends ?? []).map(hashTrend).join('|');
  const weakSignals = (report.dashboard?.weak_signals ?? []).map(hashWeakSignal).join('|');
  const uncertainties = (report.dashboard?.critical_uncertainties ?? []).map(hashUncertainty).join('|');
  const scenarios = (report.dashboard?.scenarios ?? []).map(hashScenario).join('|');
  const clarifications = (report.dashboard?.clarification_questions ?? []).map((q) => `${q.id}:${q.question}`).join('|');
  return [profile, coverage, trends, weakSignals, uncertainties, scenarios, clarifications].join('||');
}

function buildDiff(prev: Report, next: Report) {
  const prevTrendMap = buildItemMap(prev.dashboard?.trends ?? [], hashTrend);
  const nextTrendMap = buildItemMap(next.dashboard?.trends ?? [], hashTrend);
  const prevWeakMap = buildItemMap(prev.dashboard?.weak_signals ?? [], hashWeakSignal);
  const nextWeakMap = buildItemMap(next.dashboard?.weak_signals ?? [], hashWeakSignal);
  const prevUncertaintyMap = buildItemMap(prev.dashboard?.critical_uncertainties ?? [], hashUncertainty);
  const nextUncertaintyMap = buildItemMap(next.dashboard?.critical_uncertainties ?? [], hashUncertainty);
  const prevScenarioMap = buildItemMap(prev.dashboard?.scenarios ?? [], hashScenario);
  const nextScenarioMap = buildItemMap(next.dashboard?.scenarios ?? [], hashScenario);

  return {
    trends: findChangedIds(prevTrendMap, nextTrendMap),
    weakSignals: findChangedIds(prevWeakMap, nextWeakMap),
    uncertainties: findChangedIds(prevUncertaintyMap, nextUncertaintyMap),
    scenarios: findChangedIds(prevScenarioMap, nextScenarioMap),
    profile: hashProfile(prev.dashboard?.document_profile) !== hashProfile(next.dashboard?.document_profile),
    coverage: hashCoverage(prev.dashboard?.coverage) !== hashCoverage(next.dashboard?.coverage)
  };
}

function buildItemMap<T extends { id?: string }>(items: T[], hashFn: (item: T) => string) {
  const map = new Map<string, string>();
  items.forEach((item, index) => {
    const key = item.id || `${hashFn(item)}-${index}`;
    map.set(key, hashFn(item));
  });
  return map;
}

function findChangedIds(prev: Map<string, string>, next: Map<string, string>) {
  const changed = new Set<string>();
  next.forEach((hash, key) => {
    const prevHash = prev.get(key);
    if (!prevHash || prevHash !== hash) changed.add(key);
  });
  return changed;
}

function hashTrend(item: any) {
  return [
    item.id,
    item.label,
    item.category,
    item.direction,
    item.strength,
    item.confidence,
    item.rationale,
    (item.evidence_ids ?? []).join(',')
  ].join('|');
}

function hashWeakSignal(item: any) {
  return [
    item.id,
    item.signal,
    item.rationale,
    item.evolution,
    item.confidence,
    (item.evidence_ids ?? []).join(',')
  ].join('|');
}

function hashUncertainty(item: any) {
  return [
    item.id,
    item.driver,
    item.impact,
    item.uncertainty_reason,
    item.confidence,
    (item.evidence_ids ?? []).join(',')
  ].join('|');
}

function hashScenario(item: any) {
  return [
    item.id,
    item.title,
    item.summary,
    (item.implications ?? []).join(','),
    (item.indicators ?? []).join(','),
    item.confidence,
    (item.evidence_ids ?? []).join(',')
  ].join('|');
}

function hashProfile(profile?: Report['dashboard']['document_profile']) {
  if (!profile) return '';
  return [
    profile.document_type,
    profile.domain,
    profile.horizon,
    profile.analytical_level,
    (profile.limitations ?? []).join(',')
  ].join('|');
}

function hashCoverage(coverage?: Report['dashboard']['coverage']) {
  return (coverage ?? [])
    .map((c) => `${c.module}:${c.status}:${(c.missing_information ?? []).join(',')}`)
    .join('|');
}

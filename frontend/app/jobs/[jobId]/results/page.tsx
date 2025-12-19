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
      setLastUpdated(new Date().toLocaleString('fa-IR'));
      setView('ready');
      setError(null);
    } catch (err) {
      setError('خطا در دریافت گزارش');
      setView('error');
    }
  }, [jobId]);

  React.useEffect(() => {
    load();
  }, [load]);

  const evidence: EvidenceItem[] = report?.dashboard?.evidence ?? [];

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

  const compareSection =
    compareMode && compareIds.length ? (
      <div className="card">
        <div className="headline" style={{ fontSize: 18 }}>نمای مقایسه</div>
        <p className="subhead">مقایسه دو مورد انتخاب شده از پانل‌های بالا.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {compareIds.map((id) => (
            <div key={id} className="card" style={{ background: 'var(--color-surface-2)' }}>
              <div style={{ fontWeight: 800 }}>مورد {id}</div>
              <div className="subhead">اطلاعات تفصیلی در پانل اصلی</div>
            </div>
          ))}
        </div>
      </div>
    ) : null;

  return (
    <AppShell
      title="داشبورد نتایج"
      subtitle="فضای وضعیت‌روم: شناسنامه سند → پوشش → شواهد → تحلیل مشتق → سناریو → خروجی."
    >
      <section className="card" style={{ borderColor: 'rgba(106,216,255,0.25)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
          <div>
            <h2 className="headline" style={{ fontSize: 22 }}>وضعیت گزارش</h2>
            <p className="subhead">
              jobId: {jobId} | آخرین به‌روزرسانی: {lastUpdated || 'در حال بارگیری'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <HealthStatus />
            <button className="button button-secondary" type="button" onClick={() => router.push(`/jobs/${jobId}`)}>
              بازگشت به وضعیت
            </button>
            <button className="button button-secondary" type="button" onClick={load}>
              تازه‌سازی
            </button>
          </div>
        </div>
      </section>

      {view === 'loading' ? (
        <section className="card">
          <div className="headline" style={{ fontSize: 18 }}>در حال بارگذاری نتایج...</div>
          <div className="subhead">لطفاً کمی صبر کنید.</div>
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <div className="skeleton" style={{ height: 14, width: '60%' }} />
            <div className="skeleton" style={{ height: 14, width: '40%' }} />
            <div className="skeleton" style={{ height: 160 }} />
          </div>
        </section>
      ) : null}

      {view === 'not-ready' ? (
        <section className="card">
          <div className="headline" style={{ fontSize: 18 }}>نتایج هنوز آماده نیست</div>
          <div className="subhead">برای مشاهده وضعیت اجرا به صفحه شغل بازگردید.</div>
          <button className="button button-primary" onClick={() => router.push(`/jobs/${jobId}`)}>
            بازگشت به وضعیت
          </button>
        </section>
      ) : null}

      {view === 'error' ? (
        <section className="card">
          <div className="headline" style={{ fontSize: 18, color: '#ff9b9b' }}>خطا در دریافت گزارش</div>
          <div className="subhead">{error}</div>
          <button className="button button-primary" onClick={load}>
            تلاش مجدد
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
            <DocumentProfileCard profile={report.dashboard?.document_profile} />
            <CoveragePanel coverage={report.dashboard?.coverage} />

            <AnalysisPanel
              title="روندها"
              items={report.dashboard?.trends?.map((t) => ({
                id: t.id,
                title: t.label,
                rationale: t.rationale,
                category: t.category,
                label_type: t.label_type as any,
                confidence: t.confidence,
                evidence_ids: t.evidence_ids
              }))}
              evidence={evidence}
              onEvidenceClick={setEvidenceOpenId}
              filter={filterState}
            />

            <AnalysisPanel
              title="نشانه‌های ضعیف"
              items={report.dashboard?.weak_signals?.map((w) => ({
                id: w.id,
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
            />

            <AnalysisPanel
              title="عدم قطعیت‌های بحرانی"
              items={report.dashboard?.critical_uncertainties?.map((u) => ({
                id: u.id,
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
            />

            <ScenariosPanel
              scenarios={report.dashboard?.scenarios}
              evidence={evidence}
              onEvidenceClick={setEvidenceOpenId}
              filter={filterState}
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

            <div className="card">
              <div className="headline" style={{ fontSize: 18 }}>اکسپلورر شواهد</div>
              <div className="subhead">برای مشاهده، روی برچسب‌های شاهد در کارت‌ها کلیک کنید.</div>
            </div>

            <ExportPanel report={report} jobId={jobId} />
          </div>
        </div>
      ) : null}

      <EvidenceDrawer
        evidence={evidence}
        openId={evidenceOpenId}
        onClose={() => setEvidenceOpenId(null)}
        onSelect={(id) => setEvidenceOpenId(id)}
      />
    </AppShell>
  );
}

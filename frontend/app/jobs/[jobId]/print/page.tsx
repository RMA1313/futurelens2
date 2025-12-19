'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { fetchReport } from '../../../../lib/api';
import type { Report } from '../../../../lib/schemas';

export default function PrintPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const [report, setReport] = React.useState<Report | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const rep = await fetchReport(jobId);
        setReport(rep);
      } catch (_) {
        setReport(null);
      }
    })();
  }, [jobId]);

  return (
    <div
      style={{
        fontFamily: 'Vazirmatn, system-ui',
        background: '#fff',
        color: '#111',
        padding: '24px',
        direction: 'rtl'
      }}
    >
      <h1 style={{ marginTop: 0 }}>گزارش چاپی فیچرلنز</h1>
      <p>jobId: {jobId}</p>
      {!report ? (
        <p>گزارش در دسترس نیست.</p>
      ) : (
        <>
          <h2>شناسنامه سند</h2>
          <ul>
            <li>نوع سند: {report.dashboard.document_profile?.document_type ?? '---'}</li>
            <li>حوزه: {report.dashboard.document_profile?.domain ?? '---'}</li>
            <li>افق زمانی: {report.dashboard.document_profile?.horizon ?? '---'}</li>
            <li>سطح تحلیل: {report.dashboard.document_profile?.analytical_level ?? '---'}</li>
          </ul>

          <h2>پوشش ماژول‌ها</h2>
          <ul>
            {(report.dashboard.coverage ?? []).map((c) => (
              <li key={c.module}>
                {c.module} - {c.status}
              </li>
            ))}
          </ul>

          <h2>روندها</h2>
          <ul>
            {(report.dashboard.trends ?? []).map((t) => (
              <li key={t.id}>
                {t.label} | اطمینان: {t.confidence ?? '---'}
              </li>
            ))}
          </ul>

          <h2>نشانه‌های ضعیف</h2>
          <ul>
            {(report.dashboard.weak_signals ?? []).map((w) => (
              <li key={w.id}>
                {w.signal} | اطمینان: {w.confidence ?? '---'}
              </li>
            ))}
          </ul>

          <h2>عدم قطعیت‌های بحرانی</h2>
          <ul>
            {(report.dashboard.critical_uncertainties ?? []).map((u) => (
              <li key={u.id}>
                {u.driver} | اطمینان: {u.confidence ?? '---'}
              </li>
            ))}
          </ul>

          <h2>سناریوها</h2>
          <ul>
            {(report.dashboard.scenarios ?? []).map((s) => (
              <li key={s.id}>
                {s.title} | {s.summary}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

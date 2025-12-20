'use client';

import React from 'react';
import { useParams } from 'next/navigation';
import { fetchReport } from '../../../../lib/api';
import type { Report } from '../../../../lib/schemas';
import { formatId, formatNumber } from '../../../../lib/format';

const coverageLabel: Record<string, string> = {
  active: 'فعال',
  partial: 'جزئی',
  inactive: 'غیرفعال'
};

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
      className="print-page"
      style={{
        fontFamily: 'Vazirmatn, system-ui',
        background: '#fff',
        color: '#111',
        padding: '24px',
        direction: 'rtl'
      }}
    >
      <style>{`
        @media print {
          .print-page {
            padding: 0;
          }
          .print-section {
            break-inside: avoid;
            page-break-inside: avoid;
          }
        }
        .print-section {
          margin-bottom: 24px;
        }
        .print-muted {
          color: #666;
          font-size: 13px;
          line-height: 1.8;
        }
        .print-box {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 12px 14px;
          margin-top: 10px;
        }
      `}</style>
      <h1 style={{ marginTop: 0 }}>گزارش چاپی فیوچرلنز</h1>
      <p className="print-muted">شناسه تحلیل: {formatId(jobId)}</p>
      {!report ? (
        <p>گزارش هنوز آماده نشده است.</p>
      ) : (
        <>
          <section className="print-section">
            <h2>خلاصه اجرایی</h2>
            <div className="print-box">
              {report.executive_brief ? <p>{report.executive_brief}</p> : <p className="print-muted">خلاصه اجرایی موجود نیست.</p>}
            </div>
          </section>

          <section className="print-section">
            <h2>گزارش کامل</h2>
            <div className="print-box">
              {report.full_report ? <p>{report.full_report}</p> : <p className="print-muted">گزارش کامل موجود نیست.</p>}
            </div>
          </section>

          <section className="print-section">
            <h2>پروفایل سند</h2>
            <ul>
              <li>نوع سند: {report.dashboard.document_profile?.document_type ?? 'نامشخص'}</li>
              <li>حوزه: {report.dashboard.document_profile?.domain ?? 'نامشخص'}</li>
              <li>افق زمانی: {report.dashboard.document_profile?.horizon ?? 'نامشخص'}</li>
              <li>سطح تحلیل: {report.dashboard.document_profile?.analytical_level ?? 'نامشخص'}</li>
            </ul>
          </section>

          <section className="print-section">
            <h2>نقشه پوشش</h2>
            <ul>
              {(report.dashboard.coverage ?? []).map((c) => (
                <li key={c.module}>
                  {c.module} - {coverageLabel[c.status] ?? 'نامشخص'}
                </li>
              ))}
            </ul>
          </section>

          <section className="print-section">
            <h2>روندها</h2>
            <ul>
              {(report.dashboard.trends ?? []).map((t) => (
                <li key={t.id}>
                  {t.label} | اطمینان: {t.confidence !== undefined ? formatNumber(t.confidence) : 'نامشخص'}
                </li>
              ))}
            </ul>
          </section>

          <section className="print-section">
            <h2>نشانه‌های ضعیف</h2>
            <ul>
              {(report.dashboard.weak_signals ?? []).map((w) => (
                <li key={w.id}>
                  {w.signal} | اطمینان: {w.confidence !== undefined ? formatNumber(w.confidence) : 'نامشخص'}
                </li>
              ))}
            </ul>
          </section>

          <section className="print-section">
            <h2>عدم قطعیت‌های کلیدی</h2>
            <ul>
              {(report.dashboard.critical_uncertainties ?? []).map((u) => (
                <li key={u.id}>
                  {u.driver} | اطمینان: {u.confidence !== undefined ? formatNumber(u.confidence) : 'نامشخص'}
                </li>
              ))}
            </ul>
          </section>

          <section className="print-section">
            <h2>سناریوها</h2>
            <ul>
              {(report.dashboard.scenarios ?? []).map((s) => (
                <li key={s.id}>
                  {s.title} | {s.summary}
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}

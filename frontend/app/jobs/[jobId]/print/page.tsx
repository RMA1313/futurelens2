'use client';

import './print-report.css';

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

const formatConfidence = (value?: number) => (value !== undefined ? formatNumber(value) : 'نامشخص');

const STEEPD_CATEGORIES = [
  { key: 'social', title: 'اجتماعی' },
  { key: 'technological', title: 'فناوری' },
  { key: 'economic', title: 'اقتصادی' },
  { key: 'environmental', title: 'محیط‌زیست' },
  { key: 'political', title: 'سیاسی' },
  { key: 'defense', title: 'دفاعی' }
] as const;

function PrintedAt() {
  const [value, setValue] = React.useState<string>('');
  React.useEffect(() => {
    const dt = new Date();
    try {
      setValue(dt.toLocaleString('fa-IR'));
    } catch {
      setValue(dt.toISOString());
    }
  }, []);
  return <span className="printed-at">{value}</span>;
}

function PrintButton() {
  return (
    <button className="print-button" type="button" onClick={() => window.print()}>
      چاپ
    </button>
  );
}

export default function PrintPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const [report, setReport] = React.useState<Report | null>(null);

  React.useEffect(() => {
    (async () => {
      try {
        const rep = await fetchReport(jobId);
        setReport(rep);
      } catch {
        setReport(null);
      }
    })();
  }, [jobId]);

  // Backward-compatible field resolution
  const executiveSummary =
    (report as any)?.executive_summary?.trim?.() || (report as any)?.executive_brief?.trim?.() || '';
  const executiveKeyPoints: string[] = Array.isArray((report as any)?.executive_key_points)
    ? (report as any).executive_key_points
    : Array.isArray((report as any)?.key_points)
      ? (report as any).key_points
      : [];

  const steepd = (report as any)?.steepd;
  const steepdSections = steepd
    ? STEEPD_CATEGORIES.map((category) => ({
        key: category.key,
        title: category.title,
        items: Array.isArray(steepd?.[category.key]) ? steepd[category.key] : []
      })).filter((section) => section.items.length > 0)
    : [];

  return (
    <div className="print-shell" lang="fa">
      <PrintButton />
      <div className="print-page">
        <header className="report-header">
          <div className="report-header__branding">
            <span className="brand-mark">FUTURELENS</span>
            <h1>گزارش تحلیلی آینده‌پژوهی</h1>
            <p>نسخه چاپی برای تصمیم‌سازان راهبردی</p>
          </div>

          <div className="header-meta">
            <span>
              شناسه تحلیل: <strong>{formatId(jobId)}</strong>
            </span>
            <span>
              زمان چاپ: <PrintedAt />
            </span>
            <span>FutureLens</span>
          </div>
        </header>

        <main className="report-content">
          {!report ? (
            <div className="empty-state">گزارش هنوز آماده نشده است.</div>
          ) : (
            <>
              {executiveSummary ? (
                <section className="section print-section">
                  <div className="section-heading">
                    <span className="section-number">۰۱</span>
                    <div>
                      <p className="section-title">چکیده مدیریتی</p>
                      <p className="section-subtitle">برداشت سریع از نکات اصلی گزارش</p>
                    </div>
                  </div>

                  <div className="summary-card hero">
                    <p className="summary-text">{executiveSummary}</p>

                    {executiveKeyPoints.length ? (
                      <ul className="key-points">
                        {executiveKeyPoints.slice(0, 2).map((point, idx) => (
                          <li key={`kp-${idx}`}>{point}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </section>
              ) : null}

              {steepdSections.length ? (
                <section className="section print-section">
                  <div className="section-heading">
                    <span className="section-number">۰۲</span>
                    <div>
                      <p className="section-title">تحلیل STEEPD</p>
                      <p className="section-subtitle">
                        تمرکز بر عوامل اجتماعی، فناوری، اقتصادی، محیط‌زیستی، سیاسی و دفاعی
                      </p>
                    </div>
                  </div>

                  <div className="steepd-grid">
                    {steepdSections.map((section) => (
                      <article key={section.key} className="insight-card" style={{ padding: 16 }}>
                        <header>
                          <div>
                            <p className="insight-card__title">{section.title}</p>
                          </div>
                        </header>
                        <ul style={{ margin: 0, paddingRight: 14, listStyle: 'disc', lineHeight: 1.8 }}>
                          {section.items.map((item: string, index: number) => (
                            <li key={`${section.key}-${index}`}>{item}</li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}

              <section className="section print-section">
                <div className="section-heading">
                  <span className="section-number">۰۳</span>
                  <div>
                    <p className="section-title">جهت‌گیری اولیه</p>
                    <p className="section-subtitle">چک‌لیست سریع برای مرور وضعیت ورودی</p>
                  </div>
                </div>

                <div className="at-a-glance">
                  <div className="glance-grid">
                    <div className="glance-card">
                      <h3>پروفایل سند</h3>
                      <dl>
                        <dt>نوع سند</dt>
                        <dd>{report.dashboard?.document_profile?.document_type ?? 'نامشخص'}</dd>
                        <dt>حوزه</dt>
                        <dd>{report.dashboard?.document_profile?.domain ?? 'نامشخص'}</dd>
                        <dt>افق زمانی</dt>
                        <dd>{report.dashboard?.document_profile?.horizon ?? 'نامشخص'}</dd>
                        <dt>سطح تحلیل</dt>
                        <dd>{report.dashboard?.document_profile?.analytical_level ?? 'نامشخص'}</dd>
                      </dl>
                    </div>

                    <div className="glance-card">
                      <h3>نقشه پوشش</h3>
                      <div className="coverage-badges">
                        {(report.dashboard?.coverage ?? []).map((c: any) => (
                          <span key={c.module} className={`coverage-badge ${c.status}`}>
                            {c.module} · {coverageLabel[c.status] ?? 'نامشخص'}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              <section className="section print-section">
                <div className="section-heading">
                  <span className="section-number">۰۴</span>
                  <div>
                    <p className="section-title">روندها</p>
                    <p className="section-subtitle">الگوهایی که ساختار آینده را شکل می‌دهند</p>
                  </div>
                </div>
                <div className="insight-grid">
                  {(report.dashboard?.trends ?? []).map((t: any) => (
                    <article key={t.id} className="insight-card">
                      <header>
                        <div>
                          <p className="insight-card__title">{t.label}</p>
                          <p className="insight-card__meta">{t.category ?? 'دسته‌بندی نامشخص'}</p>
                        </div>
                        <span className="confidence-chip">اعتماد {formatConfidence(t.confidence)}</span>
                      </header>
                      <p className="insight-card__body">{t.rationale ?? t.direction ?? 'توضیح تکمیلی ثبت نشده است.'}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section print-section">
                <div className="section-heading">
                  <span className="section-number">۰۵</span>
                  <div>
                    <p className="section-title">نشانه‌های ضعیف</p>
                    <p className="section-subtitle">نشانه‌های نوظهور که هنوز در لبه توجه قرار دارند</p>
                  </div>
                </div>
                <div className="insight-grid">
                  {(report.dashboard?.weak_signals ?? []).map((w: any) => (
                    <article key={w.id} className="insight-card">
                      <header>
                        <div>
                          <p className="insight-card__title">{w.signal}</p>
                          <p className="insight-card__meta">سیگنال ضعیف</p>
                        </div>
                        <span className="confidence-chip">اعتماد {formatConfidence(w.confidence)}</span>
                      </header>
                      <p className="insight-card__body">{w.rationale ?? w.evolution ?? 'روند تکمیلی در دست ثبت است.'}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section print-section">
                <div className="section-heading">
                  <span className="section-number">۰۶</span>
                  <div>
                    <p className="section-title">عدم قطعیت‌های کلیدی</p>
                    <p className="section-subtitle">سؤالاتی که مسیر تصمیم‌سازی را دگرگون می‌کنند</p>
                  </div>
                </div>
                <div className="insight-grid">
                  {(report.dashboard?.critical_uncertainties ?? []).map((u: any) => (
                    <article key={u.id} className="insight-card">
                      <header>
                        <div>
                          <p className="insight-card__title">{u.driver}</p>
                          <p className="insight-card__meta">اثرات محتمل</p>
                        </div>
                        <span className="confidence-chip">اعتماد {formatConfidence(u.confidence)}</span>
                      </header>
                      <p className="insight-card__body">{u.impact ?? u.uncertainty_reason ?? 'اثرات احتمالی در حال بررسی است.'}</p>
                    </article>
                  ))}
                </div>
              </section>

              <section className="section print-section scenarios-section">
                <div className="section-heading">
                  <span className="section-number">۰۷</span>
                  <div>
                    <p className="section-title">سناریوها</p>
                    <p className="section-subtitle">روایت‌های آینده و پیامدهای کلیدی</p>
                  </div>
                </div>

                {(report.dashboard?.scenarios ?? []).map((s: any) => (
                  <article key={s.id} className="scenario-card print-section">
                    <div className="scenario-card__header">
                      <h3>{s.title}</h3>
                      <span className="confidence-chip">اعتماد {formatConfidence(s.confidence)}</span>
                    </div>
                    <p className="scenario-card__summary">{s.summary}</p>

                    {Array.isArray(s.implications) && s.implications.length ? (
                      <div className="scenario-card__list">
                        <p className="list-label">پیامدهای کلیدی</p>
                        <ul>
                          {s.implications.map((imp: string) => (
                            <li key={imp}>{imp}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {Array.isArray(s.indicators) && s.indicators.length ? (
                      <div className="scenario-card__list">
                        <p className="list-label">شاخص‌های پیگیری</p>
                        <ul>
                          {s.indicators.map((ind: string) => (
                            <li key={ind}>{ind}</li>
                          ))}
                        </ul>
                      </div>
                    ) : null}
                  </article>
                ))}
              </section>

              {(report as any)?.full_report ? (
                <section className="section print-section">
                  <div className="section-heading">
                    <span className="section-number">۰۸</span>
                    <div>
                      <p className="section-title">گزارش کامل</p>
                      <p className="section-subtitle">متن تجمیعی خروجی برای آرشیو</p>
                    </div>
                  </div>
                  <div className="summary-card">
                    <p style={{ margin: 0, lineHeight: 2, textAlign: 'justify' }}>{(report as any).full_report}</p>
                  </div>
                </section>
              ) : null}
            </>
          )}
        </main>

        <footer className="report-footer">
          <div className="footer-meta">
            <span className="analysis-id" data-analysis={formatId(jobId)}>
              شناسه:
            </span>
            <span className="page-counter" />
          </div>
          <span>FutureLens</span>
        </footer>
      </div>
    </div>
  );
}

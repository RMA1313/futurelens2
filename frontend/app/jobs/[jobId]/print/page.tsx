import './print-report.css';

import { fetchReport } from '../../../../lib/api';
import type { Report, Scenario } from '../../../../lib/schemas';
import { formatId, formatNumber } from '../../../../lib/format';
import { getModuleLabel, getModuleStatusLabel } from '../../../../lib/i18n/labels';
import { PrintedAt } from './components/PrintedAt';
import { PrintButton } from './components/PrintButton';

const formatConfidence = (value?: number) => (value !== undefined ? formatNumber(value) : 'نامشخص');

const STEEPD_CATEGORIES = [
  { key: 'social', title: 'اجتماعی' },
  { key: 'technological', title: 'فناوری' },
  { key: 'economic', title: 'اقتصادی' },
  { key: 'environmental', title: 'محیط‌زیست' },
  { key: 'political', title: 'سیاسی' },
  { key: 'defense', title: 'دفاعی' }
] as const;

type PrintPageProps = {
  params: { jobId: string };
};

export default async function PrintPage({ params }: PrintPageProps) {
  const { jobId } = params;
  let report: Report | null = null;
  try {
    report = await fetchReport(jobId);
  } catch {
    report = null;
  }

  const documentProfile = report?.dashboard.document_profile;
  const coverageEntries = report?.dashboard.coverage ?? [];
  const trends = report?.dashboard.trends ?? [];
  const weakSignals = report?.dashboard.weak_signals ?? [];
  const uncertainties = report?.dashboard.critical_uncertainties ?? [];
  const scenarios = report?.dashboard.scenarios ?? [];
  const summary = report?.executive_summary?.trim();
  const steepdSections = report?.steepd
    ? STEEPD_CATEGORIES.map((category) => ({
        key: category.key,
        title: category.title,
        items: report.steepd[category.key] ?? []
      })).filter((section) => section.items.length > 0)
    : [];

  const insightSections = [
    {
      number: '01',
      title: 'روندهای کلیدی',
      description: 'الگوهایی که ساختار آینده را شکل می‌دهند.',
      items: trends,
      type: 'trend'
    },
    {
      number: '02',
      title: 'سیگنال‌های ضعیف',
      description: 'نشانه‌های نوظهور که هنوز در لبه توجه قرار دارند.',
      items: weakSignals,
      type: 'signal'
    },
    {
      number: '03',
      title: 'عدم قطعیت‌های بحرانی',
      description: 'سؤالاتی که مسیر تصمیم‌سازی را دگرگون می‌کنند.',
      items: uncertainties,
      type: 'uncertainty'
    }
  ] as const;

  const renderInsightCard = (sectionType: typeof insightSections[number]['type'], item: any) => {
    let title = '';
    let body = '';
    let meta = '';

    if (sectionType === 'trend') {
      title = item.label;
      body = item.rationale ?? item.direction ?? 'توضیح تکمیلی ثبت نشده است.';
      meta = item.category ? `${item.category}` : 'دسته‌بندی نامشخص';
    } else if (sectionType === 'signal') {
      title = item.signal;
      body = item.rationale ?? item.evolution ?? 'روند تکمیلی در دست ثبت است.';
      meta = 'سیگنال ضعیف';
    } else {
      title = item.driver;
      body = item.impact ?? item.uncertainty_reason ?? 'اثرات احتمالی در حال بررسی است.';
      meta = 'اثرات محتمل';
    }

    return (
      <article key={`${sectionType}-${item.id}`} className="insight-card">
        <header>
          <div>
            <p className="insight-card__title">{title}</p>
            <p className="insight-card__meta">{meta}</p>
          </div>
          <span className="confidence-chip">{`اعتماد ${formatConfidence(item.confidence)}`}</span>
        </header>
        <p className="insight-card__body">{body}</p>
      </article>
    );
  };

  const renderScenario = (scenario: Scenario) => (
    <article key={scenario.id} className="scenario-card print-section">
      <div className="scenario-card__header">
        <h3>{scenario.title}</h3>
        <span className="confidence-chip">{`اعتماد ${formatConfidence(scenario.confidence)}`}</span>
      </div>
      <p className="scenario-card__summary">{scenario.summary}</p>
      {scenario.implications?.length ? (
        <div className="scenario-card__list">
          <p className="list-label">پیامدهای کلیدی</p>
          <ul>
            {scenario.implications.map((implication) => (
              <li key={implication}>{implication}</li>
            ))}
          </ul>
        </div>
      ) : null}
      {scenario.indicators?.length ? (
        <div className="scenario-card__list">
          <p className="list-label">شاخص‌های پیگیری</p>
          <ul>
            {scenario.indicators.map((indicator) => (
              <li key={indicator}>{indicator}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </article>
  );

  return (
    <div className="print-shell" lang="fa">
      <PrintButton />
      <div className="print-page">
        <header className="report-header">
          <div className="report-header__branding">
            <span className="brand-mark">FutureLens</span>
            <h1>گزارش تحلیلی آینده‌پژوهی</h1>
            <p className="section-subtitle" style={{ marginBottom: 0 }}>نسخه چاپی برای تصمیم‌سازان راهبردی</p>
          </div>
          <div className="header-meta">
            <span>
              شناسه تحلیل:
              <strong>{formatId(jobId)}</strong>
            </span>
            <span>
              زمان چاپ:
              <PrintedAt />
            </span>
            <span>FutureLens</span>
          </div>
        </header>

        <main className="report-content">
          {!report ? (
            <div className="empty-state">در حال دریافت گزارش برای چاپ...</div>
          ) : (
            <>
              {summary ? (
                <section className="section print-section">
                  <div className="section-heading">
                    <span className="section-number">۰۱</span>
                    <div>
                      <p className="section-title">چکیده مدیریتی</p>
                      <p className="section-subtitle" style={{ marginTop: 0 }}>
                        برداشت سریع از نکات اصلی گزارش
                      </p>
                    </div>
                  </div>
                  <p className="subhead" style={{ marginTop: 12, textAlign: 'justify', lineHeight: 1.7 }}>
                    {summary}
                  </p>
                </section>
              ) : null}
              {steepdSections.length ? (
                <section className="section print-section">
                  <div className="section-heading">
                    <span className="section-number">۰۲</span>
                    <div>
                      <p className="section-title">تحلیل STEEPD</p>
                      <p className="section-subtitle" style={{ marginTop: 0 }}>
                        تمرکز بر عوامل اجتماعی، فناوری، اقتصادی، محیط‌زیستی، سیاسی و دفاعی
                      </p>
                    </div>
                  </div>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: 12
                    }}
                  >
                    {steepdSections.map((section) => (
                      <article key={section.key} className="insight-card" style={{ padding: '12px' }}>
                        <header>
                          <div>
                            <p className="insight-card__title" style={{ fontSize: 16 }}>
                              {section.title}
                            </p>
                          </div>
                        </header>
                        <ul
                          dir="rtl"
                          style={{ margin: 0, paddingInlineStart: 18, lineHeight: 1.6, textAlign: 'justify' }}
                        >
                          {section.items.map((item, index) => (
                            <li key={`${section.key}-${index}`} style={{ marginBottom: 6 }}>
                              {item}
                            </li>
                          ))}
                        </ul>
                      </article>
                    ))}
                  </div>
                </section>
              ) : null}
              <section className="cover-block section print-section">
                <div>
                  <p className="cover-title">چشم‌انداز راهبردی آینده</p>
                  <p className="cover-description">
                    این بولتن با تمرکز بر چاپ حرفه‌ای، روندها، سیگنال‌ها و عدم قطعیت‌های کلیدی را در قالبی دقیق و آرام
                    برای اتاق‌های تصمیم‌گیری ارائه می‌کند.
                  </p>
                </div>
                <div className="cover-meta">
                  <div>
                    <span>حوزه</span>
                    <span>{documentProfile?.domain ?? 'نامشخص'}</span>
                  </div>
                  <div>
                    <span>افق زمانی</span>
                    <span>{documentProfile?.horizon ?? 'نامشخص'}</span>
                  </div>
                  <div>
                    <span>سطح تحلیل</span>
                    <span>{documentProfile?.analytical_level ?? 'نامشخص'}</span>
                  </div>
                </div>
              </section>

              <section className="section print-section">
                <div className="section-heading">
                  <span className="section-number">◉</span>
                  <div>
                    <p className="section-title">خلاصه اجرایی</p>
                    <p className="section-subtitle">نکات کلیدی برای نشستی راهبردی</p>
                  </div>
                </div>
                <div className="summary-card">
                  <p>{report.executive_brief ?? 'خلاصه اجرایی هنوز آماده نشده است.'}</p>
                </div>
              </section>

              <section className="at-a-glance section print-section">
                <div className="section-heading">
                  <span className="section-number">✦</span>
                  <div>
                    <p className="section-title">در یک نگاه</p>
                    <p className="section-subtitle">پروفایل سند و بازنمایی پوشش ماژول‌ها</p>
                  </div>
                </div>
                <div className="glance-grid">
                  <article className="glance-card">
                    <h3>پروفایل سند</h3>
                    <dl>
                      <dt>نوع سند</dt>
                      <dd>{documentProfile?.document_type ?? 'نامشخص'}</dd>
                      <dt>دامنه</dt>
                      <dd>{documentProfile?.domain ?? 'نامشخص'}</dd>
                      <dt>افق زمانی</dt>
                      <dd>{documentProfile?.horizon ?? 'نامشخص'}</dd>
                      <dt>سطح تحلیل</dt>
                      <dd>{documentProfile?.analytical_level ?? 'نامشخص'}</dd>
                    </dl>
                  </article>
                  <article className="glance-card">
                    <h3>پوشش ماژول‌ها</h3>
                    <div className="coverage-badges">
                      {coverageEntries.length ? (
                        coverageEntries.map((entry) => (
                          <span key={entry.module} className={`coverage-badge ${entry.status}`}>
                            {getModuleLabel(entry.module)}: {getModuleStatusLabel(entry.status)}
                          </span>
                        ))
                      ) : (
                        <span className="coverage-badge inactive">اطلاعات پوشش هنوز ثبت نشده است.</span>
                      )}
                    </div>
                  </article>
                </div>
              </section>

              {insightSections.map((section) => (
                <section key={section.number} className="section print-section">
                  <div className="section-heading">
                    <span className="section-number">{section.number}</span>
                    <div>
                      <p className="section-title">{section.title}</p>
                      <p className="section-subtitle">{section.description}</p>
                    </div>
                  </div>
                  {section.items.length ? (
                    <div className="insight-grid">
                      {section.items.map((item) => renderInsightCard(section.type, item))}
                    </div>
                  ) : (
                    <div className="empty-state">داده‌ای برای این بخش ثبت نشده است.</div>
                  )}
                </section>
              ))}

              <section className="scenarios-section print-section">
                <div className="section-heading">
                  <span className="section-number">04</span>
                  <div>
                    <p className="section-title">سناریوهای کلیدی</p>
                    <p className="section-subtitle">ترکیبی از روایت‌های آینده برای هدایت تصمیم‌سازی</p>
                  </div>
                </div>
                {scenarios.length ? (
                  scenarios.map((scenario) => renderScenario(scenario))
                ) : (
                  <div className="empty-state">هنوز سناریویی برای نمایش ثبت نشده است.</div>
                )}
              </section>
            </>
          )}
        </main>

        <footer className="report-footer">
          <span data-analysis={formatId(jobId)} className="analysis-id">
            شناسه تحلیل
          </span>
          <span className="footer-meta">
            بولتن تحلیلی FutureLens
            <span className="page-counter" />
          </span>
        </footer>
      </div>
    </div>
  );
}

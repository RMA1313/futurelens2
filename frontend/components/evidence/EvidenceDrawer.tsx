import React from 'react';
import { EvidenceItem } from '../../lib/schemas';
import { formatId } from '../../lib/format';
import styles from './EvidenceDrawer.module.css';

type Props = {
  evidence?: EvidenceItem[];
  openId?: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
  extractionQuality?: { status: 'ok' | 'low'; message?: string };
};

const kindLabel: Record<string, string> = {
  claim: 'ادعا',
  actor: 'بازیگر',
  event: 'رویداد',
  metric: 'شاخص'
};

const labelLabel: Record<string, string> = {
  fact: 'واقعیت',
  inference: 'استنباط',
  assumption: 'فرض'
};

export function EvidenceDrawer({
  evidence = [],
  openId,
  onClose,
  onSelect,
  extractionQuality
}: Props) {
  const [search, setSearch] = React.useState('');
  const term = search.trim();
  const filtered = evidence.filter((e) => {
    if (!term) return true;
    return (e.snippet && e.snippet.includes(term)) || e.chunk_id.includes(term);
  });
  const current = evidence.find((e) => e.id === openId);
  const snippetRaw = current?.snippet ?? '';
  const contentRaw = current?.content ?? '';
  const hasPdfNoise =
    /%PDF|xref|endobj|obj\s*<</i.test(snippetRaw) || /%PDF|xref|endobj|obj\s*<</i.test(contentRaw);
  const isMissingText = !snippetRaw && !contentRaw;
  const showFallback = hasPdfNoise || isMissingText;
  const snippetText = showFallback
    ? 'متن این شاهد در این فایل قابل استخراج نیست یا کیفیت استخراج پایین است.'
    : snippetRaw;
  const contentText = showFallback
    ? 'پیشنهاد می‌شود نسخه متنی، PDF قابل جستجو، یا فایل OCR شده را ارسال کنید.'
    : contentRaw;
  const warningBadge =
    extractionQuality?.status === 'low'
      ? extractionQuality.message || 'کیفیت استخراج متن پایین است و ممکن است شواهد ناقص باشند.'
      : null;
  const synthesis =
    contentText ||
    snippetText ||
    'برای این شاهد متن قابل اتکا پیدا نشد. لطفا منبع مناسب‌تری بارگذاری کنید.';
  const synthesisShort = synthesis.replace(/\s+/g, ' ').trim().slice(0, 260);
  const confidenceValue =
    current?.confidence !== undefined ? formatId(current.confidence.toFixed(2)) : 'نامشخص';
  const whyItems = [
    `این شاهد از نوع ${kindLabel[current?.kind ?? 'claim'] ?? 'داده'} است و می‌تواند بر تصمیم‌های کلیدی اثر بگذارد.`,
    `سطح اطمینان گزارش‌شده: ${confidenceValue}.`
  ];
  if (current?.label_type) {
    whyItems.push(`ماهیت شاهد: ${labelLabel[current.label_type] ?? current.label_type}.`);
  }
  const compactList = evidence.slice(0, 2);

  return (
    <div className={styles.drawerBackdrop} data-open={Boolean(openId)} onClick={onClose}>
      <div className={styles.drawerPanel} data-open={Boolean(openId)} onClick={(event) => event.stopPropagation()}>
        <div className={styles.panelShell}>
          <div className={styles.header}>
            <div className={styles.headerTitleGroup}>
              <p className={styles.headerTitle}>پنل شواهد</p>
            </div>
            <div className={styles.headerActions}>
              {warningBadge ? <span className="badge badge-warning">{warningBadge}</span> : null}
              <button
                type="button"
                className={`button button-secondary ${styles.closeButton}`}
                onClick={onClose}
              >
                بستن
              </button>
            </div>
          </div>
          <div className={styles.divider} />
          <div className={styles.body}>
            <div className={styles.controls}>
              <div className={styles.searchWrapper}>
                <input
                  className={styles.searchInput}
                  placeholder="جستجو در شواهد"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>
            </div>
            <div className={styles.contentGrid}>
              <div className={styles.listColumn}>
                <div className={styles.listViewport}>
                  {filtered.map((item, index) => (
                    <button
                      key={item.id}
                      type="button"
                      className={`${styles.listItem} ${item.id === openId ? styles.listItemActive : ''}`}
                      onClick={() => onSelect(item.id)}
                      aria-pressed={item.id === openId}
                    >
                      <span className={styles.itemTitle}>شاهد {formatId(String(index + 1))}</span>
                      <span className="subhead" style={{ fontSize: 12 }}>
                        گزیده
                      </span>
                    </button>
                  ))}
                  {!filtered.length && <div className="subhead">شاهدی با این عبارت پیدا نشد.</div>}
                </div>
              </div>
              <div className={styles.detailsSection}>
                {current ? (
                  <>
                    <div className={styles.detailsHeader}>
                      <p className={styles.detailsTitle}>خلاصه شاهد</p>
                    </div>
                    <div className={styles.pillRow}>
                      <span className="pill">{kindLabel[current.kind] ?? current.kind}</span>
                      <span className="pill">دامنه: نامشخص</span>
                      {current.confidence !== undefined ? (
                        <span className="pill">اطمینان: {formatId(current.confidence.toFixed(2))}</span>
                      ) : (
                        <span className="pill">اطمینان: نامشخص</span>
                      )}
                    </div>
                    <div className={styles.detailsContent}>{synthesisShort}</div>
                    <div className={styles.detailsSubtitle}>چرا مهم است</div>
                    <ul className={styles.detailsList}>
                      {whyItems.slice(0, 3).map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    <div className={styles.detailsSubtitle}>شواهد مرتبط</div>
                    <div className={styles.relatedList}>
                      {compactList.length ? (
                        compactList.map((entry, index) => {
                          const short = (entry.snippet || entry.content || '')
                            .replace(/\s+/g, ' ')
                            .trim()
                            .slice(0, 120);
                          return (
                            <button
                              key={entry.id}
                              type="button"
                              className={styles.relatedCard}
                              onClick={() => onSelect(entry.id)}
                            >
                              <p className={styles.relatedCardTitle}>
                                گزاره {formatId(String(index + 1))}
                              </p>
                              <p className={styles.relatedCardSnippet}>{short || 'متن قابل نمایش موجود نیست.'}</p>
                            </button>
                          );
                        })
                      ) : (
                        <div className="subhead">شاهد مرتبطی برای نمایش وجود ندارد.</div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="subhead">برای مشاهده جزئیات، یکی از شواهد را انتخاب کنید.</div>
                )}
              </div>
            </div>
            {showFallback && current && (
              <div className={styles.detailsFallback}>
                <div className={styles.detailsFallbackTitle}>متن قابل استخراج نیست</div>
                <div className="subhead">
                  متن این شاهد از فایل استخراج نشده است. لطفا نسخه متنی، PDF قابل جستجو یا فایل OCR شده را
                  ارسال کنید.
                </div>
                <div className={styles.fallbackActions}>
                  <button className="button button-secondary" type="button">
                    آپلود نسخه متنی
                  </button>
                  <button className="button button-secondary" type="button">
                    آپلود PDF قابل جستجو
                  </button>
                  <button className="button button-secondary" type="button">
                    ارسال فایل OCR شده
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

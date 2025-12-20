import React from 'react';
import { EvidenceItem } from '../../lib/schemas';
import { formatId } from '../../lib/format';

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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: openId ? 'rgba(0,0,0,0.35)' : 'transparent',
        pointerEvents: openId ? 'auto' : 'none',
        transition: 'background var(--motion-mid) var(--ease-standard)',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: '440px',
          maxWidth: '90vw',
          background: 'var(--color-surface)',
          borderInlineEnd: '1px solid var(--color-border)',
          transform: openId ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform var(--motion-mid) var(--ease-standard)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          boxShadow: 'var(--shadow-strong)'
        }}
      >
        <div
          style={{
            padding: '14px 16px',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ fontWeight: 800 }}>پنل شواهد</div>
            {warningBadge ? <span className="badge badge-warning">{warningBadge}</span> : null}
          </div>
          <button className="button button-secondary" style={{ padding: '8px 12px' }} onClick={onClose}>
            بستن
          </button>
        </div>
        <div style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '180px 1fr' }}>
          <div style={{ borderInlineEnd: '1px solid var(--color-border)', padding: 12, display: 'grid', gap: 10 }}>
            <input
              className="input-field"
              placeholder="جستجو در شواهد"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ overflowY: 'auto', maxHeight: '60vh', display: 'grid', gap: 6, paddingInlineEnd: 4 }}>
              {filtered.map((e, index) => (
                <button
                  key={e.id}
                  type="button"
                  className="pill"
                  style={{
                    justifyContent: 'space-between',
                    borderColor: e.id === openId ? 'rgba(106,216,255,0.9)' : 'var(--color-border)',
                    background: e.id === openId ? 'rgba(106,216,255,0.08)' : 'transparent',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelect(e.id)}
                >
                  <span>شاهد {formatId(String(index + 1))}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>گزیده</span>
                </button>
              ))}
              {!filtered.length ? <div className="subhead">شاهدی با این عبارت پیدا نشد.</div> : null}
            </div>
          </div>
          <div style={{ padding: 14, overflowY: 'auto' }}>
            {current ? (
              <>
                <div style={{ maxWidth: 520, lineHeight: 1.9 }}>
                  <div style={{ fontWeight: 800, fontSize: 16 }}>خلاصه شاهد</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 8 }}>
                    <span className="pill">{kindLabel[current.kind] ?? current.kind}</span>
                    <span className="pill">دامنه: نامشخص</span>
                    {current.confidence !== undefined ? (
                      <span className="pill">اطمینان: {formatId(current.confidence.toFixed(2))}</span>
                    ) : (
                      <span className="pill">اطمینان: نامشخص</span>
                    )}
                  </div>
                  <div style={{ marginTop: 10, fontSize: 14, color: 'var(--color-text)' }}>{synthesisShort}</div>
                  <div style={{ marginTop: 14, fontWeight: 700 }}>چرا مهم است</div>
                  <ul style={{ margin: '8px 0 0', paddingInlineStart: 18, color: 'var(--color-text)' }}>
                    {whyItems.slice(0, 3).map((item) => (
                      <li key={item} style={{ marginBottom: 6 }}>
                        {item}
                      </li>
                    ))}
                  </ul>
                  <div style={{ marginTop: 16, fontWeight: 700 }}>شواهد مرتبط</div>
                  <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                    {compactList.length ? (
                      compactList.map((item, index) => {
                        const isActive = item.id === openId;
                        const short = (item.snippet || item.content || '')
                          .replace(/\s+/g, ' ')
                          .trim()
                          .slice(0, 120);
                        return (
                          <button
                            key={item.id}
                            type="button"
                            onClick={() => onSelect(item.id)}
                            className="card"
                            style={{
                              textAlign: 'right',
                              borderColor: isActive ? 'rgba(106,216,255,0.9)' : 'var(--color-border)',
                              background: isActive ? 'rgba(106,216,255,0.08)' : 'var(--color-surface)',
                              padding: 10,
                              cursor: 'pointer'
                            }}
                          >
                            <div style={{ fontWeight: 700, marginBottom: 4 }}>گزاره {formatId(String(index + 1))}</div>
                            <div className="subhead">{short || 'متن قابل نمایش موجود نیست.'}</div>
                          </button>
                        );
                      })
                    ) : (
                      <div className="subhead">شاهد مرتبطی برای نمایش وجود ندارد.</div>
                    )}
                  </div>
                </div>
                {showFallback ? (
                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    <div className="card" style={{ background: 'var(--color-surface-2)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>متن قابل استخراج نیست</div>
                      <div className="subhead">
                        متن این شاهد از فایل استخراج نشده است. لطفا نسخه متنی، PDF قابل جستجو یا فایل OCR شده را
                        ارسال کنید.
                      </div>
                      <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
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
                  </div>
                ) : null}
              </>
            ) : (
              <div className="subhead">برای مشاهده جزئیات، یکی از شواهد را انتخاب کنید.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

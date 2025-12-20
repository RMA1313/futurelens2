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
  inference: 'استنتاج',
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
  const hasPdfNoise = /%PDF|xref|endobj|obj\s*<</i.test(snippetRaw) || /%PDF|xref|endobj|obj\s*<</i.test(contentRaw);
  const isMissingText = !snippetRaw && !contentRaw;
  const showFallback = hasPdfNoise || isMissingText;
  const snippetText = showFallback
    ? 'متن این شاهد در این فایل قابل استخراج نیست.'
    : snippetRaw;
  const contentText = showFallback
    ? 'برای بهبود نتیجه، نسخه متنی یا PDF قابل جستجو ارسال کنید.'
    : contentRaw;
  const warningBadge =
    extractionQuality?.status === 'low'
      ? extractionQuality.message || 'کیفیت استخراج متن پایین است.'
      : null;

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
            <div style={{ fontWeight: 800 }}>نمایش شواهد</div>
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
              {filtered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="pill"
                  style={{
                    justifyContent: 'space-between',
                    borderColor: e.id === openId ? 'rgba(106,216,255,0.6)' : 'var(--color-border)',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelect(e.id)}
                >
                  <span>{formatId(e.id)}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>
                    {formatId(e.chunk_id)}
                  </span>
                </button>
              ))}
              {!filtered.length ? <div className="subhead">موردی یافت نشد.</div> : null}
            </div>
          </div>
          <div style={{ padding: 14, overflowY: 'auto' }}>
            {current ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>شناسه شاهد {formatId(current.id)}</div>
                    <div className="subhead">شناسه قطعه: {formatId(current.chunk_id)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span className="pill">{kindLabel[current.kind] ?? current.kind}</span>
                    {current.page !== undefined ? <span className="pill">صفحه {formatId(String(current.page))}</span> : null}
                    {current.label_type ? (
                      <span className="pill">{labelLabel[current.label_type] ?? current.label_type}</span>
                    ) : null}
                    {current.confidence !== undefined ? (
                      <span className="pill">اطمینان {formatId(current.confidence.toFixed(2))}</span>
                    ) : null}
                  </div>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {snippetText}
                </div>
                {contentText ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-2)',
                      lineHeight: 1.8
                    }}
                  >
                    {contentText}
                  </div>
                ) : null}
                {showFallback ? (
                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    <div className="card" style={{ background: 'var(--color-surface-2)' }}>
                      <div style={{ fontWeight: 700, marginBottom: 6 }}>پیشنهاد برای ادامه</div>
                      <div className="subhead">
                        نسخه متنی یا PDF قابل جستجو ارسال کنید تا شواهد دقیق‌تر نمایش داده شود.
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
              <div className="subhead">برای مشاهده، یک شاهد را انتخاب کنید.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

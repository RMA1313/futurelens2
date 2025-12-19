import React from 'react';
import { EvidenceItem } from '../../lib/schemas';

type Item = {
  id: string;
  title: string;
  rationale?: string;
  category?: string;
  impact?: string;
  evolution?: string;
  indicators?: string[];
  label_type?: 'fact' | 'inference' | 'assumption';
  confidence?: number;
  evidence_ids?: string[];
};

const labelMap: Record<string, { text: string; className: string }> = {
  fact: { text: 'واقعیت', className: 'badge-success' },
  inference: { text: 'استنتاج', className: 'badge-accent' },
  assumption: { text: 'فرض', className: 'badge-muted' }
};

export function AnalysisPanel({
  title,
  items,
  evidence,
  onEvidenceClick,
  filter
}: {
  title: string;
  items?: Item[];
  evidence?: EvidenceItem[];
  onEvidenceClick?: (id: string) => void;
  filter: { minConfidence: number; labels: Record<string, boolean>; focusMode: boolean; compareIds: string[]; onToggleCompare: (id: string) => void };
}) {
  const filtered = React.useMemo(() => {
    if (!items) return [];
    return items.filter((item) => {
      const confOk = item.confidence === undefined || item.confidence >= filter.minConfidence;
      const labelOk = item.label_type ? filter.labels[item.label_type] !== false : true;
      return confOk && labelOk;
    });
  }, [items, filter.minConfidence, filter.labels]);

  if (!items || !items.length) {
    return (
      <div className="card">
        <div className="headline" style={{ fontSize: 20 }}>{title}</div>
        <p className="subhead">داده‌ای برای نمایش موجود نیست.</p>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="headline" style={{ fontSize: 20 }}>{title}</div>
      <div className="section-grid">
        {filtered.map((item) => {
          const labelInfo = item.label_type ? labelMap[item.label_type] : null;
          const isCompared = filter.compareIds.includes(item.id);
          return (
            <div
              key={item.id}
              className="card"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: isCompared ? 'rgba(106,216,255,0.5)' : undefined,
                opacity: filter.focusMode && !isCompared ? 0.78 : 1,
                transition: 'opacity var(--motion-mid) var(--ease-standard), border-color var(--motion-mid) var(--ease-standard)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{item.title}</div>
                {labelInfo ? <span className={`badge ${labelInfo.className}`}>{labelInfo.text}</span> : null}
              </div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
                {item.rationale || item.impact || item.evolution || 'توضیح ارائه نشده است.'}
              </div>
              {item.indicators?.length ? (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>نشانه‌ها: </strong>
                  {item.indicators.join('، ')}
                </div>
              ) : null}
              {item.confidence !== undefined ? (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  اطمینان: {item.confidence.toFixed(2)}
                  <div
                    style={{
                      marginTop: 4,
                      height: 6,
                      borderRadius: 999,
                      background: 'var(--color-border)',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        insetInlineStart: 0,
                        top: 0,
                        bottom: 0,
                        width: `${Math.min(item.confidence * 100, 100)}%`,
                        background: 'linear-gradient(90deg, #6ad8ff, #5ad39a)',
                        transition: 'width var(--motion-mid) var(--ease-emphasis)'
                      }}
                    />
                  </div>
                </div>
              ) : null}
              {item.evidence_ids?.length ? (
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {item.evidence_ids.map((eid) => (
                    <button
                      type="button"
                      key={eid}
                      className="pill"
                      onClick={() => onEvidenceClick?.(eid)}
                      style={{ cursor: 'pointer' }}
                    >
                      شاهد {eid}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  شاهد صریح ارائه نشده است.
                </div>
              )}
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '8px 12px' }}
                  onClick={() => filter.onToggleCompare(item.id)}
                >
                  {isCompared ? 'حذف از مقایسه' : 'مقایسه'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!filtered.length ? <p className="subhead">فیلترها همه موارد را پنهان کرده‌اند.</p> : null}
    </div>
  );
}

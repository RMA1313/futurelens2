import React from 'react';
import { EvidenceItem } from '../../lib/schemas';
import { formatNumber, formatId } from '../../lib/format';

type Item = {
  id: string;
  key?: string;
  title: string;
  rationale?: string;
  category?: string;
  direction?: string;
  strength?: string;
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

function parseStrength(value?: string) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes('high') || normalized.includes('زیاد') || normalized.includes('قوی')) return 3;
  if (normalized.includes('medium') || normalized.includes('متوسط')) return 2;
  if (normalized.includes('low') || normalized.includes('کم') || normalized.includes('ضعیف')) return 1;
  return null;
}

function parseDirection(value?: string) {
  if (!value) return null;
  const normalized = value.toLowerCase();
  if (normalized.includes('up') || normalized.includes('increase') || normalized.includes('افزای') || normalized.includes('رشد')) {
    return { label: 'افزایشی', arrow: '↑' };
  }
  if (normalized.includes('down') || normalized.includes('decrease') || normalized.includes('کاهشی') || normalized.includes('افت')) {
    return { label: 'کاهشی', arrow: '↓' };
  }
  if (normalized.includes('steady') || normalized.includes('ثابت') || normalized.includes('پایدار')) {
    return { label: 'ثابت', arrow: '→' };
  }
  return null;
}

function getTrendMeta(direction?: string, strength?: string, force = false) {
  const dir = parseDirection(direction);
  const strengthLevel = parseStrength(strength);
  if (!force && !dir && strengthLevel === null) return null;
  return {
    directionLabel: dir?.label ?? 'نامشخص',
    arrow: dir?.arrow ?? '•',
    strengthLabel: strength ?? 'نامشخص',
    strengthLevel: strengthLevel ?? 1
  };
}

function hashItem(item: Item) {
  return [
    item.title,
    item.rationale,
    item.category,
    item.direction,
    item.strength,
    item.impact,
    item.evolution,
    (item.indicators ?? []).join(','),
    item.confidence,
    (item.evidence_ids ?? []).join(',')
  ].join('|');
}

export function AnalysisPanel({
  title,
  items,
  evidence,
  onEvidenceClick,
  filter,
  changedIds,
  panelId,
  highlight,
  showTrendMeta
}: {
  title: string;
  items?: Item[];
  evidence?: EvidenceItem[];
  onEvidenceClick?: (id: string) => void;
  filter: {
    minConfidence: number;
    labels: Record<string, boolean>;
    focusMode: boolean;
    compareIds: string[];
    onToggleCompare: (id: string) => void;
  };
  changedIds?: Set<string>;
  panelId?: string;
  highlight?: boolean;
  showTrendMeta?: boolean;
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
        <div className="headline" style={{ fontSize: 20 }}>
          {title}
        </div>
        <p className="subhead">در حال حاضر داده‌ای برای این بخش وجود ندارد.</p>
      </div>
    );
  }

  return (
    <div className={`card ${highlight ? 'panel-highlight' : ''}`} id={panelId}>
      <div className="headline" style={{ fontSize: 20 }}>
        {title}
      </div>
      <div className="section-grid">
        {filtered.map((item, index) => {
          const labelInfo = item.label_type ? labelMap[item.label_type] : null;
          const isCompared = filter.compareIds.includes((item.id || item.key || `${hashItem(item)}-${index}`));
          const isChanged = changedIds?.has((item.id || item.key || `${hashItem(item)}-${index}`)) || (item.id ? changedIds?.has(item.id) : false);
          const trendMeta = showTrendMeta ? getTrendMeta(item.direction, item.strength, true) : getTrendMeta(item.direction, item.strength, false);
          return (
            <div
              key={item.id || item.key || `${hashItem(item)}-${index}`}
              className="card"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: isCompared
                  ? 'rgba(106,216,255,0.5)'
                  : isChanged
                    ? 'rgba(240,192,90,0.6)'
                    : undefined,
                boxShadow: isChanged ? '0 0 0 1px rgba(240,192,90,0.4)' : undefined,
                opacity: filter.focusMode && !isCompared ? 0.78 : 1,
                transition: 'opacity var(--motion-mid) var(--ease-standard), border-color var(--motion-mid) var(--ease-standard)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'center' }}>
                <div style={{ fontWeight: 800, fontSize: 15 }}>{item.title}</div>
                {labelInfo ? <span className={`badge ${labelInfo.className}`}>{labelInfo.text}</span> : null}
              </div>
              {trendMeta ? (
                <div style={{ marginTop: 8, display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className="pill">
                    جهت: {trendMeta.directionLabel} {trendMeta.arrow}
                  </span>
                  <span className="pill">شدت: {trendMeta.strengthLabel}</span>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {Array.from({ length: 3 }).map((_, idx) => (
                      <span
                        key={idx}
                        style={{
                          width: 14,
                          height: 6,
                          borderRadius: 999,
                          background:
                            idx < trendMeta.strengthLevel ? 'rgba(106,216,255,0.9)' : 'rgba(255,255,255,0.08)'
                        }}
                      />
                    ))}
                  </div>
                </div>
              ) : null}
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
                {item.rationale || item.impact || item.evolution || 'جزئیات تکمیلی برای این مورد ثبت نشده است.'}
              </div>
              {item.indicators?.length ? (
                <div style={{ marginTop: 8, fontSize: 13 }}>
                  <strong>نشانگرها: </strong>
                  {item.indicators.join('، ')}
                </div>
              ) : null}
              {item.confidence !== undefined ? (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  اطمینان: {formatNumber(item.confidence)}
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
                      شاهد {formatId(eid)}
                    </button>
                  ))}
                </div>
              ) : (
                <div style={{ marginTop: 8, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  شاهدی برای این مورد ثبت نشده است.
                </div>
              )}
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '8px 12px' }}
                  onClick={() => filter.onToggleCompare((item.id || item.key || `${hashItem(item)}-${index}`))}
                >
                  {isCompared ? 'خروج از مقایسه' : 'مقایسه'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!filtered.length ? <p className="subhead">با فیلترهای فعلی، موردی برای نمایش وجود ندارد.</p> : null}
    </div>
  );
}

import React from 'react';
import { Scenario, EvidenceItem } from '../../lib/schemas';
import { formatId, formatNumber } from '../../lib/format';

function hashScenario(item: Scenario) {
  return [
    item.title,
    item.summary,
    (item.implications ?? []).join(','),
    (item.indicators ?? []).join(','),
    item.confidence,
    (item.evidence_ids ?? []).join(',')
  ].join('|');
}

export function ScenariosPanel({
  scenarios,
  evidence,
  onEvidenceClick,
  filter,
  changedIds,
  panelId,
  highlight
}: {
  scenarios?: Scenario[];
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
}) {
  if (!scenarios || !scenarios.length) {
    return (
      <div className="card">
        <div className="headline" style={{ fontSize: 20 }}>
          سناریوها
        </div>
        <p className="subhead">هنوز سناریویی تولید نشده است.</p>
      </div>
    );
  }

  const filtered = scenarios.filter((s) => {
    const confOk = s.confidence === undefined || s.confidence >= filter.minConfidence;
    return confOk;
  });

  return (
    <div className={`card ${highlight ? 'panel-highlight' : ''}`} id={panelId}>
      <div className="headline" style={{ fontSize: 20 }}>
        سناریوها
      </div>
      <div className="section-grid">
        {filtered.map((s, index) => {
          const isCompared = filter.compareIds.includes((s.id || `${hashScenario(s)}-${index}`));
          const isChanged = changedIds?.has((s.id || `${hashScenario(s)}-${index}`)) || (s.id ? changedIds?.has(s.id) : false);
          return (
            <div
              key={s.id || `${hashScenario(s)}-${index}`}
              className="card"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: isCompared
                  ? 'rgba(106,216,255,0.5)'
                  : isChanged
                    ? 'rgba(240,192,90,0.6)'
                    : undefined,
                boxShadow: isChanged ? '0 0 0 1px rgba(240,192,90,0.4)' : undefined,
                opacity: filter.focusMode && !isCompared ? 0.8 : 1
              }}
            >
              <div style={{ fontWeight: 800, marginBottom: 6 }}>{s.title}</div>
              <div style={{ color: 'var(--color-text-muted)', fontSize: 13 }}>{s.summary}</div>
              {s.implications?.length ? (
                <div style={{ marginTop: 10 }}>
                  <strong>پیامدها:</strong>
                  <ul style={{ color: 'var(--color-text-muted)', paddingInlineStart: 18, margin: 4, lineHeight: 1.6 }}>
                    {s.implications.map((imp, idx) => (
                      <li key={idx}>{imp}</li>
                    ))}
                  </ul>
                </div>
              ) : null}
              {s.indicators?.length ? (
                <div style={{ marginTop: 10, fontSize: 13 }}>
                  <strong>نشانگرهای هشدار:</strong> {s.indicators.join('، ')}
                </div>
              ) : null}
              {s.confidence !== undefined ? (
                <div style={{ marginTop: 10, fontSize: 12, color: 'var(--color-text-muted)' }}>
                  اطمینان: {formatNumber(s.confidence)}
                </div>
              ) : null}
              {s.evidence_ids?.length ? (
                <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                  {s.evidence_ids.map((eid) => (
                    <button
                      key={eid}
                      type="button"
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
                 
                </div>
              )}
              <div style={{ marginTop: 10, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="button button-secondary"
                  style={{ padding: '8px 12px' }}
                  onClick={() => filter.onToggleCompare((s.id || `${hashScenario(s)}-${index}`))}
                >
                  {isCompared ? 'خروج از مقایسه' : 'مقایسه'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!filtered.length ? <p className="subhead">با فیلترهای فعلی، سناریویی برای نمایش وجود ندارد.</p> : null}
    </div>
  );
}

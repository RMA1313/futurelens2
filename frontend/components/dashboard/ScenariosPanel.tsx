import React from 'react';
import { Scenario, EvidenceItem } from '../../lib/schemas';

export function ScenariosPanel({
  scenarios,
  evidence,
  onEvidenceClick,
  filter
}: {
  scenarios?: Scenario[];
  evidence?: EvidenceItem[];
  onEvidenceClick?: (id: string) => void;
  filter: { minConfidence: number; labels: Record<string, boolean>; focusMode: boolean; compareIds: string[]; onToggleCompare: (id: string) => void };
}) {
  if (!scenarios || !scenarios.length) {
    return (
      <div className="card">
        <div className="headline" style={{ fontSize: 20 }}>سناریوها</div>
        <p className="subhead">داده سناریو در دسترس نیست.</p>
      </div>
    );
  }

  const filtered = scenarios.filter((s) => {
    const confOk = s.confidence === undefined || s.confidence >= filter.minConfidence;
    return confOk;
  });

  return (
    <div className="card">
      <div className="headline" style={{ fontSize: 20 }}>سناریوها</div>
      <div className="section-grid">
        {filtered.map((s) => {
          const isCompared = filter.compareIds.includes(s.id);
          return (
            <div
              key={s.id}
              className="card"
              style={{
                background: 'var(--color-surface-2)',
                borderColor: isCompared ? 'rgba(106,216,255,0.5)' : undefined,
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
                  اطمینان: {s.confidence.toFixed(2)}
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
                  onClick={() => filter.onToggleCompare(s.id)}
                >
                  {isCompared ? 'حذف از مقایسه' : 'مقایسه'}
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {!filtered.length ? <p className="subhead">فیلترها همه سناریوها را پنهان کرده‌اند.</p> : null}
    </div>
  );
}

import React from 'react';
import { formatNumber } from '../../lib/format';

type Props = {
  minConfidence: number;
  onConfidenceChange: (val: number) => void;
  labels: Record<string, boolean>;
  onToggleLabel: (label: string) => void;
  focusMode: boolean;
  onToggleFocus: () => void;
  compareMode: boolean;
  onToggleCompare: () => void;
};

export function ControlsPanel({
  minConfidence,
  onConfidenceChange,
  labels,
  onToggleLabel,
  focusMode,
  onToggleFocus,
  compareMode,
  onToggleCompare
}: Props) {
  return (
    <div className="card">
      <div className="headline" style={{ fontSize: 18 }}>
        کنترل‌های تحلیل
      </div>
      <div className="form-grid">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <label style={{ fontWeight: 700 }}>آستانه اطمینان</label>
            <span className="pill">{formatNumber(minConfidence)}</span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={minConfidence}
            onChange={(e) => onConfidenceChange(parseFloat(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>برچسب‌ها</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {['fact', 'inference', 'assumption'].map((label) => (
              <button
                key={label}
                type="button"
                className="button button-secondary"
                style={{
                  padding: '8px 12px',
                  borderColor: labels[label] ? 'rgba(106,216,255,0.5)' : 'var(--color-border)'
                }}
                onClick={() => onToggleLabel(label)}
              >
                {label === 'fact' ? 'واقعیت' : label === 'inference' ? 'استنتاج' : 'فرض'}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          <button
            type="button"
            className="button button-secondary"
            style={{ padding: '10px 12px', borderColor: focusMode ? 'rgba(106,216,255,0.6)' : undefined }}
            onClick={onToggleFocus}
          >
            {focusMode ? 'خروج از تمرکز' : 'تمرکز'}
          </button>
          <button
            type="button"
            className="button button-secondary"
            style={{ padding: '10px 12px', borderColor: compareMode ? 'rgba(106,216,255,0.6)' : undefined }}
            onClick={onToggleCompare}
          >
            {compareMode ? 'خروج از مقایسه' : 'مقایسه'}
          </button>
        </div>
      </div>
    </div>
  );
}

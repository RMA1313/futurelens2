import React, { useRef } from 'react';
import { CoverageEntry } from '../../lib/schemas';
import { getModuleLabel, getModuleStatusBadge, getModuleStatusLabel } from '../../lib/i18n/labels';

export function CoveragePanel({
  coverage,
  onSelect,
  highlight
}: {
  coverage?: CoverageEntry[];
  onSelect?: (module: string) => void;
  highlight?: boolean;
}) {
  if (!coverage || !coverage.length) {
    return (
      <div className={`card ${highlight ? 'panel-highlight' : ''}`} id="panel-coverage">
        <div className="headline" style={{ fontSize: 18 }}>
          نقشه پوشش ماژول‌ها
        </div>
        <p className="subhead">نقشه پوشش هنوز آماده نشده است.</p>
      </div>
    );
  }

  return (
    <div className={`card ${highlight ? 'panel-highlight' : ''}`} id="panel-coverage">
      <div className="headline" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        نقشه پوشش ماژول‌ها
        <span
          title="وضعیت هر ماژول بر اساس کفایت داده ورودی تعیین می‌شود. موارد جزئی یا غیرفعال نیازمند اطلاعات تکمیلی هستند."
          style={{ color: 'var(--color-text-muted)', fontSize: 14, cursor: 'help' }}
        >
          ⓘ
        </span>
      </div>
      <div className="section-grid">
        {coverage.map((c) => (
          <CoverageItem key={c.module} entry={c} onSelect={onSelect} />
        ))}
      </div>
    </div>
  );
}

function CoverageItem({ entry, onSelect }: { entry: CoverageEntry; onSelect?: (module: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const missing = entry.missing_information?.join('، ');
  return (
    <div
      ref={ref}
      className="card"
      style={{ background: 'var(--color-surface-2)', cursor: 'pointer', padding: '14px 16px' }}
      onClick={() => onSelect?.(entry.module)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{getModuleLabel(entry.module)}</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.6 }}>
            {missing }
          </div>
        </div>
        <span className={`badge ${getModuleStatusBadge(entry.status)}`}>
          {getModuleStatusLabel(entry.status)}
        </span>
      </div>
    </div>
  );
}

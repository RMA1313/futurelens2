import React, { useRef } from 'react';
import { CoverageEntry } from '../../lib/schemas';

const statusLabel: Record<string, string> = {
  active: 'فعال',
  partial: 'جزئی',
  inactive: 'غیرفعال'
};

const statusBadge: Record<string, string> = {
  active: 'badge-success',
  partial: 'badge-warning',
  inactive: 'badge-muted'
};

export function CoveragePanel({
  coverage,
  onSelect
}: {
  coverage?: CoverageEntry[];
  onSelect?: (module: string) => void;
}) {
  if (!coverage || !coverage.length) {
    return (
      <div className="card" id="panel-coverage">
        <div className="headline" style={{ fontSize: 18 }}>🛡️ پوشش تحلیل</div>
        <p className="subhead">داده پوشش در دسترس نیست.</p>
      </div>
    );
  }

  return (
    <div className="card" id="panel-coverage">
      <div className="headline" style={{ fontSize: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
        🛡️ پوشش تحلیل
        <span
          title="برخی ماژول‌ها به‌دلیل محدودیت داده یا ماهیت سند، به‌صورت جزئی یا غیرفعال اجرا شده‌اند."
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
  const missing = entry.missing_information?.join('؛ ');
  return (
    <div
      ref={ref}
      className="card"
      style={{ background: 'var(--color-surface-2)', cursor: 'pointer', padding: '14px 16px' }}
      onClick={() => onSelect?.(entry.module)}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center' }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 15 }}>{entry.module}</div>
          <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.6 }}>
            {missing || 'پوشش مناسب'}
          </div>
        </div>
        <span className={`badge ${statusBadge[entry.status]}`}>{statusLabel[entry.status]}</span>
      </div>
    </div>
  );
}

import React from 'react';
import { getModuleLabel, getModuleStatusBadge, getModuleStatusLabel, ModuleStatus } from '../../lib/i18n/labels';

type ModuleItem = {
  name: string;
  key: string;
  status: ModuleStatus;
  detail: string;
  done: boolean;
};

export function ModuleProgress({ modules }: { modules: ModuleItem[] }) {
  return (
    <div className="section-grid">
      {modules.map((m) => (
        <div
          key={m.key}
          className="card"
          style={{
            borderColor:
              m.status === 'active'
                ? 'rgba(90, 211, 154, 0.35)'
                : m.status === 'partial'
                  ? 'rgba(240, 192, 90, 0.35)'
                  : 'var(--color-border)',
            position: 'relative',
            overflow: 'hidden',
            padding: '14px 16px'
          }}
        >
          <div
            style={{
              position: 'absolute',
              insetInlineStart: 0,
              top: 0,
              bottom: 0,
              width: 4,
              background:
                m.status === 'active'
                  ? 'linear-gradient(180deg, rgba(90,211,154,0.8), rgba(90,211,154,0.2))'
                  : m.status === 'partial'
                    ? 'linear-gradient(180deg, rgba(240,192,90,0.8), rgba(240,192,90,0.2))'
                    : 'linear-gradient(180deg, rgba(185,194,211,0.6), rgba(185,194,211,0.15))'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 800, fontSize: 15 }}>{getModuleLabel(m.key)}</div>
              <div style={{ fontSize: 12.5, color: 'var(--color-text-muted)', marginTop: 6, lineHeight: 1.6 }}>
                {m.detail}
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${getModuleStatusBadge(m.status)}`}>
                {getModuleStatusLabel(m.status)}
              </span>
              {m.done ? <span className="pill">تکمیل شد</span> : <span className="pill">در حال اجرا</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

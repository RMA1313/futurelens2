import React from 'react';

type ShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: ShellProps) {
  return (
    <div className="layout-shell">
      <header className="nav-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 10,
              height: 10,
              borderRadius: '50%',
              background: 'var(--color-accent)',
              boxShadow: '0 0 0 8px rgba(106, 216, 255, 0.12)'
            }}
            aria-hidden
          />
          <div>
            <div style={{ fontWeight: 800, letterSpacing: '-0.2px' }}>فیوچرلنز</div>
            <div style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
              پلتفرم تحلیل آینده پژوهی مبتنی بر شواهد
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="badge badge-accent">داشبورد تحلیلی</span>
          <span className="badge badge-muted">کاملا فارسی و راست به چپ</span>
        </div>
      </header>
      <main className="page-container">
        {title ? <h1 className="headline">{title}</h1> : null}
        {subtitle ? (
          <p className="subhead" style={{ marginBottom: 16 }}>
            {subtitle}
          </p>
        ) : null}
        <div className="section-grid">{children}</div>
      </main>
    </div>
  );
}

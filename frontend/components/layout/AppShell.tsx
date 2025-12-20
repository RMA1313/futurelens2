'use client';

import React from 'react';
import { BackgroundEffects } from '../system/BackgroundEffects';

type ShellProps = {
  title?: string;
  subtitle?: string;
  children: React.ReactNode;
};

export function AppShell({ title, subtitle, children }: ShellProps) {
  return (
    <div className="layout-shell">
      <BackgroundEffects />
      <div className="content-layer">
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
                اتاق وضعیت آینده‌پژوهی برای تصمیم‌های دقیق و شفاف
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="badge badge-accent">داشبورد وضعیت تحلیل</span>
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
    </div>
  );
}

'use client';

import Image from 'next/image';
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
            <div>
              <div className="logo-text-row">
                <Image
                  src="/logo.gif"
                  alt="???? ????? ????"
                  className="logo-live-indicator"
                  width={100}
                  height={100}
                  unoptimized
                />
                <div style={{ fontWeight: 800, letterSpacing: '-0.2px' }}>فیوچرلنز</div>
              </div>
            </div>
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

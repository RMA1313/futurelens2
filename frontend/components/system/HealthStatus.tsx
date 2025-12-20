'use client';

import React from 'react';

type HealthState = {
  status: 'loading' | 'healthy' | 'degraded' | 'offline';
  message: string;
  demo: boolean;
};

export function HealthStatus() {
  const [health, setHealth] = React.useState<HealthState>({
    status: 'loading',
    message: 'در حال بررسی سلامت سامانه',
    demo: false
  });

  React.useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await import('../../lib/api').then((m) => m.fetchHealth());
        if (!active) return;
        const demo = !data.providerConfigured;
        setHealth({
          status: 'healthy',
          message: demo
            ? 'حالت نمایشی فعال است؛ کلید مدل زبانی تنظیم نشده است.'
            : 'اتصال پایدار',
          demo
        });
      } catch (_) {
        if (!active) return;
        setHealth({
          status: 'offline',
          message: 'ارتباط با سرویس برقرار نشد؛ دوباره تلاش کنید.',
          demo: true
        });
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const colorClass =
    health.status === 'healthy'
      ? 'badge-success'
      : health.status === 'degraded'
        ? 'badge-warning'
        : 'badge-muted';

  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <span className={`badge ${colorClass}`}>
        {health.status === 'healthy'
          ? 'سالم'
          : health.status === 'degraded'
            ? 'ناپایدار'
            : 'خارج از دسترس'}
      </span>
      <span className="pill">{health.message}</span>
      {health.demo ? <span className="pill">حالت نمایشی</span> : null}
    </div>
  );
}

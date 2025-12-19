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
    message: 'در حال بررسی وضعیت',
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
          message: demo ? 'حالت دمو (کلید LLM موجود نیست)' : 'اتصال پایدار',
          demo
        });
      } catch (_) {
        if (!active) return;
        setHealth({
          status: 'offline',
          message: 'عدم دسترسی به سرویس؛ ادامه با داده نمایشی',
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
            ? 'نیمه‌فعال'
            : 'غیرفعال'}
      </span>
      <span className="pill">{health.message}</span>
      {health.demo ? <span className="pill">حالت دمو</span> : null}
    </div>
  );
}

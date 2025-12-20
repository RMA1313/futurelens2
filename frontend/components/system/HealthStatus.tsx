'use client';

import React from 'react';

type HealthState = {
  status: 'loading' | 'healthy' | 'degraded' | 'offline';
  message: string;
  demo: boolean;
};

export function HealthStatus() {
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
  
    </div>
  );
}

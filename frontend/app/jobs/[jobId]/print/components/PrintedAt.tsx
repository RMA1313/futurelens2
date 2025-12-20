'use client';

import React from 'react';

const PRINTED_AT_OPTIONS: Intl.DateTimeFormatOptions = {
  year: 'numeric',
  month: 'long',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit'
};

export function PrintedAt() {
  const [label, setLabel] = React.useState('در حال آماده‌سازی...');

  React.useEffect(() => {
    const now = new Date();
    setLabel(now.toLocaleString('fa-IR', PRINTED_AT_OPTIONS));
  }, []);

  return (
    <span className="printed-at" suppressHydrationWarning>
      {label}
    </span>
  );
}

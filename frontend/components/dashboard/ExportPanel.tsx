import React from 'react';
import { Report } from '../../lib/schemas';

export function ExportPanel({ report, jobId }: { report?: Report; jobId: string }) {
  const handleDownload = () => {
    if (!report) return;
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const link = document.createElement('a');
    link.href = dataStr;
    link.download = `گزارش-فیچرلنز-${jobId}.json`;
    link.click();
  };

  return (
    <div className="card">
      <div className="headline" style={{ fontSize: 18 }}>خروجی و چاپ</div>
      <div className="subhead" style={{ marginBottom: 12 }}>
        دریافت JSON ساخت‌یافته یا نسخه چاپی فارسی.
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button className="button button-primary" type="button" onClick={handleDownload} disabled={!report}>
          دانلود JSON
        </button>
        <a className="button button-secondary" style={{ padding: '12px 16px' }} href={`/jobs/${jobId}/print`} target="_blank" rel="noreferrer">
          نسخه چاپی
        </a>
      </div>
      {!report ? <p className="subhead" style={{ marginTop: 8 }}>گزارش هنوز بارگذاری نشده است.</p> : null}
    </div>
  );
}

import React from 'react';
type Props = {
  jobId: string;
  status: string;
  stage: 'triage' | 'evidence' | 'synthesis';
  progress: number;
  lastUpdate: string;
  demo: boolean;
};

export function JobHeader({ jobId, status, stage, progress, lastUpdate, demo }: Props) {
  const percent = Math.round(progress * 100);
  const statusLabel =
    status === 'succeeded'
      ? 'تکمیل'
      : status === 'failed'
        ? 'خطا'
        : status === 'running'
          ? 'در حال اجرا'
          : 'در صف';

  const stageLabel =
    stage === 'triage' ? 'شناخت و پوشش' : stage === 'evidence' ? 'استخراج شواهد' : 'ترکیب و سناریو';

  return (
    <div className="card">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: 12,
          alignItems: 'center'
        }}
      >
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>🛰️ وضعیت تحلیل جاری</div>
          <div className="subhead" style={{ marginTop: 4 }}>
            شناسه تحلیل و وضعیت زمان‌بندی.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span className="pill">jobId: {jobId}</span>
          <span className={`badge ${status === 'failed' ? 'badge-warning' : 'badge-accent'}`}>
            {statusLabel}
          </span>
          <span className="pill">وضعیت مفهومی: {stageLabel}</span>
          <span className="pill">آخرین به‌روزرسانی: {lastUpdate}</span>
          {demo ? (
            <span className="badge badge-warning" title="این تحلیل در حالت نمایشی اجرا شده و نتایج صرفاً نمونه هستند.">
              دمو
            </span>
          ) : (
            <span className="badge badge-success">واقعی</span>
          )}
        </div>
      </div>
      <div style={{ marginTop: 18 }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: 6,
            color: 'var(--color-text-muted)',
            fontSize: 13
          }}
        >
          <span>پیشرفت مفهومی</span>
          <span>{percent}%</span>
        </div>
        <div
          style={{
            position: 'relative',
            height: 10,
            borderRadius: 999,
            background: 'var(--color-surface-2)',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              position: 'absolute',
              insetInlineStart: 0,
              top: 0,
              bottom: 0,
              width: `${percent}%`,
              background:
                stage === 'triage'
                  ? 'linear-gradient(90deg, rgba(115,183,255,0.8), rgba(115,183,255,0.4))'
                  : stage === 'evidence'
                    ? 'linear-gradient(90deg, rgba(106,216,255,0.9), rgba(90,211,154,0.6))'
                    : 'linear-gradient(90deg, rgba(90,211,154,0.9), rgba(240,192,90,0.6))',
              transition: `width var(--motion-mid) var(--ease-emphasis)`
            }}
          />
        </div>
      </div>
    </div>
  );
}

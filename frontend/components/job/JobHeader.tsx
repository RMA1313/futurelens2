import React from 'react';
import { formatDateTime, formatId, formatPercent } from '../../lib/format';

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
      ? 'موفق'
      : status === 'failed'
        ? 'ناموفق'
        : status === 'running'
          ? 'در حال اجرا'
          : 'در انتظار';

  const stageLabel =
    stage === 'triage'
      ? 'پایش اولیه و ارزیابی'
      : stage === 'evidence'
        ? 'استخراج شواهد'
        : 'ترکیب و جمع‌بندی';

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
          <div style={{ fontWeight: 800, fontSize: 18 }}>نمای کلی وضعیت تحلیل</div>
          <div className="subhead" style={{ marginTop: 4 }}>
            پیگیری روند تحلیل و میزان پیشرفت در هر مرحله.
          </div>
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
          <span>درصد پیشرفت</span>
          <span>{formatPercent(percent)}</span>
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

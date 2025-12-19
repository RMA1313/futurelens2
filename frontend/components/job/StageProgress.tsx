import React from 'react';

type PipelineStage = 'triage' | 'evidence' | 'synthesis';

const stages: { key: PipelineStage; label: string; desc: string }[] = [
  { key: 'triage', label: 'شناخت و پوشش', desc: 'طبقه‌بندی سند و تعیین ماژول‌ها' },
  { key: 'evidence', label: 'استخراج شواهد', desc: 'قطعه‌بندی و جمع‌آوری ارجاعات' },
  { key: 'synthesis', label: 'ترکیب و سناریو', desc: 'تحلیل مشتق و سناریوسازی' }
];

export function StageProgress({ current }: { current: PipelineStage }) {
  const currentIndex = stages.findIndex((s) => s.key === current);

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: 12
      }}
    >
      {stages.map((stage, index) => {
        const state = index < currentIndex ? 'done' : index === currentIndex ? 'active' : 'upcoming';
        const color =
          state === 'done'
            ? 'var(--color-success)'
            : state === 'active'
              ? 'var(--color-accent)'
              : 'var(--color-text-muted)';
        const border =
          state === 'done'
            ? 'rgba(90, 211, 154, 0.4)'
            : state === 'active'
              ? 'rgba(106, 216, 255, 0.4)'
              : 'var(--color-border)';
        return (
          <div
            key={stage.key}
            className="card"
            style={{
              padding: '18px',
              borderColor: border,
              boxShadow: state === 'active' ? '0 12px 40px rgba(73, 177, 255, 0.16)' : undefined,
              transform: state === 'active' ? 'translateY(-2px)' : undefined,
              transition: `all var(--motion-mid) var(--ease-standard)`
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: '50%',
                  background: color,
                  boxShadow:
                    state === 'active'
                      ? '0 0 0 6px rgba(106, 216, 255, 0.15)'
                      : '0 0 0 4px rgba(185, 194, 211, 0.08)'
                }}
              />
              <div>
                <div style={{ fontWeight: 800, color }}>{stage.label}</div>
                <div style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 4 }}>
                  {stage.desc}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

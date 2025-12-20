import React from 'react';
import { DocumentProfile } from '../../lib/schemas';

export function DocumentProfileCard({
  profile,
  highlight,
  panelId
}: {
  profile?: DocumentProfile;
  highlight?: boolean;
  panelId?: string;
}) {
  if (!profile) {
    return (
      <div className={`card ${highlight ? 'panel-highlight' : ''}`} id={panelId || 'panel-document'}>
        <div className="headline" style={{ fontSize: 18 }}>
          پروفایل سند
        </div>
        <p className="subhead">پروفایل سند هنوز آماده نشده است.</p>
      </div>
    );
  }

  return (
    <div className={`card ${highlight ? 'panel-highlight' : ''}`} id={panelId || 'panel-document'}>
      <div className="headline" style={{ fontSize: 20 }}>
        پروفایل سند
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 10 }}>
        <Info label="نوع سند" value={profile.document_type} />
        <Info label="حوزه" value={profile.domain} />
        <Info label="افق زمانی" value={profile.horizon} />
        <Info label="سطح تحلیل" value={profile.analytical_level} />
      </div>
      {profile.limitations?.length ? (
        <div style={{ marginTop: 12 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>محدودیت‌های تحلیل</div>
          <ul style={{ color: 'var(--color-text-muted)', paddingInlineStart: 20, lineHeight: 1.7, margin: 0 }}>
            {profile.limitations.map((l, idx) => (
              <li key={idx}>{l}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function Info({ label, value }: { label: string; value?: string }) {
  return (
    <div
      className="card"
      style={{
        background: 'var(--color-surface-2)',
        padding: '12px 14px',
        border: '1px solid var(--color-border)'
      }}
    >
      <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{label}</div>
      <div style={{ fontWeight: 800, fontSize: 15 }}>{value || 'نامشخص'}</div>
    </div>
  );
}

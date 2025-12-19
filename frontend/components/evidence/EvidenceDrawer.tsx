import React from 'react';
import { EvidenceItem } from '../../lib/schemas';

type Props = {
  evidence?: EvidenceItem[];
  openId?: string | null;
  onClose: () => void;
  onSelect: (id: string) => void;
};

export function EvidenceDrawer({ evidence = [], openId, onClose, onSelect }: Props) {
  const [search, setSearch] = React.useState('');
  const term = search.trim();
  const filtered = evidence.filter((e) => {
    if (!term) return true;
    return (e.snippet && e.snippet.includes(term)) || e.chunk_id.includes(term);
  });
  const current = evidence.find((e) => e.id === openId);

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: openId ? 'rgba(0,0,0,0.35)' : 'transparent',
        pointerEvents: openId ? 'auto' : 'none',
        transition: 'background var(--motion-mid) var(--ease-standard)',
        zIndex: 50
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'absolute',
          insetInlineStart: 0,
          top: 0,
          bottom: 0,
          width: '440px',
          maxWidth: '90vw',
          background: 'var(--color-surface)',
          borderInlineEnd: '1px solid var(--color-border)',
          transform: openId ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform var(--motion-mid) var(--ease-standard)',
          display: 'grid',
          gridTemplateRows: 'auto 1fr',
          boxShadow: 'var(--shadow-strong)'
        }}
      >
        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--color-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontWeight: 800 }}>🧾 اکسپلورر شواهد</div>
          <button className="button button-secondary" style={{ padding: '8px 12px' }} onClick={onClose}>
            بستن
          </button>
        </div>
        <div style={{ overflow: 'hidden', display: 'grid', gridTemplateColumns: '180px 1fr' }}>
          <div style={{ borderInlineEnd: '1px solid var(--color-border)', padding: 12, display: 'grid', gap: 10 }}>
            <input
              className="input-field"
              placeholder="جستجوی شواهد"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <div style={{ overflowY: 'auto', maxHeight: '60vh', display: 'grid', gap: 6, paddingInlineEnd: 4 }}>
              {filtered.map((e) => (
                <button
                  key={e.id}
                  type="button"
                  className="pill"
                  style={{
                    justifyContent: 'space-between',
                    borderColor: e.id === openId ? 'rgba(106,216,255,0.6)' : 'var(--color-border)',
                    cursor: 'pointer'
                  }}
                  onClick={() => onSelect(e.id)}
                >
                  <span>{e.id}</span>
                  <span style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>{e.chunk_id}</span>
                </button>
              ))}
              {!filtered.length ? <div className="subhead">یافت نشد.</div> : null}
            </div>
          </div>
          <div style={{ padding: 14, overflowY: 'auto' }}>
            {current ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800 }}>شاهد {current.id}</div>
                    <div className="subhead">قطعه: {current.chunk_id}</div>
                  </div>
                  <span className="pill">{current.kind}</span>
                </div>
                <div style={{ marginTop: 10, fontSize: 13, color: 'var(--color-text-muted)' }}>
                  {current.snippet}
                </div>
                {current.content ? (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--color-surface-2)',
                      lineHeight: 1.8
                    }}
                  >
                    {current.content}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="subhead">برای مشاهده، یک شاهد را انتخاب کنید.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

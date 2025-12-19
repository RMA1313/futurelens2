'use client';

import React from 'react';
import { ClarificationQuestion } from '../../lib/schemas';
import { submitClarifications } from '../../lib/api';

type Props = {
  jobId: string;
  questions: ClarificationQuestion[];
  onSubmitted?: () => void;
};

export function ClarificationPanel({ jobId, questions, onSubmitted }: Props) {
  const [answers, setAnswers] = React.useState<Record<string, string>>({});
  const [status, setStatus] = React.useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  if (!questions.length) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = questions
      .map((q) => ({ questionId: q.id, answer: answers[q.id] ?? '' }))
      .filter((a) => a.answer.trim().length > 0);
    if (!payload.length) {
      setStatus('error');
      return;
    }
    setStatus('sending');
    try {
      await submitClarifications(jobId, payload);
      setStatus('sent');
      if (onSubmitted) onSubmitted();
    } catch (_) {
      setStatus('error');
    }
  };

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
        <div>
          <div style={{ fontWeight: 800, fontSize: 18 }}>💬 سوالات تکمیلی</div>
        </div>
        <span className="badge badge-warning">نیاز به پاسخ</span>
      </div>
      <form onSubmit={handleSubmit} className="form-grid" style={{ marginTop: 12 }}>
        {questions.map((q) => (
          <div key={q.id} className="card" style={{ background: 'var(--color-surface-2)' }}>
            <div style={{ fontWeight: 700, marginBottom: 8 }}>{q.question}</div>
            <textarea
              className="input-field"
              style={{ minHeight: 80 }}
              placeholder="پاسخ تحلیلی (فارسی)"
              value={answers[q.id] ?? ''}
              onChange={(e) => setAnswers((prev) => ({ ...prev, [q.id]: e.target.value }))}
            />
          </div>
        ))}
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="submit" className="button button-primary" disabled={status === 'sending'}>
            {status === 'sending' ? 'در حال ارسال...' : 'ارسال و اجرای مجدد'}
          </button>
          {status === 'sent' ? <span className="pill">ارسال شد؛ اجرای مجدد</span> : null}
          {status === 'error' ? (
            <span className="pill" style={{ color: '#ff9b9b', borderColor: 'rgba(255,123,123,0.5)' }}>
              خطا در ارسال. دوباره تلاش کنید.
            </span>
          ) : null}
        </div>
      </form>
    </div>
  );
}

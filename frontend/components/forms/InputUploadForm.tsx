'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { createJob } from '../../lib/api';

type SubmissionState = 'idle' | 'submitting' | 'success' | 'error';

export function InputUploadForm() {
  const router = useRouter();
  const [text, setText] = React.useState('');
  const [fileName, setFileName] = React.useState<string | null>(null);
  const [fileObj, setFileObj] = React.useState<File | null>(null);
  const [status, setStatus] = React.useState<SubmissionState>('idle');
  const [message, setMessage] = React.useState<string>('');

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      setFileObj(file);
    } else {
      setFileName(null);
      setFileObj(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() && !fileName) {
      setStatus('error');
      setMessage('لطفاً متن یا فایل معتبر وارد کنید.');
      return;
    }
    setStatus('submitting');
    setMessage('در حال آماده‌سازی و ارسال...');
    try {
      const jobId = await createJob({ text, file: fileObj ?? undefined });
      setStatus('success');
      setMessage('درخواست دریافت شد؛ انتقال به وضعیت تحلیل...');
      router.push(`/jobs/${jobId}`);
    } catch (err) {
      setStatus('error');
      setMessage('ارسال با خطا مواجه شد. دوباره تلاش کنید.');
    }
  };

  return (
    <form className="form-grid" onSubmit={handleSubmit}>
      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>متن ورودی</label>
        <textarea
          className="input-field"
          style={{ minHeight: 160, resize: 'vertical' }}
          placeholder="متن سند یا گزارش تحلیلی"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <p className="helper-text">متن فارسی/RTL؛ پاکسازی و تقسیم به صورت خودکار انجام می‌شود.</p>
      </div>

      <div>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 700 }}>بارگذاری فایل</label>
        <div
          style={{
            border: '1px dashed var(--color-border)',
            borderRadius: 'var(--radius-md)',
            padding: '18px',
            background: 'var(--color-surface-2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12
          }}
        >
          <div>
            <div style={{ fontWeight: 600 }}>{fileName ?? 'هیچ فایلی انتخاب نشده است'}</div>
            <div className="helper-text">PDF / DOCX / TXT تا ۵ مگابایت</div>
          </div>
          <label className="button button-secondary" style={{ cursor: 'pointer' }}>
            انتخاب فایل
            <input
              type="file"
              accept=".pdf,.doc,.docx,.txt"
              style={{ display: 'none' }}
              onChange={handleFile}
            />
          </label>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <button type="submit" className="button button-primary" disabled={status === 'submitting'}>
          {status === 'submitting' ? 'در حال ارسال...' : 'ارسال برای تحلیل'}
        </button>
        <button
          type="button"
          className="button button-secondary"
          onClick={() => {
            setText('');
            setFileName(null);
            setStatus('idle');
            setMessage('');
          }}
        >
          پاکسازی
        </button>
        {message && (
          <span
            className="pill"
            style={{
              borderColor:
                status === 'error'
                  ? 'rgba(255, 123, 123, 0.5)'
                  : status === 'success'
                    ? 'rgba(90, 211, 154, 0.5)'
                    : 'var(--color-border)',
              color: status === 'error' ? '#ff9b9b' : undefined
            }}
          >
            {message}
          </span>
        )}
      </div>
    </form>
  );
}

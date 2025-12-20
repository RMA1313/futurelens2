'use client';

import React from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '../../../components/layout/AppShell';
import { JobHeader } from '../../../components/job/JobHeader';
import { StageProgress } from '../../../components/job/StageProgress';
import { ModuleProgress } from '../../../components/job/ModuleProgress';
import { ClarificationPanel } from '../../../components/job/ClarificationPanel';
import { fetchJob } from '../../../lib/api';
import type { CoverageEntry, JobStatus, ClarificationQuestion } from '../../../lib/schemas';

type ViewState = 'loading' | 'ready' | 'error';

function deriveStage(outputs?: JobStatus['outputs']): 'triage' | 'evidence' | 'synthesis' {
  if ((outputs as any)?.report) return 'synthesis';
  if ((outputs as any)?.evidence) return 'evidence';
  return 'triage';
}

function mapModules(coverage?: CoverageEntry[]) {
  if (!coverage) return [];
  return coverage.map((c) => ({
    name: c.module,
    key: c.module,
    status: c.status,
    detail:
      c.status === 'active'
        ? 'این بخش در حال اجرا است.'
        : c.status === 'partial'
          ? 'اطلاعات ناقص است؛ برای تکمیل پاسخ دهید.'
          : 'این بخش غیرفعال است؛ اطلاعات کافی وجود ندارد.',
    done: false
  }));
}

export default function JobPage() {
  const params = useParams<{ jobId: string }>();
  const jobId = params.jobId;
  const router = useRouter();

  const [view, setView] = React.useState<ViewState>('loading');
  const [job, setJob] = React.useState<JobStatus | null>(null);
  const [lastUpdated, setLastUpdated] = React.useState<string>('');
  const [error, setError] = React.useState<string | null>(null);
  const [pollInterval, setPollInterval] = React.useState(2000);

  const fetchAndSet = React.useCallback(async () => {
    try {
      const data = await fetchJob(jobId);
      setJob(data);
      setLastUpdated(new Date().toLocaleString('fa-IR'));
      setView('ready');
      setError(null);
      if (data.status === 'succeeded' || data.status === 'failed') {
        setPollInterval(8000);
      } else {
        setPollInterval((prev) => Math.min(prev + 800, 5000));
      }
    } catch (err) {
      setError('دریافت وضعیت تحلیل با خطا روبه‌رو شد.');
      setView('error');
    }
  }, [jobId]);

  React.useEffect(() => {
    fetchAndSet();
  }, [fetchAndSet]);

  React.useEffect(() => {
    if (!job || job.status === 'succeeded' || job.status === 'failed') return;
    const timer = setTimeout(() => fetchAndSet(), pollInterval);
    return () => clearTimeout(timer);
  }, [job, pollInterval, fetchAndSet]);

  const stage = deriveStage(job?.outputs);
  const modules = mapModules(job?.outputs?.coverage);
  const questions: ClarificationQuestion[] = job?.clarifications?.questions ?? [];

  const statusLabel =
    job?.status === 'failed'
      ? 'تحلیل با خطا متوقف شد. دوباره تلاش کنید.'
      : job?.status === 'succeeded'
        ? 'تحلیل کامل شد. می‌توانید نتایج را ببینید.'
        : 'تحلیل در حال اجرا است.';

  return (
    <AppShell title="وضعیت تحلیل" subtitle="">
      {view === 'error' ? (
        <section className="card">
          <h2 className="headline" style={{ fontSize: 18, color: '#ff9b9b' }}>
            خطا در دریافت وضعیت تحلیل
          </h2>
          <p className="subhead">{error}</p>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="button button-primary" onClick={() => fetchAndSet()}>
              تلاش دوباره
            </button>
            <button className="button button-secondary" onClick={() => router.push('/')}>
              بازگشت به ورودی
            </button>
          </div>
        </section>
      ) : null}

      {job ? (
        <>
          <section className="card">
            <JobHeader
              jobId={job.id}
              status={job.status}
              stage={stage}
              progress={job.progress}
              lastUpdate={lastUpdated}
              demo={job.status !== 'succeeded'}
            />
            <p className="subhead" style={{ marginTop: 8 }}>
              {statusLabel}
            </p>
            {job.status === 'succeeded' ? (
              <div style={{ marginTop: 10 }}>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => router.push(`/jobs/${job.id}/results`)}
                >
                  مشاهده نتایج تحلیل
                </button>
              </div>
            ) : null}
          </section>

          <section className="card">
            <h2 className="headline" style={{ fontSize: 20 }}>
              مراحل تحلیل
            </h2>
            <StageProgress current={stage} />
          </section>

          <section className="card">
            <h2 className="headline" style={{ fontSize: 20 }}>
              ماژول‌های فعال
            </h2>
            <ModuleProgress modules={modules} />
          </section>

          {questions.length ? (
            <ClarificationPanel jobId={job.id} questions={questions} onSubmitted={() => fetchAndSet()} />
          ) : null}

          {job.status === 'failed' ? (
            <section className="card">
              <h3 className="headline" style={{ fontSize: 18 }}>
                تحلیل به نتیجه نرسید
              </h3>
              <p className="subhead">
                اگر خطا موقتی است، دوباره تلاش کنید یا داده ورودی را بررسی کنید.
              </p>
              <button className="button button-primary" onClick={() => fetchAndSet()}>
                تلاش دوباره
              </button>
            </section>
          ) : null}
        </>
      ) : null}
    </AppShell>
  );
}

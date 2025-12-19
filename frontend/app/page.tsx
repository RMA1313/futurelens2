import { AppShell } from '../components/layout/AppShell';
import { HealthStatus } from '../components/system/HealthStatus';
import { InputUploadForm } from '../components/forms/InputUploadForm';

export default function HomePage() {
  return (
    <AppShell title="ورود داده و آغاز تحلیل" subtitle="">
      <section className="card">
        <h2 className="headline" style={{ fontSize: 20 }}>📝 ارسال متن یا فایل</h2>
        <InputUploadForm />
      </section>
    </AppShell>
  );
}

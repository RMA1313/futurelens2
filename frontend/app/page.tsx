import { AppShell } from '../components/layout/AppShell';
import { InputUploadForm } from '../components/forms/InputUploadForm';

export default function HomePage() {
  return (
    <AppShell title="ورودی و بارگذاری تحلیل" subtitle="">
      <section className="card">
        <h2 className="headline" style={{ fontSize: 20 }}>
          متن یا فایل را برای تحلیل ارسال کنید
        </h2>
        <InputUploadForm />
      </section>
    </AppShell>
  );
}

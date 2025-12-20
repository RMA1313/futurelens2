import type { Metadata } from 'next';
import { Vazirmatn } from 'next/font/google';
import '../styles/globals.css';

const vazirmatn = Vazirmatn({
  subsets: ['arabic'],
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  title: 'فیوچرلنز | پلتفرم تحلیل آینده پژوهی',
  description: 'داشبورد تحلیلی آینده پژوهی با تمرکز بر شواهد، شفافیت و پیگیری منبع'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fa" dir="rtl">
      <body className={vazirmatn.className}>{children}</body>
    </html>
  );
}

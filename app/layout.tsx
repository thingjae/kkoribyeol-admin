import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '../lib/auth';
import { AdminHeader } from '../components/admin-header';

export const metadata: Metadata = {
  title: '꼬리별 어드민',
  description: '꼬리별 반려동물 호텔 직원용 화면',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <AuthProvider>
          <AdminHeader />
          <main className="mx-auto w-full max-w-[1040px] px-5 py-6 pb-16">{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}

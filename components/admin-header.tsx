'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../lib/auth';

const MENU = [
  { href: '/', label: '오늘 현황', exact: true },
  { href: '/reservations', label: '예약 전체' },
  { href: '/rooms', label: '빈 방' },
  { href: '/guardians', label: '보호자·반려동물' },
];

export function AdminHeader() {
  const { me, signOut } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  if (!me) return null;

  const menu = me.role === 'ADMIN' ? [...MENU, { href: '/staff', label: '직원 계정' }] : MENU;

  return (
    <header className="bg-white border-b border-[var(--line)] shadow-[var(--shadow-header)]">
      <div className="mx-auto w-full max-w-[1040px] px-5">
        <div className="h-14 flex items-center justify-between">
          <Link href="/" className="t-title-l text-[var(--primary)]">
            꼬리별 어드민
          </Link>
          <div className="flex items-center gap-3">
            <span className="t-body-s text-[var(--text-sub)]">
              {me.name} · {me.role === 'ADMIN' ? '관리자' : '일반 직원'}
            </span>
            <Link href="/password" className="text-[13px] font-semibold text-[var(--text-sub)]">
              비밀번호
            </Link>
            <button
              type="button"
              className="text-[13px] font-semibold text-[var(--text-sub)]"
              onClick={() => {
                signOut();
                router.push('/login');
              }}
            >
              로그아웃
            </button>
          </div>
        </div>

        {me.mustChangePassword ? null : (
          <nav className="flex gap-1 -mb-px overflow-x-auto">
            {menu.map((item) => {
              const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`shrink-0 px-3 py-2 text-[14px] font-semibold border-b-2 ${
                    active
                      ? 'border-[var(--primary)] text-[var(--primary)]'
                      : 'border-transparent text-[var(--text-sub)]'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

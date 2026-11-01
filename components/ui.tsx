'use client';

import type { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from 'react';

/* DESIGN.md의 토큰만 쓴다. 색·모양을 따로 바꾸지 않는다. */

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'destructive' | 'subtle' | 'text';
  size?: 'large' | 'medium' | 'small';
  full?: boolean;
};

const BUTTON_VARIANT: Record<string, string> = {
  primary: 'bg-[var(--primary)] text-white hover:opacity-90',
  secondary: 'bg-white text-[var(--text)] border border-[var(--line)] hover:bg-[var(--bg-sub)]',
  destructive: 'bg-white text-[var(--primary)] border border-[var(--primary)] hover:bg-[var(--primary-weak)]',
  subtle: 'bg-[var(--primary-weak)] text-[var(--primary)] hover:opacity-90',
  text: 'bg-transparent text-[var(--text-sub)] hover:text-[var(--text)]',
};

const BUTTON_SIZE: Record<string, string> = {
  large: 'h-12 px-5 rounded-[12px] t-ui',
  medium: 'h-10 px-4 rounded-[8px] text-[14px] font-semibold',
  small: 'h-8 px-3 rounded-[8px] text-[13px] font-semibold',
};

export function Button({
  variant = 'primary',
  size = 'medium',
  full,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`inline-flex items-center justify-center gap-1 transition disabled:opacity-40 disabled:cursor-not-allowed ${BUTTON_VARIANT[variant]} ${BUTTON_SIZE[size]} ${full ? 'w-full' : ''} ${className}`}
    />
  );
}

export function Card({
  children,
  className = '',
  padded = true,
}: {
  children: ReactNode;
  className?: string;
  padded?: boolean;
}) {
  return (
    <div
      className={`bg-white rounded-[12px] border border-[var(--line)] shadow-[var(--shadow-flat)] ${padded ? 'p-5' : ''} ${className}`}
    >
      {children}
    </div>
  );
}

export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <label className="block">
      <span className="block mb-2 text-[13px] font-semibold text-[var(--text)]">{label}</span>
      {children}
      {hint ? <span className="block mt-1 t-caption text-[var(--text-sub)]">{hint}</span> : null}
    </label>
  );
}

const CONTROL =
  'w-full h-11 px-3 rounded-[8px] border border-[var(--line)] bg-white text-[14px] outline-none focus:border-[var(--primary)] disabled:bg-[var(--bg-sub)]';

export function Input({ className = '', ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...rest} className={`${CONTROL} ${className}`} />;
}

export function Select({ className = '', ...rest }: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...rest} className={`${CONTROL} ${className}`} />;
}

export function Alert({ kind = 'error', children }: { kind?: 'error' | 'info' | 'success'; children: ReactNode }) {
  const tone = {
    error: 'bg-[var(--primary-weak)] text-[var(--primary)]',
    info: 'bg-[#EAF6FC] text-[var(--cyan)]',
    success: 'bg-[#EAF7EE] text-[var(--green)]',
  }[kind];
  return <div className={`rounded-[8px] px-4 py-3 text-[13px] leading-5 ${tone}`}>{children}</div>;
}

const BADGE_TONE: Record<string, string> = {
  RESERVED: 'bg-[var(--primary-weak)] text-[var(--primary)]',
  CHECKED_IN: 'bg-[#EAF6FC] text-[var(--cyan)]',
  CHECKED_OUT: 'bg-[#EAF7EE] text-[var(--green)]',
  CANCELED: 'bg-[var(--bg-sub)] text-[var(--text-weak)]',
};

export function Badge({ status, children }: { status?: string; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center h-6 px-2 rounded-[4px] text-[12px] font-semibold ${BADGE_TONE[status ?? ''] ?? 'bg-[var(--bg-sub)] text-[var(--text-sub)]'}`}
    >
      {children}
    </span>
  );
}

export function PageTitle({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-5">
      <h1 className="t-display-s">{title}</h1>
      {description ? <p className="mt-1 t-body-s text-[var(--text-sub)]">{description}</p> : null}
    </div>
  );
}

export function Empty({ children }: { children: ReactNode }) {
  return (
    <div className="py-14 text-center t-body-m text-[var(--text-sub)]">{children}</div>
  );
}

export function Loading() {
  return <div className="py-14 text-center t-body-m text-[var(--text-sub)]">불러오는 중…</div>;
}

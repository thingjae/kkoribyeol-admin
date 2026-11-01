'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth';
import { Alert, Button, Card, Field, Input } from '../../components/ui';

export default function AdminLoginPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    setBusy(true);
    try {
      const result = await api<{ token: string; user: { mustChangePassword: boolean } }>(
        '/auth/staff/login',
        { method: 'POST', body: { email, password } },
      );
      await signIn(result.token);
      router.push(result.user.mustChangePassword ? '/password' : '/');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '로그인하지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mx-auto max-w-[400px] pt-10">
      <h1 className="t-display-m text-center mb-1">꼬리별 어드민</h1>
      <p className="t-body-s text-[var(--text-sub)] text-center mb-6">직원 전용 화면입니다.</p>
      <Card>
        <form onSubmit={submit} className="space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          <Field label="이메일">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </Field>
          <Field label="비밀번호">
            <Input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="large" full disabled={busy}>
            {busy ? '확인하는 중…' : '로그인'}
          </Button>
        </form>
      </Card>
      <p className="mt-4 t-caption text-[var(--text-sub)] text-center">
        직원 계정은 회원가입이 없습니다. 관리자에게 만들어 달라고 하세요.
      </p>
    </div>
  );
}

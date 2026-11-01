'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { api } from '../../lib/api';
import { useAuth, useRequireStaff } from '../../lib/auth';
import { Alert, Button, Card, Field, Input, Loading, PageTitle } from '../../components/ui';

export default function PasswordPage() {
  const { me, loading } = useRequireStaff({ allowWhileReset: true });
  const { signOut } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError('');
    if (newPassword !== confirm) {
      setError('새 비밀번호가 서로 다릅니다.');
      return;
    }
    setBusy(true);
    try {
      await api('/auth/staff/change-password', {
        method: 'POST',
        body: { currentPassword, newPassword },
      });
      // 비밀번호가 바뀌었으니 다시 로그인하게 한다
      signOut();
      router.replace('/login');
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '바꾸지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !me) return <Loading />;

  return (
    <div className="mx-auto max-w-[440px]">
      <PageTitle title="비밀번호 바꾸기" />
      {me.mustChangePassword ? (
        <div className="mb-4">
          <Alert kind="info">
            임시 비밀번호를 쓰고 있습니다. 새 비밀번호를 정해야 다른 화면을 쓸 수 있습니다.
          </Alert>
        </div>
      ) : null}
      <Card>
        <form onSubmit={submit} className="space-y-4">
          {error ? <Alert>{error}</Alert> : null}
          <Field label="지금 쓰는 비밀번호">
            <Input
              type="password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
              required
            />
          </Field>
          <Field label="새 비밀번호" hint="8자 이상">
            <Input
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              required
            />
          </Field>
          <Field label="새 비밀번호 다시">
            <Input
              type="password"
              value={confirm}
              onChange={(event) => setConfirm(event.target.value)}
              required
            />
          </Field>
          <Button type="submit" size="large" full disabled={busy}>
            {busy ? '바꾸는 중…' : '비밀번호 바꾸기'}
          </Button>
        </form>
      </Card>
    </div>
  );
}

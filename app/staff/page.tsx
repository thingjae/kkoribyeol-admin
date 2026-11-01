'use client';

import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { api, type StaffRow } from '../../lib/api';
import { useRequireStaff } from '../../lib/auth';
import {
  Alert,
  Badge,
  Button,
  Card,
  Field,
  Input,
  Loading,
  PageTitle,
  Select,
} from '../../components/ui';

export default function StaffPage() {
  const { me, loading } = useRequireStaff();
  const [rows, setRows] = useState<StaffRow[] | null>(null);
  const [form, setForm] = useState({ email: '', name: '', role: 'STAFF' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [issued, setIssued] = useState<{ email: string; password: string } | null>(null);

  const load = useCallback(() => {
    void api<StaffRow[]>('/staff')
      .then(setRows)
      .catch(() => setRows([]));
  }, []);

  useEffect(() => {
    if (me && me.role === 'ADMIN' && !me.mustChangePassword) load();
  }, [me, load]);

  async function create(event: FormEvent) {
    event.preventDefault();
    setError('');
    setIssued(null);
    setBusy(true);
    try {
      const result = await api<{ staff: StaffRow; tempPassword: string }>('/staff', {
        method: 'POST',
        body: form,
      });
      setIssued({ email: result.staff.email, password: result.tempPassword });
      setForm({ email: '', name: '', role: 'STAFF' });
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '만들지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  async function patch(id: number, body: Record<string, unknown>) {
    setError('');
    try {
      await api(`/staff/${id}`, { method: 'PATCH', body });
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '바꾸지 못했어요.');
    }
  }

  async function reset(row: StaffRow) {
    setError('');
    setIssued(null);
    try {
      const result = await api<{ tempPassword: string }>(`/staff/${row.id}/reset-password`, {
        method: 'POST',
      });
      setIssued({ email: row.email, password: result.tempPassword });
      load();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '리셋하지 못했어요.');
    }
  }

  if (loading || !me) return <Loading />;
  if (me.role !== 'ADMIN') {
    return <Alert>직원 계정 관리는 관리자만 할 수 있습니다.</Alert>;
  }

  return (
    <div>
      <PageTitle
        title="직원 계정"
        description="직원은 회원가입을 하지 않습니다. 관리자가 여기서 계정을 만들고, 멈추고, 비밀번호를 리셋합니다."
      />

      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      {issued ? (
        <div className="mb-4">
          <Alert kind="success">
            <b>{issued.email}</b>의 임시 비밀번호는 <b>{issued.password}</b> 입니다.
            <br />이 창을 닫으면 다시 볼 수 없습니다. 해당 직원은 다음 로그인 때 새 비밀번호를 정해야 합니다.
          </Alert>
        </div>
      ) : null}

      <Card className="mb-5">
        <h2 className="t-title-m mb-3">새 직원 계정 만들기</h2>
        <form onSubmit={create} className="grid gap-3 md:grid-cols-[1fr_1fr_140px_auto] md:items-end">
          <Field label="이메일">
            <Input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </Field>
          <Field label="이름">
            <Input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              required
            />
          </Field>
          <Field label="역할">
            <Select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}
            >
              <option value="STAFF">일반 직원</option>
              <option value="ADMIN">관리자</option>
            </Select>
          </Field>
          <Button type="submit" size="large" disabled={busy}>
            {busy ? '만드는 중…' : '만들기'}
          </Button>
        </form>
      </Card>

      {rows === null ? (
        <Loading />
      ) : (
        <Card padded={false}>
          <table className="w-full text-left">
            <thead className="t-caption text-[var(--text-sub)] border-b border-[var(--line)]">
              <tr>
                <th className="px-4 py-3">이름</th>
                <th className="px-4 py-3">이메일</th>
                <th className="px-4 py-3">역할</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3 text-right">관리</th>
              </tr>
            </thead>
            <tbody className="t-body-s">
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3">{row.name}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3">
                    <Select
                      value={row.role}
                      className="h-9 w-[120px]"
                      onChange={(event) => patch(row.id, { role: event.target.value })}
                    >
                      <option value="STAFF">일반 직원</option>
                      <option value="ADMIN">관리자</option>
                    </Select>
                  </td>
                  <td className="px-4 py-3">
                    {row.isActive ? (
                      <Badge status="CHECKED_OUT">사용 중</Badge>
                    ) : (
                      <Badge status="CANCELED">멈춤</Badge>
                    )}
                    {row.mustChangePassword ? (
                      <span className="ml-1">
                        <Badge status="RESERVED">임시 비밀번호</Badge>
                      </span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2 justify-end">
                      <Button size="small" variant="secondary" onClick={() => reset(row)}>
                        비밀번호 리셋
                      </Button>
                      <Button
                        size="small"
                        variant={row.isActive ? 'destructive' : 'secondary'}
                        onClick={() => patch(row.id, { isActive: !row.isActive })}
                      >
                        {row.isActive ? '사용 멈춤' : '다시 사용'}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}

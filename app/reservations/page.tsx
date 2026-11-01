'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, STATUS_LABEL, todayString, type ReservationRow } from '../../lib/api';
import { useRequireStaff } from '../../lib/auth';
import { Badge, Button, Card, Empty, Field, Input, Loading, PageTitle, Select } from '../../components/ui';

export default function AdminReservationsPage() {
  const { me, loading } = useRequireStaff();
  const [rows, setRows] = useState<ReservationRow[] | null>(null);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [keyword, setKeyword] = useState('');

  const load = useCallback(() => {
    const query = new URLSearchParams();
    if (status) query.set('status', status);
    if (date) query.set('date', date);
    if (keyword.trim()) query.set('keyword', keyword.trim());
    setRows(null);
    void api<ReservationRow[]>(`/reservations?${query.toString()}`)
      .then(setRows)
      .catch(() => setRows([]));
  }, [status, date, keyword]);

  useEffect(() => {
    if (me && !me.mustChangePassword) load();
  }, [me, load]);

  if (loading || !me) return <Loading />;

  return (
    <div>
      <PageTitle title="예약 전체" description="직원은 모든 보호자의 예약을 봅니다." />

      <Card className="mb-4">
        <div className="grid gap-3 md:grid-cols-3">
          <Field label="상태">
            <Select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">전체</option>
              <option value="RESERVED">예약됨</option>
              <option value="CHECKED_IN">입실</option>
              <option value="CHECKED_OUT">퇴실</option>
              <option value="CANCELED">취소</option>
            </Select>
          </Field>
          <Field label="그날 묵는 예약" hint="고른 날짜에 묵고 있는 예약만 보여요.">
            <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
          </Field>
          <Field label="검색" hint="보호자 이름·연락처, 아이 이름">
            <Input
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="김보호 / 2222 / 콩이"
            />
          </Field>
        </div>
        <div className="flex gap-2 mt-3">
          <Button size="small" variant="secondary" onClick={() => setDate(todayString())}>
            오늘 날짜로
          </Button>
          <Button
            size="small"
            variant="text"
            onClick={() => {
              setStatus('');
              setDate('');
              setKeyword('');
            }}
          >
            조건 지우기
          </Button>
        </div>
      </Card>

      {rows === null ? (
        <Loading />
      ) : rows.length === 0 ? (
        <Card>
          <Empty>조건에 맞는 예약이 없어요.</Empty>
        </Card>
      ) : (
        <Card padded={false}>
          <table className="w-full text-left">
            <thead className="t-caption text-[var(--text-sub)] border-b border-[var(--line)]">
              <tr>
                <th className="px-4 py-3">기간</th>
                <th className="px-4 py-3">객실</th>
                <th className="px-4 py-3">보호자</th>
                <th className="px-4 py-3">아이</th>
                <th className="px-4 py-3">상태</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="t-body-s">
              {rows.map((row) => (
                <tr key={row.id} className="border-b border-[var(--line)] last:border-0">
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.checkInDate}
                    <br />~ {row.checkOutDate}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.roomTypeName} {row.roomNumber}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {row.guardian.name}
                    <br />
                    <span className="text-[var(--text-sub)]">{row.guardian.phone}</span>
                  </td>
                  <td className="px-4 py-3">{row.pets.map((pet) => pet.name).join(', ')}</td>
                  <td className="px-4 py-3">
                    <Badge status={row.status}>{STATUS_LABEL[row.status]}</Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/reservations/${row.id}`}>
                      <Button size="small" variant="secondary">
                        상세
                      </Button>
                    </Link>
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

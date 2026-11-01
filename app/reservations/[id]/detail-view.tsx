'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, STATUS_LABEL, won, type ReservationDetail } from '../../../lib/api';
import { useRequireStaff } from '../../../lib/auth';
import { Alert, Badge, Button, Card, Loading, PageTitle } from '../../../components/ui';

export function AdminReservationDetail({ id }: { id: number }) {
  const { me, loading } = useRequireStaff();
  const [row, setRow] = useState<ReservationDetail | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(() => {
    void api<ReservationDetail>(`/reservations/${id}`)
      .then(setRow)
      .catch((cause) => setError(cause instanceof Error ? cause.message : '불러오지 못했어요.'));
  }, [id]);

  useEffect(() => {
    if (me && !me.mustChangePassword) load();
  }, [me, load]);

  async function act(path: string) {
    setBusy(true);
    setError('');
    try {
      setRow(await api<ReservationDetail>(`/reservations/${id}/${path}`, { method: 'POST' }));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '처리하지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  if (loading || !me) return <Loading />;
  if (!row) return error ? <Alert>{error}</Alert> : <Loading />;

  return (
    <div className="max-w-[720px]">
      <PageTitle title={`예약 #${row.id}`} />

      {error ? (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <Card className="mb-3">
        <div className="flex items-center justify-between mb-3">
          <span className="t-display-s">
            {row.checkInDate} ~ {row.checkOutDate}
          </span>
          <Badge status={row.status}>{STATUS_LABEL[row.status]}</Badge>
        </div>
        <dl className="grid grid-cols-[100px_1fr] gap-y-2 t-body-m">
          <dt className="text-[var(--text-sub)]">객실</dt>
          <dd>
            {row.room.typeName} {row.room.number}호
          </dd>
          <dt className="text-[var(--text-sub)]">보호자</dt>
          <dd>
            {row.guardian.name} · {row.guardian.phone}
          </dd>
          <dt className="text-[var(--text-sub)]">비상 연락처</dt>
          <dd>{row.guardian.emergencyPhone}</dd>
          <dt className="text-[var(--text-sub)]">맡은 아이</dt>
          <dd>
            {row.pets
              .map((pet) => `${pet.name} (${pet.species}, ${pet.weightKg}kg)`)
              .join(', ')}
          </dd>
          <dt className="text-[var(--text-sub)]">사료</dt>
          <dd>{row.pets.map((pet) => pet.food).join(' / ')}</dd>
          <dt className="text-[var(--text-sub)]">알레르기</dt>
          <dd className={row.pets.some((pet) => pet.allergy) ? 'text-[var(--primary)] font-semibold' : ''}>
            {row.pets.map((pet) => pet.allergy || '없음').join(' / ')}
          </dd>
          {row.checkedInAt ? (
            <>
              <dt className="text-[var(--text-sub)]">입실 시각</dt>
              <dd>{new Date(row.checkedInAt).toLocaleString('ko-KR')}</dd>
            </>
          ) : null}
          {row.checkedOutAt ? (
            <>
              <dt className="text-[var(--text-sub)]">퇴실 시각</dt>
              <dd>{new Date(row.checkedOutAt).toLocaleString('ko-KR')}</dd>
            </>
          ) : null}
          {row.canceledAt ? (
            <>
              <dt className="text-[var(--text-sub)]">취소한 날</dt>
              <dd>{new Date(row.canceledAt).toLocaleDateString('ko-KR')}</dd>
            </>
          ) : null}
        </dl>

        <div className="flex gap-2 mt-4">
          {row.status === 'RESERVED' ? (
            <>
              <Button size="medium" onClick={() => act('check-in')} disabled={busy}>
                입실 처리
              </Button>
              <Button size="medium" variant="destructive" onClick={() => act('cancel')} disabled={busy}>
                취소 처리
              </Button>
            </>
          ) : null}
          {row.status === 'CHECKED_IN' ? (
            <Button size="medium" onClick={() => act('check-out')} disabled={busy}>
              퇴실 처리
            </Button>
          ) : null}
        </div>
      </Card>

      <Card className="mb-3">
        <h2 className="t-title-m mb-3">요금</h2>
        <ul className="space-y-1 t-body-s">
          {row.charge.nights.map((night) => (
            <li key={night.date} className="flex justify-between">
              <span className="text-[var(--text-sub)]">
                {night.date} {night.weekend ? '(주말)' : '(평일)'}
              </span>
              <span>{won(night.price)}</span>
            </li>
          ))}
        </ul>
        <div className="flex justify-between t-body-m mt-2 pt-2 border-t border-[var(--line)]">
          <span className="text-[var(--text-sub)]">숙박비 {row.charge.nightCount}박</span>
          <span>{won(row.charge.roomTotal)}</span>
        </div>
        {row.charge.services.length > 0 ? (
          <ul className="space-y-1 t-body-s mt-3 pt-3 border-t border-[var(--line)]">
            {row.charge.services.map((service) => (
              <li key={service.name} className="flex justify-between">
                <span className="text-[var(--text-sub)]">
                  {service.name} × {service.count}
                </span>
                <span>{won(service.amount)}</span>
              </li>
            ))}
          </ul>
        ) : null}
        <div className="flex justify-between t-title-m mt-3 pt-3 border-t border-[var(--line)]">
          <span>합계</span>
          <span className="text-[var(--primary)]">{won(row.charge.total)}</span>
        </div>
        {row.refundIfCanceledToday ? (
          <p className="mt-3 t-body-s text-[var(--text-sub)]">
            지금 취소하면 환불 {won(row.refundIfCanceledToday.amount)} — {row.refundIfCanceledToday.reason}
          </p>
        ) : null}
      </Card>

      <Link href="/reservations">
        <Button variant="secondary" size="large">
          목록으로
        </Button>
      </Link>
    </div>
  );
}

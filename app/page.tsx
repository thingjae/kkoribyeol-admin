'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { api, STATUS_LABEL, type TodayRow } from '../lib/api';
import { useRequireStaff } from '../lib/auth';
import { Alert, Badge, Button, Card, Empty, Loading, PageTitle } from '../components/ui';

type Today = { date: string; arrivals: TodayRow[]; departures: TodayRow[] };

function Row({ row, onDone }: { row: TodayRow; onDone: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function act(path: string) {
    setBusy(true);
    setError('');
    try {
      await api(`/reservations/${row.id}/${path}`, { method: 'POST' });
      onDone();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '처리하지 못했어요.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="mb-3">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="t-title-m">
            {row.roomTypeName} {row.roomNumber}호
            <span className="t-body-s text-[var(--text-sub)] ml-2">
              {row.checkInDate} ~ {row.checkOutDate}
            </span>
          </p>
          <p className="t-body-s text-[var(--text-sub)]">
            보호자 {row.guardian.name} · {row.guardian.phone} · 비상 {row.guardian.emergencyPhone}
          </p>
        </div>
        <Badge status={row.status}>{STATUS_LABEL[row.status]}</Badge>
      </div>

      {/* D-2: 사료와 알레르기를 오늘 목록에 함께 보여 준다 */}
      <div className="rounded-[8px] bg-[var(--bg-sub)] p-3 space-y-1">
        {row.pets.map((pet) => (
          <p key={pet.name} className="t-body-s">
            <b>{pet.name}</b> <span className="text-[var(--text-sub)]">({pet.species})</span> · 사료{' '}
            {pet.food} ·{' '}
            {pet.allergy ? (
              <span className="text-[var(--primary)] font-semibold">알레르기 {pet.allergy}</span>
            ) : (
              <span className="text-[var(--text-sub)]">알레르기 없음</span>
            )}
          </p>
        ))}
      </div>

      {error ? (
        <div className="mt-3">
          <Alert>{error}</Alert>
        </div>
      ) : null}

      <div className="flex gap-2 mt-3">
        {row.status === 'RESERVED' ? (
          <Button size="small" onClick={() => act('check-in')} disabled={busy}>
            입실 처리
          </Button>
        ) : null}
        {row.status === 'CHECKED_IN' ? (
          <Button size="small" onClick={() => act('check-out')} disabled={busy}>
            퇴실 처리
          </Button>
        ) : null}
        <Link href={`/reservations/${row.id}`}>
          <Button size="small" variant="secondary">
            상세
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function AdminHomePage() {
  const { me, loading } = useRequireStaff();
  const [data, setData] = useState<Today | null>(null);

  const load = useCallback(() => {
    void api<Today>('/reservations/today')
      .then(setData)
      .catch(() => setData(null));
  }, []);

  useEffect(() => {
    if (me && !me.mustChangePassword) load();
  }, [me, load]);

  if (loading || !me) return <Loading />;

  return (
    <div>
      <PageTitle
        title="오늘 현황"
        description={data ? `${data.date} 기준 · 입실 ${data.arrivals.length}건, 퇴실 ${data.departures.length}건` : undefined}
      />

      {data === null ? (
        <Loading />
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          <section>
            <h2 className="t-title-m mb-2">오늘 들어오는 아이</h2>
            {data.arrivals.length === 0 ? (
              <Card>
                <Empty>오늘 입실 예정이 없어요.</Empty>
              </Card>
            ) : (
              data.arrivals.map((row) => <Row key={row.id} row={row} onDone={load} />)
            )}
          </section>

          <section>
            <h2 className="t-title-m mb-2">오늘 나가는 아이</h2>
            {data.departures.length === 0 ? (
              <Card>
                <Empty>오늘 퇴실 예정이 없어요.</Empty>
              </Card>
            ) : (
              data.departures.map((row) => <Row key={row.id} row={row} onDone={load} />)
            )}
          </section>
        </div>
      )}
    </div>
  );
}

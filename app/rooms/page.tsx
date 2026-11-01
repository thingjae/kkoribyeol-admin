'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, todayString, won, type RoomType } from '../../lib/api';
import { useRequireStaff } from '../../lib/auth';
import { Card, Field, Input, Loading, PageTitle } from '../../components/ui';

type Room = { id: number; roomNumber: string; roomTypeId: number; roomTypeName: string };

const nextDay = (date: string) =>
  new Date(new Date(`${date}T00:00:00Z`).getTime() + 86_400_000).toISOString().slice(0, 10);

export default function RoomsPage() {
  const { me, loading } = useRequireStaff();
  const [date, setDate] = useState(todayString());
  const [types, setTypes] = useState<RoomType[] | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);

  const load = useCallback(() => {
    setTypes(null);
    void api<RoomType[]>(`/reservations/availability?checkIn=${date}&checkOut=${nextDay(date)}`)
      .then(setTypes)
      .catch(() => setTypes([]));
  }, [date]);

  useEffect(() => {
    if (me && !me.mustChangePassword) load();
  }, [me, load]);

  useEffect(() => {
    if (me && !me.mustChangePassword) {
      void api<Room[]>('/catalog/rooms').then(setRooms).catch(() => setRooms([]));
    }
  }, [me]);

  if (loading || !me) return <Loading />;

  return (
    <div>
      <PageTitle title="빈 방" description="날짜를 고르면 그날 밤 묵을 수 있는 방 수를 보여 줍니다." />

      <Card className="mb-4 max-w-[320px]">
        <Field label="날짜">
          <Input type="date" value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
      </Card>

      {types === null ? (
        <Loading />
      ) : (
        <div className="grid gap-3 md:grid-cols-3 mb-6">
          {types.map((type) => (
            <Card key={type.id}>
              <p className="t-title-m mb-1">{type.name}</p>
              <p className="t-display-m text-[var(--primary)]">
                {type.freeRooms}
                <span className="t-body-m text-[var(--text-sub)]"> / {type.totalRooms}개</span>
              </p>
              <p className="t-body-s text-[var(--text-sub)] mt-2">
                {type.minWeight}kg{type.maxWeight === null ? ' 이상' : ` ~ ${type.maxWeight}kg 미만`}
              </p>
              <p className="t-body-s text-[var(--text-sub)]">
                평일 {won(type.weekdayPrice)} · 주말 {won(type.weekendPrice)}
              </p>
            </Card>
          ))}
        </div>
      )}

      <h2 className="t-title-m mb-2">객실 목록</h2>
      <Card padded={false}>
        <table className="w-full text-left">
          <thead className="t-caption text-[var(--text-sub)] border-b border-[var(--line)]">
            <tr>
              <th className="px-4 py-3">방 번호</th>
              <th className="px-4 py-3">종류</th>
            </tr>
          </thead>
          <tbody className="t-body-s">
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-3">{room.roomNumber}</td>
                <td className="px-4 py-3">{room.roomTypeName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

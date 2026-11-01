'use client';

import { useCallback, useEffect, useState } from 'react';
import { api, type ExpiringPet, type GuardianRow } from '../../lib/api';
import { useRequireStaff } from '../../lib/auth';
import { Alert, Button, Card, Empty, Field, Input, Loading, PageTitle } from '../../components/ui';

export default function GuardiansPage() {
  const { me, loading } = useRequireStaff();
  const [keyword, setKeyword] = useState('');
  const [rows, setRows] = useState<GuardianRow[] | null>(null);
  const [expiring, setExpiring] = useState<ExpiringPet[]>([]);

  const search = useCallback(() => {
    setRows(null);
    void api<GuardianRow[]>(`/guardians?keyword=${encodeURIComponent(keyword.trim())}`)
      .then(setRows)
      .catch(() => setRows([]));
  }, [keyword]);

  useEffect(() => {
    if (!me || me.mustChangePassword) return;
    search();
    void api<ExpiringPet[]>('/pets/expiring-vaccines')
      .then(setExpiring)
      .catch(() => setExpiring([]));
    // 처음 한 번만 전체 목록을 불러온다
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);

  if (loading || !me) return <Loading />;

  return (
    <div>
      <PageTitle title="보호자·반려동물" />

      {/* D-3: 접종 만료가 30일 안으로 다가온 아이 */}
      <section className="mb-6">
        <h2 className="t-title-m mb-2">접종 만료가 다가온 아이 ({expiring.length})</h2>
        {expiring.length === 0 ? (
          <Card>
            <Empty>30일 안에 만료되는 아이가 없어요.</Empty>
          </Card>
        ) : (
          <div className="space-y-2">
            {expiring.map((pet) => (
              <Card key={pet.id}>
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="t-body-m">
                      <b>{pet.name}</b>{' '}
                      <span className="text-[var(--text-sub)]">
                        {pet.species} · 보호자 {pet.guardian.name} ({pet.guardian.phone})
                      </span>
                    </p>
                    <p className="t-body-s text-[var(--text-sub)]">
                      종합백신 만료 {pet.vaccineExpiresAt} · 광견병 만료 {pet.rabiesExpiresAt}
                    </p>
                  </div>
                  <Alert kind="error">
                    {pet.soonest.kind} {pet.soonest.date}
                  </Alert>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* D-5: 보호자 검색 */}
      <section>
        <h2 className="t-title-m mb-2">보호자 검색</h2>
        <Card className="mb-4">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Field label="이름 또는 연락처 뒷자리">
                <Input
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') search();
                  }}
                  placeholder="김보호 또는 2222"
                />
              </Field>
            </div>
            <Button size="large" onClick={search}>
              검색
            </Button>
          </div>
        </Card>

        {rows === null ? (
          <Loading />
        ) : rows.length === 0 ? (
          <Card>
            <Empty>찾는 보호자가 없어요.</Empty>
          </Card>
        ) : (
          <Card padded={false}>
            <table className="w-full text-left">
              <thead className="t-caption text-[var(--text-sub)] border-b border-[var(--line)]">
                <tr>
                  <th className="px-4 py-3">이름</th>
                  <th className="px-4 py-3">연락처</th>
                  <th className="px-4 py-3">비상 연락처</th>
                  <th className="px-4 py-3">반려동물</th>
                </tr>
              </thead>
              <tbody className="t-body-s">
                {rows.map((guardian) => (
                  <tr key={guardian.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3">
                      {guardian.name}
                      <br />
                      <span className="text-[var(--text-sub)]">{guardian.email}</span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">{guardian.phone}</td>
                    <td className="px-4 py-3 whitespace-nowrap">{guardian.emergencyPhone}</td>
                    <td className="px-4 py-3">
                      {guardian.pets.map((pet) => `${pet.name}(${pet.species})`).join(', ') || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </section>
    </div>
  );
}

import { AdminReservationDetail } from './detail-view';

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <AdminReservationDetail id={Number(id)} />;
}

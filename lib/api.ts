const BASE = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3100').replace(/\/$/, '');
// 코어 웹과 다른 열쇠 이름을 쓴다. 같은 브라우저에서 둘 다 열어도 섞이지 않게.
const TOKEN_KEY = 'kkoribyeol.admin.token';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  window.localStorage.removeItem(TOKEN_KEY);
}

export async function api<T>(
  path: string,
  options: { method?: string; body?: unknown } = {},
): Promise<T> {
  const token = getToken();
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
    });
  } catch {
    throw new ApiError(
      '서버에 연결하지 못했어요. 무료 서버라 처음 열 때 1분 가까이 걸릴 수 있어요.',
      0,
    );
  }

  if (res.status === 204) return undefined as T;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const message =
      (typeof data?.message === 'string' && data.message) ||
      (Array.isArray(data?.message) && data.message[0]) ||
      '요청을 처리하지 못했어요.';
    throw new ApiError(message, res.status);
  }
  return data as T;
}

export type StaffMe = {
  kind: 'STAFF';
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'STAFF';
  mustChangePassword: boolean;
};

export type StaffRow = {
  id: number;
  email: string;
  name: string;
  role: 'ADMIN' | 'STAFF';
  isActive: boolean;
  mustChangePassword: boolean;
  createdAt: string;
};

export type RoomType = {
  id: number;
  name: string;
  minWeight: number;
  maxWeight: number | null;
  weekdayPrice: number;
  weekendPrice: number;
  totalRooms: number;
  freeRooms: number;
  roomCount?: number;
};

export type PetBrief = { name: string; species: string; food: string; allergy: string };

export type TodayRow = {
  id: number;
  status: string;
  roomNumber: string;
  roomTypeName: string;
  guardian: { name: string; phone: string; emergencyPhone: string };
  checkInDate: string;
  checkOutDate: string;
  pets: PetBrief[];
};

export type ReservationRow = {
  id: number;
  status: 'RESERVED' | 'CHECKED_IN' | 'CHECKED_OUT' | 'CANCELED';
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  roomTypeName: string;
  guardian: { id: number; name: string; phone: string };
  pets: { id: number; name: string; species: string }[];
};

export type ReservationDetail = Omit<ReservationRow, 'pets'> & {
  room: { id: number; number: string; typeName: string };
  guardian: { id: number; name: string; phone: string; emergencyPhone: string };
  pets: {
    id: number;
    name: string;
    species: string;
    weightKg: number;
    food: string;
    allergy: string;
  }[];
  checkedInAt: string | null;
  checkedOutAt: string | null;
  canceledAt: string | null;
  charge: {
    nights: { date: string; weekend: boolean; price: number }[];
    nightCount: number;
    roomTotal: number;
    services: { name: string; unitPrice: number; count: number; amount: number }[];
    serviceTotal: number;
    total: number;
  };
  refundIfCanceledToday: { amount: number; reason: string } | null;
};

export type GuardianRow = {
  id: number;
  name: string;
  email: string;
  phone: string;
  emergencyPhone: string;
  pets: { id: number; name: string; species: string }[];
};

export type ExpiringPet = {
  id: number;
  name: string;
  species: string;
  vaccineExpiresAt: string;
  rabiesExpiresAt: string;
  guardian: { name: string; phone: string };
  soonest: { kind: string; date: string };
};

export const STATUS_LABEL: Record<string, string> = {
  RESERVED: '예약됨',
  CHECKED_IN: '입실',
  CHECKED_OUT: '퇴실',
  CANCELED: '취소',
};

export const won = (value: number) => `${value.toLocaleString('ko-KR')}원`;
export const todayString = () => new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);

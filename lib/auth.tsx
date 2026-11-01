'use client';

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { api, clearToken, getToken, setToken, type StaffMe } from './api';

type AuthValue = {
  me: StaffMe | null;
  loading: boolean;
  signIn: (token: string) => Promise<void>;
  signOut: () => void;
};

const AuthContext = createContext<AuthValue>({
  me: null,
  loading: true,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [me, setMe] = useState<StaffMe | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!getToken()) {
      setMe(null);
      setLoading(false);
      return;
    }
    try {
      setMe(await api<StaffMe>('/auth/me'));
    } catch {
      clearToken();
      setMe(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const signIn = useCallback(
    async (token: string) => {
      setToken(token);
      setLoading(true);
      await load();
    },
    [load],
  );

  const signOut = useCallback(() => {
    clearToken();
    setMe(null);
  }, []);

  return <AuthContext.Provider value={{ me, loading, signIn, signOut }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

/**
 * 로그인하지 않았으면 로그인 화면으로.
 * 임시 비밀번호를 쓰는 중이면 비밀번호 바꾸기 화면으로 보낸다.
 */
export function useRequireStaff(options: { allowWhileReset?: boolean } = {}) {
  const { me, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!me) {
      router.replace('/login');
      return;
    }
    if (me.mustChangePassword && !options.allowWhileReset && pathname !== '/password') {
      router.replace('/password');
    }
  }, [loading, me, options.allowWhileReset, pathname, router]);

  return { me, loading };
}

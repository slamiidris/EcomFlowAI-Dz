import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';

export type PlanId = 'monthly' | 'quarterly' | 'lifetime';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  plan: PlanId | null;
  planStatus: 'pending' | 'active' | null;
  planSelectedAt?: number;
  planActiveFrom?: number;
  planExpiresAt?: number | null;
  createdAt: number;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  isMock: boolean;
  login: () => void;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  selectPlan: (plan: PlanId) => Promise<AuthUser>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMock, setIsMock] = useState(false);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsMock(Boolean(data.isMock));
      } else {
        setUser(null);
        setIsMock(false);
      }
    } catch {
      setUser(null);
      setIsMock(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const login = useCallback(() => {
    // Navigates to the server, which redirects to Google (or the dev mock).
    window.location.href = '/api/auth/google';
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore network errors — still clear local state
    }
    setUser(null);
    setIsMock(false);
  }, []);

  const selectPlan = useCallback(async (plan: PlanId) => {
    const res = await fetch('/api/auth/plan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ plan }),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || 'Impossible de sélectionner ce plan.');
    }
    const data = await res.json();
    setUser(data.user);
    return data.user as AuthUser;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isMock, login, logout, refresh, selectPlan }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

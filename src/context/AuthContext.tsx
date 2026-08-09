import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { preferencesApi, authApi, OtpChallenge } from '../services/api';

export type PlanId = 'monthly' | 'quarterly' | 'lifetime';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  isAdmin?: boolean;
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
  /** Start Google OAuth (redirect). */
  login: () => void;
  /** Register with name + email + password → sends a verification OTP. */
  register: (name: string, email: string, password: string) => Promise<OtpChallenge>;
  /** Email + password → sends a 6-digit OTP to the inbox. */
  loginWithEmail: (email: string, password: string) => Promise<OtpChallenge>;
  /** Confirm the 6-digit OTP and open the session. */
  verifyOtp: (email: string, code: string) => Promise<void>;
  /** Request a fresh OTP (rate-limited server-side). */
  resendOtp: (email: string) => Promise<{ ok: boolean; email: string; expiresInSec: number }>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  selectPlan: (plan: PlanId) => Promise<AuthUser>;
  /** Call after login to sync server-stored preferences → localStorage. */
  syncPreferences: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

/** Sync server preferences into localStorage for instant UI effect. */
async function syncPrefsToLocal() {
  try {
    const preferences = await preferencesApi.get();
    if (!preferences) return;
    if (preferences.theme) localStorage.setItem('theme', preferences.theme);
    if (preferences.language) localStorage.setItem('dzads_language', preferences.language);
    if (preferences.toolsOrder) localStorage.setItem('dzads_tools_order', JSON.stringify(preferences.toolsOrder));
    if (preferences.dashboardConfig) localStorage.setItem('dashboard_config', JSON.stringify(preferences.dashboardConfig));
    if (preferences.dashboardWidgetOrder) localStorage.setItem('dashboard_widget_order', JSON.stringify(preferences.dashboardWidgetOrder));
    if (preferences.lastImage) localStorage.setItem('dzads_last_generated_image', JSON.stringify(preferences.lastImage));
    if (preferences.lastScript) localStorage.setItem('dzads_last_generated_script', JSON.stringify(preferences.lastScript));
    if (preferences.lastLpActiveId) localStorage.setItem('dzads_lp_last_active_id', preferences.lastLpActiveId);
    if (preferences.lastChatActiveId) localStorage.setItem('ecommerce_expert_last_active_session_id', preferences.lastChatActiveId);
  } catch (e) {
    console.warn('Failed to sync preferences from server:', e);
  }
}

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
        // Sync server preferences → localStorage on login.
        if (data.user) syncPrefsToLocal();
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
    window.location.href = '/api/auth/google';
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    return authApi.register(name, email, password);
  }, []);

  const loginWithEmail = useCallback(async (email: string, password: string) => {
    return authApi.login(email, password);
  }, []);

  const verifyOtp = useCallback(async (email: string, code: string) => {
    const data = await authApi.verifyOtp(email, code);
    setUser(data.user);
    setIsMock(false);
    if (data.user) syncPrefsToLocal();
  }, []);

  const resendOtp = useCallback(async (email: string) => {
    return authApi.resendOtp(email);
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setUser(null);
    setIsMock(false);
    // Clear local preference cache on logout.
    localStorage.removeItem('dzads_last_generated_image');
    localStorage.removeItem('dzads_last_generated_script');
    localStorage.removeItem('dzads_tools_order');
    localStorage.removeItem('dashboard_config');
    localStorage.removeItem('dashboard_widget_order');
    localStorage.removeItem('dzads_lp_sessions');
    localStorage.removeItem('dzads_lp_last_active_id');
    localStorage.removeItem('ecommerce_expert_sessions');
    localStorage.removeItem('ecommerce_expert_last_active_session_id');
    localStorage.removeItem('dzads_settings');
    localStorage.removeItem('dzads_generation_history');
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

  const syncPreferences = useCallback(async () => {
    await syncPrefsToLocal();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, isMock, login, register, loginWithEmail, verifyOtp, resendOtp, logout, refresh, selectPlan, syncPreferences }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

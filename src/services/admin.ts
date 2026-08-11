/** Typed client for the admin API + public content endpoints. */
import type { PricingConfig } from '../lib/pricing';

export interface AdminStats {
  totalUsers: number;
  activeSubs: number;
  pendingPayments: number;
  totalGenerations: number;
  paymentMethods: number;
  announcements: number;
  hotDeals: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  plan: string | null;
  planStatus: string | null;
  planDays?: number | null;
  isAdmin: boolean;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PendingPayment {
  id: string;
  name: string;
  email: string;
  plan: string;
  planStatus: string;
  paymentProof: string | null;
  paymentMethod: string | null;
  paymentSubmittedAt: string | null;
  planSelectedAt: string | null;
  createdAt: string;
}

export interface UserDetail {
  id: string;
  email: string;
  name: string;
  isAdmin: boolean;
  plan: string | null;
  planStatus: string | null;
  planActiveFrom: string | null;
  planExpiresAt: string | null;
  paymentProof: string | null;
  paymentMethod: string | null;
  paymentSubmittedAt: string | null;
  paymentNote: string | null;
  createdAt: string;
  updatedAt: string;
  apiSettings: ApiSettings | null;
  userPreferences: { language: string | null; theme: string | null } | null;
  _count: {
    generationHistory: number;
    productCatalog: number;
    chatSessions: number;
    lpSessions: number;
    emailOtps: number;
  };
}

export interface ApiSettings {
  id: string;
  facebookAdsToken?: string | null;
  facebookAccountId?: string | null;
  tiktokAdsToken?: string | null;
  tiktokAccountId?: string | null;
  googleAdsCustomerId?: string | null;
  googleAdsDeveloperToken?: string | null;
  snapAdsToken?: string | null;
  snapAccountId?: string | null;
  geminiApiKey?: string | null;
  workspaceName?: string;
  customApiToken?: string | null;
}

export interface ApiSettingsRow {
  id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  apiSettings: ApiSettings | null;
}

export interface PlatformConfig {
  appUrl: string;
  adminEmail: string | null;
  adminTelegram: string | null;
  email: 'resend' | 'smtp' | 'console';
  smtpHost: string | null;
  googleOauth: boolean;
  telegramScout: boolean;
  nodeEnv: string;
}

export interface ContactSettings {
  whatsappNumber: string;
  adminTelegram: string;
  adminEmail: string;
}

export interface PaymentMethod {
  id: string;
  code: string;
  name: string;
  description: string | null;
  emoji: string;
  type: 'email' | 'bank' | 'manual';
  instructions: string[];
  details: Record<string, any> | null;
  enabled: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  emoji: string;
  kind: 'info' | 'warning' | 'success' | 'promo';
  active: boolean;
  startsAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface HotDeal {
  id: string;
  title: string;
  description: string | null;
  emoji: string;
  badge: string | null;
  price: string | null;
  link: string | null;
  active: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

async function http<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    let message = 'Erreur serveur.';
    try {
      const data = await res.json();
      if (data?.error) message = data.error;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }
  return res.json();
}

export const adminApi = {
  stats: () => http<AdminStats>('/api/admin/stats'),
  pendingPayments: () => http<PendingPayment[]>('/api/admin/pending-payments'),
  approve: (userId: string) => http<{ ok: boolean }>(`/api/admin/approve/${userId}`, { method: 'POST' }),
  reject: (userId: string) => http<{ ok: boolean }>(`/api/admin/reject/${userId}`, { method: 'POST' }),

  users: () => http<AdminUser[]>('/api/admin/all-users'),
  userDetail: (userId: string) => http<UserDetail>(`/api/admin/users/${userId}`),
  toggleAdmin: (userId: string) => http<{ ok: boolean; isAdmin: boolean }>(`/api/admin/users/${userId}/toggle-admin`, { method: 'POST' }),
  resetPlan: (userId: string) => http<{ ok: boolean }>(`/api/admin/users/${userId}/reset-plan`, { method: 'POST' }),
  setPlan: (userId: string, body: { plan: string; days?: number }) => http<{ ok: boolean }>(`/api/admin/users/${userId}/set-plan`, { method: 'POST', body: JSON.stringify(body) }),
  deleteUser: (userId: string) => http<{ ok: boolean }>(`/api/admin/users/${userId}`, { method: 'DELETE' }),

  apiSettings: () => http<ApiSettingsRow[]>('/api/admin/api-settings'),
  updateApiSettings: (userId: string, body: Partial<ApiSettings>) => http<{ ok: boolean }>(`/api/admin/api-settings/${userId}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteApiSettings: (userId: string) => http<{ ok: boolean }>(`/api/admin/api-settings/${userId}`, { method: 'DELETE' }),
  platformConfig: () => http<PlatformConfig>('/api/admin/platform-config'),
  pricing: () => http<PricingConfig>('/api/admin/pricing'),
  updatePricing: (body: Partial<PricingConfig>) => http<{ ok: boolean }>('/api/admin/pricing', { method: 'PUT', body: JSON.stringify(body) }),

  contactSettings: () => http<ContactSettings>('/api/admin/contact-settings'),
  updateContactSettings: (body: Partial<ContactSettings>) => http<{ ok: boolean }>('/api/admin/contact-settings', { method: 'PUT', body: JSON.stringify(body) }),

  paymentMethods: () => http<PaymentMethod[]>('/api/admin/payment-methods'),
  createPaymentMethod: (body: Partial<PaymentMethod>) => http<PaymentMethod>('/api/admin/payment-methods', { method: 'POST', body: JSON.stringify(body) }),
  updatePaymentMethod: (id: string, body: Partial<PaymentMethod>) => http<PaymentMethod>(`/api/admin/payment-methods/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deletePaymentMethod: (id: string) => http<{ ok: boolean }>(`/api/admin/payment-methods/${id}`, { method: 'DELETE' }),

  announcements: () => http<Announcement[]>('/api/admin/announcements'),
  createAnnouncement: (body: Partial<Announcement>) => http<Announcement>('/api/admin/announcements', { method: 'POST', body: JSON.stringify(body) }),
  updateAnnouncement: (id: string, body: Partial<Announcement>) => http<Announcement>(`/api/admin/announcements/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteAnnouncement: (id: string) => http<{ ok: boolean }>(`/api/admin/announcements/${id}`, { method: 'DELETE' }),

  hotDeals: () => http<HotDeal[]>('/api/admin/hot-deals'),
  createHotDeal: (body: Partial<HotDeal>) => http<HotDeal>('/api/admin/hot-deals', { method: 'POST', body: JSON.stringify(body) }),
  updateHotDeal: (id: string, body: Partial<HotDeal>) => http<HotDeal>(`/api/admin/hot-deals/${id}`, { method: 'PUT', body: JSON.stringify(body) }),
  deleteHotDeal: (id: string) => http<{ ok: boolean }>(`/api/admin/hot-deals/${id}`, { method: 'DELETE' }),
};

/* Public content endpoints (no auth) */
export const contentApi = {
  paymentMethods: () => http<PaymentMethod[]>('/api/payment-methods'),
  announcements: () => http<Announcement[]>('/api/announcements/active'),
  hotDeals: () => http<HotDeal[]>('/api/hot-deals/active'),
};

/**
 * Plan-based access gating shared across the app.
 *
 * Free users (no active plan) can browse the dashboard and use the free
 * tools, but paid (AI) tools render a locked screen instead of running.
 */

// Tab ids that require an active plan. Keep in sync with the `NavItem` unions
// in AppShell.tsx / Sidebar.tsx.
export const PAID_TOOLS = new Set([
  'video',
  'landing',
  'assembler',
  'trends',
  'images',
  'darja',
  'analyzer',
  'scout',
  'calendar',
]);

export const isToolPaid = (tab: string): boolean => PAID_TOOLS.has(tab);

/** True when the user holds an active subscription (covers null/pending/expired). */
export const hasActivePlan = (u?: { planStatus?: string | null } | null): boolean =>
  u?.planStatus === 'active';

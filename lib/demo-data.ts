import type { DashboardStats } from './types';

// No invented repository total: demo/setup mode deliberately uses null.
export const demoStats: DashboardStats = {
  total: null,
  observedAt: null,
  source: 'GitHub Search API',
  status: 'demo',
  note: 'Setup required: connect Supabase and deploy the collector to display real observations.',
  history: [],
};

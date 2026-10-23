export type Snapshot = {
  id?: number;
  observed_at: string;
  source: string;
  metric: string;
  value: number;
  is_estimate: boolean;
  metadata?: Record<string, unknown>;
};

export type DashboardStats = {
  total: number | null;
  observedAt: string | null;
  source: string;
  history: { time: string; value: number }[];
  status: 'live' | 'stale' | 'demo' | 'unavailable';
  note: string;
};

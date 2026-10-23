import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { demoStats } from '@/lib/demo-data';
import type { Snapshot } from '@/lib/types';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (!supabase) {
    return NextResponse.json(demoStats, {
      headers: { 'Cache-Control': 'no-store' },
    });
  }

  const { data, error } = await supabase
    .from('repo_snapshots')
    .select('id,observed_at,source,metric,value,is_estimate,metadata')
    .eq('metric', 'repository_search_count')
    .order('observed_at', { ascending: false })
    .limit(168);

  if (error) {
    return NextResponse.json({
      ...demoStats,
      status: 'unavailable',
      note: 'Supabase is configured, but observations could not be loaded. Check server configuration.',
    }, { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }

  const rows = (data ?? []) as Snapshot[];
  const latest = rows[0];
  const age = latest ? Date.now() - new Date(latest.observed_at).getTime() : Infinity;
  const status = !latest ? 'unavailable' : age <= 3 * 60_000 ? 'live' : 'stale';

  return NextResponse.json({
    total: latest?.value ?? null,
    observedAt: latest?.observed_at ?? null,
    source: latest?.source ?? 'GitHub Search API',
    status,
    note: latest
      ? 'API-reported repository search count, not a verified census of every GitHub repository.'
      : 'No observations yet. Deploy and run the collector to record the first snapshot.',
    history: rows.slice().reverse().map((row) => ({
      time: row.observed_at,
      value: Number(row.value),
    })),
  }, { headers: { 'Cache-Control': 'no-store' } });
}

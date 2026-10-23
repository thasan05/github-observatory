'use client';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { DashboardStats } from '@/lib/types';

export default function GrowthChart({ history }: { history: DashboardStats['history'] }) {
  const data = history.map((point) => ({
    ...point,
    label: new Date(point.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  }));

  return (
    <div className="chart-wrap">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 12, right: 6, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="repoFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#9bf7c5" stopOpacity={0.23} />
              <stop offset="95%" stopColor="#9bf7c5" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(180,205,192,.09)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: '#73847b', fontSize: 10 }} axisLine={false} tickLine={false} minTickGap={30} />
          <YAxis tick={{ fill: '#73847b', fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => Intl.NumberFormat('en', { notation: 'compact' }).format(value)} />
          <Tooltip contentStyle={{ background: '#101714', border: '1px solid #29362f', borderRadius: 12, color: '#e8f1eb' }} labelStyle={{ color: '#92a69a' }} formatter={(value) => [Number(value).toLocaleString(), 'Observed count']} />
          <Area type="monotone" dataKey="value" stroke="#9bf7c5" strokeWidth={2} fill="url(#repoFill)" activeDot={{ r: 4, fill: '#9bf7c5', stroke: '#102018', strokeWidth: 2 }} isAnimationActive />
        </AreaChart>
      </ResponsiveContainer>
      {history.length === 0 && <div className="chart-empty">Your first successful observation will appear here.</div>}
    </div>
  );
}

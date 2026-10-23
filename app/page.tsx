'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  Activity, ArrowUpRight, Clock3, Database, ExternalLink, Github, Globe2,
  Radio, RefreshCw, ShieldCheck, Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AnimatedDigits from '@/components/counter';
import GrowthChart from '@/components/growth-chart';
import type { DashboardStats } from '@/lib/types';
import { demoStats } from '@/lib/demo-data';

const fmt = (value: number | null) => value === null ? '—' : value.toLocaleString('en-US');

function timeAgo(value: string | null, now = Date.now()) {
  if (!value) return 'No observations yet';
  const seconds = Math.max(0, Math.floor((now - new Date(value).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export default function Home() {
  const [stats, setStats] = useState<DashboardStats>(demoStats);
  const [loading, setLoading] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [now, setNow] = useState(Date.now());
  const [error, setError] = useState(false);

  const refresh = useCallback(async (quiet = false) => {
    if (!quiet) setLoading(true);
    try {
      const response = await fetch('/api/stats', { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load observations');
      const data = await response.json() as DashboardStats;
      setStats(data);
      setError(false);
      setLastChecked(new Date());
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const poll = setInterval(() => void refresh(true), 60_000);
    const clock = setInterval(() => setNow(Date.now()), 1000);
    return () => { clearInterval(poll); clearInterval(clock); };
  }, [refresh]);

  const statusText = error ? 'Connection issue'
    : stats.status === 'live' ? 'Collector online'
    : stats.status === 'stale' ? 'Data is stale'
    : stats.status === 'demo' ? 'Setup required'
    : 'Awaiting first snapshot';
  const statusClass = error || stats.status === 'stale' || stats.status === 'unavailable'
    ? 'status-warn'
    : stats.status === 'live' ? 'status-live' : 'status-demo';
  const previous = stats.history.length > 1 ? stats.history[stats.history.length - 2].value : null;
  const delta = stats.total !== null && previous !== null ? stats.total - previous : null;

  return (
    <main className="site-shell">
      <div className="ambient ambient-one" /><div className="ambient ambient-two" /><div className="grid-overlay" />
      <header className="topbar">
        <a className="brand" href="#top" aria-label="GitHub Observatory home">
          <span className="brand-mark"><Github size={21} /><span /></span>
          <span>GITHUB <b>OBSERVATORY</b></span>
        </a>
        <nav className="top-nav">
          <a href="#signals">Signals</a><a href="#methodology">Methodology</a>
          <a className="github-link" href="https://github.com/thasan05/github-observatory" target="_blank" rel="noreferrer">Source <ExternalLink size={13} /></a>
        </nav>
      </header>

      <section className="hero" id="top">
        <motion.div className="eyebrow" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6 }}>
          <span className="eyebrow-line" /> OPEN-SOURCE INTELLIGENCE <span className="eyebrow-line" />
        </motion.div>
        <motion.h1 initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .7, delay: .08 }}>
          The pulse of <em>open source.</em>
        </motion.h1>
        <motion.p className="hero-copy" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .7, delay: .18 }}>
          A living observatory of the world&apos;s largest developer ecosystem.<br className="desktop-break" /> Measured continuously. Presented transparently.
        </motion.p>

        <motion.div className="hero-stat" initial={{ opacity: 0, scale: .985 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: .8, delay: .2 }}>
          <div className="stat-topline">
            <span className="live-indicator"><span className={stats.status === 'live' && !error ? 'pulse-dot' : 'pulse-dot muted'} />{statusText.toUpperCase()}</span>
            <span className="stat-source">SOURCE <b>GITHUB SEARCH API</b></span>
          </div>
          <div className="count-label"><Globe2 size={15} /> PUBLIC REPOSITORIES OBSERVED</div>
          <div className="big-count"><AnimatedDigits value={stats.total} /></div>
          <div className="stat-foot">
            <span className="count-caption">API-reported search result count <span className="info-dot" title="This is not a verified census of every GitHub repository.">i</span></span>
            <span className="last-update"><Clock3 size={13} /> {timeAgo(stats.observedAt, now)}</span>
          </div>
          <div className="stat-bottomline">
            <span><span className="tiny-led" /> OBSERVATION STATUS: {stats.status.toUpperCase()}</span>
            <span>UTC · {stats.observedAt ? new Date(stats.observedAt).toISOString().slice(11, 19) : '—'}</span>
          </div>
        </motion.div>
        <div className="hero-orbit orbit-a" /><div className="hero-orbit orbit-b" />
      </section>

      <section className="metrics-grid" id="signals">
        <motion.article className="metric-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .28 }}>
          <div className="metric-head"><span>OBSERVED CHANGE</span><Activity size={16} /></div>
          <div className="metric-value">{delta === null ? '—' : `${delta > 0 ? '+' : ''}${fmt(delta)}`}</div>
          <div className="metric-note">Since previous successful snapshot</div>
          <div className="metric-bottom"><span className="metric-pill"><ArrowUpRight size={12} /> Snapshot delta</span><span className="metric-spark">{delta === null ? 'Waiting for history' : 'Observed, not projected'}</span></div>
        </motion.article>
        <motion.article className="metric-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .36 }}>
          <div className="metric-head"><span>COLLECTION CADENCE</span><Radio size={16} /></div>
          <div className="metric-value">60<span className="metric-unit"> sec</span></div>
          <div className="metric-note">Target interval · not a guarantee</div>
          <div className="metric-bottom"><span className="metric-pill"><Clock3 size={12} /> Scheduled polling</span><span className="metric-spark">{lastChecked ? `Checked ${timeAgo(lastChecked.toISOString(), now)}` : 'Initializing'}</span></div>
        </motion.article>
        <motion.article className="metric-card" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: .44 }}>
          <div className="metric-head"><span>DATA INTEGRITY</span><ShieldCheck size={16} /></div>
          <div className="metric-value">{stats.status === 'live' ? 'OK' : stats.status === 'demo' ? 'SETUP' : 'CHECK'}</div>
          <div className="metric-note">Freshness and source transparency</div>
          <div className="metric-bottom"><span className="metric-pill"><Database size={12} /> Snapshot-backed</span><span className="metric-spark">{stats.status === 'live' ? 'Recent observation' : 'Needs live backend'}</span></div>
        </motion.article>
      </section>

      <section className="content-grid">
        <article className="panel chart-panel">
          <div className="panel-heading"><div><div className="section-kicker">01 / HISTORICAL SIGNAL</div><h2>Growth over time</h2><p>Every point represents a stored observation.</p></div><span className="period-chip"><span className="tiny-led" /> SNAPSHOTS</span></div>
          <GrowthChart history={stats.history} />
          <div className="chart-footer"><span><span className="legend-line" /> Repository search count</span><span>Latest {stats.history.length} observations</span></div>
        </article>
        <article className="panel signal-panel">
          <div className="panel-heading"><div><div className="section-kicker">02 / SYSTEM SIGNALS</div><h2>Collector status</h2><p>Operational state, at a glance.</p></div><div className={`status-orb ${statusClass}`}><Radio size={17} /></div></div>
          <div className="signal-list">
            <div className="signal-row"><span className="signal-icon"><Github size={16} /></span><div className="signal-copy"><b>GitHub Search API</b><small>Primary observation source</small></div><span className={`signal-state ${stats.total !== null ? 'good' : 'pending'}`}>{stats.total !== null ? 'OBSERVED' : 'PENDING'}</span></div>
            <div className="signal-row"><span className="signal-icon"><Database size={16} /></span><div className="signal-copy"><b>Snapshot database</b><small>Persistent history storage</small></div><span className={`signal-state ${stats.status !== 'demo' && stats.status !== 'unavailable' ? 'good' : 'pending'}`}>{stats.status === 'demo' ? 'NOT SET' : stats.status === 'unavailable' ? 'CHECK' : 'READY'}</span></div>
            <div className="signal-row"><span className="signal-icon"><RefreshCw size={16} /></span><div className="signal-copy"><b>Dashboard refresh</b><small>Browser polling interval</small></div><span className="signal-state good">60 SEC</span></div>
          </div>
          <div className="signal-callout"><Zap size={15} /><p>{error ? 'The dashboard could not reach its stats endpoint. Last displayed data, if any, is retained.' : stats.note}</p></div>
          <button className="refresh-button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={14} className={loading ? 'spin' : ''} /> {loading ? 'Refreshing…' : 'Refresh observations'}</button>
        </article>
      </section>

      <section className="methodology" id="methodology">
        <div className="method-title"><div className="section-kicker">03 / READ THE SIGNAL</div><h2>What this number means.</h2></div>
        <div className="method-copy">
          <p><strong>Not a perfect census.</strong> GitHub Search API returns an indexed search result count, which can differ from the true number of repositories across GitHub. This dashboard displays what the API reported, with observation timestamps and history; it does not claim a guaranteed worldwide total.</p>
          <p><strong>Snapshots, not guesses.</strong> The collector records successful responses. The UI animates between recorded values, but never fabricates per-second growth. If the collector falls behind, the status changes to stale.</p>
          <p><strong>Respecting API limits.</strong> Search endpoints have their own quotas. A one-minute collection interval is a target and may need to be reduced if GitHub reports a low remaining quota or errors.</p>
          <a href="https://docs.github.com/en/rest/search/search#search-repositories" target="_blank" rel="noreferrer">GitHub Search API documentation <ExternalLink size={12} /></a>
        </div>
      </section>
      <footer className="footer">
        <a className="brand footer-brand" href="#top"><span className="brand-mark"><Github size={16} /><span /></span><span>GITHUB <b>OBSERVATORY</b></span></a>
        <span>INDEPENDENT PROJECT · DATA SOURCE: GITHUB SEARCH API</span>
        <span className="footer-right">CRAFTED FOR <span>OPEN SOURCE</span></span>
      </footer>
    </main>
  );
}

# GitHub Observatory

A dark, animated dashboard for observing GitHub's public-repository search count over time. Built with Next.js, TypeScript, Framer Motion, Recharts, Supabase, and a Cloudflare Worker collector.

> **Measurement integrity:** GitHub Search API's `total_count` is an API-reported search result count. It is **not** a verified census of every repository on GitHub. Search indexing and API limits can affect it. The dashboard labels it accordingly and never invents a live increment.

## Features

- Responsive dark dashboard with an animated counter, signal indicators, and ambient motion.
- Snapshot-backed history chart and previous-snapshot delta.
- Browser refreshes the stats endpoint every 60 seconds. The count is never extrapolated.
- Cloudflare Worker cron configured for once-per-minute collection.
- GitHub token, Supabase service-role key, and collector secret stay server-side.
- Supabase schema with RLS enabled and public read-only access to snapshots.
- Graceful setup state before credentials are configured.
- GitHub Actions CI for typecheck, lint, and production build.

## Stack

- Next.js 15, React 19, TypeScript
- Framer Motion, Recharts, Lucide
- Supabase PostgreSQL
- Cloudflare Workers + Cron Triggers

## Run locally

Requires Node.js 22+.

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without Supabase credentials the dashboard displays a clearly labelled setup state. Never place secrets in `NEXT_PUBLIC_*` variables.

## Configure Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL editor.
3. Set `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`.
4. Restart the development server.

The service-role key bypasses RLS. It must only be used in server/Worker environments and never exposed to browser code. The schema enables public read-only selection and intentionally has no public write policy.

## Configure minute-level collection

1. Install Wrangler and authenticate with Cloudflare.
2. From `collector/`, deploy:

   ```bash
   npx wrangler deploy
   ```

3. Set encrypted Worker secrets:

   ```bash
   npx wrangler secret put GITHUB_TOKEN
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
   npx wrangler secret put COLLECTOR_SECRET
   ```

4. Test manually with an authenticated POST to your Worker URL:

   ```bash
   curl -X POST https://YOUR-WORKER-URL -H 'Authorization: Bearer YOUR_COLLECTOR_SECRET'
   ```

The schedule in [`collector/wrangler.toml`](collector/wrangler.toml) uses `* * * * *`. Cron delivery is best-effort, not hard real-time. The collector validates responses, records API quota metadata, and logs failures without fabricating data.

## API and methodology

The collector uses one authenticated GitHub Search Repositories API request per run. Search endpoints have stricter quotas than the general REST API. The target is 60 requests/hour; monitor `x-ratelimit-remaining` and reduce cadence if account-specific quotas require it. Each successful snapshot records the count returned by Search API, its observation time, and metadata such as `incomplete_results`. It must not be described as an exact global repository census.

## Deploy the dashboard

Deploy as a Next.js project on Vercel or another compatible Node host. Configure the server-side Supabase environment variables in host settings. The Cloudflare Worker is separate, so the dashboard host does not need minute-level Cron support.

## Validation

```bash
npm run typecheck
npm run lint
npm run build
```

CI runs these checks on pushes to `main` and on pull requests.

## Structure

```text
app/                  Dashboard and stats API
components/            Animated counter and history chart
lib/                   Types, Supabase helper, demo state
collector/              Cloudflare Worker and cron config
supabase/schema.sql     Snapshot schema and RLS
.github/workflows/      CI workflow
```

## License

MIT — see [LICENSE](LICENSE).

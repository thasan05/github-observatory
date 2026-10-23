# Cloudflare Worker collector

This collector is deployed separately from Next.js.

## Deploy

From this folder:

```bash
npx wrangler login
npx wrangler secret put GITHUB_TOKEN
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put COLLECTOR_SECRET
npx wrangler deploy
```

The Worker is scheduled once per minute by `wrangler.toml`. Cron delivery can be delayed, so this is a target cadence, not a real-time guarantee.

The dashboard metric comes from GitHub Search API `total_count`; it is not an exact worldwide census. Search quotas are stricter than ordinary REST quotas. The collector logs remaining quota and records metadata to help monitor it.

interface Env {
  GITHUB_TOKEN: string;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  COLLECTOR_SECRET: string;
}

interface GitHubSearchResponse {
  total_count?: number;
  incomplete_results?: boolean;
}

const SEARCH_URL =
  'https://api.github.com/search/repositories?q=stars%3A%3E%3D0&per_page=1';

async function collect(env: Env) {
  if (!env.GITHUB_TOKEN || !env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing GITHUB_TOKEN, SUPABASE_URL, or SUPABASE_SERVICE_ROLE_KEY.');
  }

  const github = await fetch(SEARCH_URL, {
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${env.GITHUB_TOKEN}`,
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'github-observatory-collector',
    },
  });

  const remainingHeader = github.headers.get('x-ratelimit-remaining');
  const remaining = remainingHeader === null ? null : Number(remainingHeader);
  if (!github.ok) {
    const reset = github.headers.get('x-ratelimit-reset');
    throw new Error(
      `GitHub Search API returned ${github.status}; remaining=${remaining ?? 'unknown'}; reset=${reset ?? 'unknown'}`,
    );
  }

  const payload = await github.json() as GitHubSearchResponse;
  if (!Number.isSafeInteger(payload.total_count) || (payload.total_count ?? -1) < 0) {
    throw new Error('GitHub response did not contain a valid total_count.');
  }

  const observedAt = new Date().toISOString();
  const response = await fetch(
    env.SUPABASE_URL.replace(/\/$/, '')}/rest/v1/repo_snapshots`,
    {
      method: 'POST',
      headers: {
        apikey: env.SUPABASE_SERVICE_ROLE_KEY,
        Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        observed_at: observedAt,
        source: 'GitHub REST Search API: repository search',
        metric: 'repository_search_count',
        value: payload.total_count,
        is_estimate: true,
        metadata: {
          query: 'stars:>=0',
          incomplete_results: payload.incomplete_results ?? null,
          rate_limit_remaining: remaining,
          rate_limit_reset: github.headers.get('x-ratelimit-reset'),
          methodology: 'Search API-reported total_count; not a verified census.',
        },
      }),
    },
  );

  if (!response.ok) {
    throw new Error(`Supabase insert failed with ${response.status}: ${(await response.text()).slice(0, 300)}`);
  }

  return {
    ok: true,
    value: payload.total_count,
    observedAt,
    rateLimitRemaining: remaining,
    incompleteResults: payload.incomplete_results ?? null,
  };
}

export default {
  async scheduled(_event: ScheduledController, env: Env, ctx: ExecutionContext) {
    ctx.waitUntil(
      collect(env)
        .then((result) => console.log(JSON.stringify(result)))
        .catch((error: unknown) =>
          console.error(error instanceof Error ? error.message : 'Unknown collector error'),
        ),
    );
  },

  async fetch(request: Request, env: Env) {
    if (request.method !== 'POST') {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { Allow: 'POST' },
      });
    }

    const supplied = request.headers.get('Authorization');
    if (!env.COLLECTOR_SECRET || supplied !== `Bearer ${env.COLLECTOR_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    try {
      return Response.json(await collect(env));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return Response.json({ ok: false, error: message }, { status: 502 });
    }
  },
};

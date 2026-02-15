# Product Idea Generator (SaaS)

MVP SaaS that helps founders discover product ideas from Reddit: tracks popular subreddits, extracts signals, generates and scores ideas via LLM, and delivers a feed plus optional email digest.

## Tech stack

- **Framework:** Next.js 14 (App Router) + TypeScript
- **Auth & DB:** Supabase (Auth + Postgres)
- **LLM:** OpenAI (prompts in `config/prompts.ts`)
- **Email:** Resend (digest + unsubscribe link)
- **Reddit data:** Mock JSON (`data/mock-reddit.json`)
- **Fallback idea generation:** Pre-generated mock ideas (`data/mock-generated-ideas.json`) when OpenAI is unavailable

## Run locally

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd <repo-dir>
   yarn install
   ```

2. **Environment**

   Copy env example and set values:

   ```bash
   cp .env.example .env
   ```

   Required:

   - `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase anon key
   - `SUPABASE_SERVICE_ROLE_KEY` — For cron inserts and unsubscribe-by-token
   - `OPENAI_API_KEY` — For idea generation
   - `RESEND_API_KEY` — For digest emails
   - `FROM_EMAIL` — Sender address (e.g. `digest@yourdomain.com`)
   - `NEXT_PUBLIC_APP_URL` — App URL (e.g. `http://localhost:3000`)

3. **Database**

   Apply the migration in Supabase (SQL Editor or CLI):

   - `supabase/migrations/001_initial.sql`

   Creates `product_ideas` and `email_subscriptions` with RLS.

4. **Dev server**

   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

   **Note:** Sign up and log in require a real Supabase project (hosted or local). If you see "Failed to fetch" or "Cannot reach Supabase", see **Hosted Supabase** or **Local Supabase** below.

### Option A: Local Supabase (recommended for dev)

You can run Supabase on your machine with Docker and the Supabase CLI. No supabase.com account needed for local dev.

**Prerequisites:** [Docker Desktop](https://docs.docker.com/desktop/) (or Podman / Rancher Desktop). Start Docker before running Supabase.

- **Windows:** Install via Chocolatey (`choco install docker-desktop -y`) or [download Docker Desktop](https://docs.docker.com/desktop/install/windows-install/). If Docker reports "unable to start", reboot once or complete the WSL 2 setup when prompted.

**Quick run and test (with Docker running):**

```bash
yarn local                   # start Supabase, update .env, apply migrations (one command)
yarn dev                     # start Next.js at http://localhost:3000
```

Or step by step:

```bash
yarn supabase:start          # start local Supabase (first time may download images)
yarn supabase:env            # write local URL + keys into .env
yarn supabase:db-reset       # apply migrations (product_ideas, email_subscriptions)
yarn dev                     # start Next.js at http://localhost:3000
```

Then open http://localhost:3000, sign up, and use the dashboard. Stop Supabase when done: `yarn supabase:stop`.

**Manual steps (if you prefer):**

1. Start Docker, then from the project root:

   ```bash
   yarn supabase:start
   # or: npx supabase start
   ```

   First run may download images. When ready, you’ll see the Studio URL (e.g. http://127.0.0.1:54323) and API URL (e.g. http://127.0.0.1:54321).

2. **Get local API URL and keys** (or use the script):

   ```bash
   yarn supabase:env          # updates .env from supabase status
   # or: yarn supabase:status  then copy API_URL, ANON_KEY, SERVICE_ROLE_KEY into .env
   ```

   Map to `.env`: `API_URL` → `NEXT_PUBLIC_SUPABASE_URL`, `ANON_KEY` → `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SERVICE_ROLE_KEY` → `SUPABASE_SERVICE_ROLE_KEY`.

3. **Apply migrations** (tables + RLS):

   ```bash
   yarn supabase:db-reset
   ```

   Or run the SQL in `supabase/migrations/001_initial.sql` manually in Studio (http://127.0.0.1:54323) → SQL Editor.

4. **Stop when done:** `yarn supabase:stop`

### Option B: Hosted Supabase

Create a project at [supabase.com](https://supabase.com). In **Project Settings → API** copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** → `SUPABASE_SERVICE_ROLE_KEY`

Apply `supabase/migrations/001_initial.sql` in the Supabase dashboard (SQL Editor).

---

5. **Seed ideas (optional)**

   Call the generator once to populate the feed (requires Supabase configured). If `OPENAI_API_KEY` is missing or LLM call fails, API will use fallback ideas from `data/mock-generated-ideas.json`:

   ```bash
   curl http://localhost:3000/api/cron/generate-ideas
   ```

   Or open that URL in the browser.

## Main flows

- **Landing:** `/` — Hero, value prop, CTA to sign up.
- **Auth:** `/login`, `/signup` — Supabase Auth; dashboard requires login.
- **Feed:** `/dashboard` — List of product ideas with topic filter and “New” badge (last 7 days).
- **Subscriptions:** `/subscriptions` — Subscribe/update digest with topic filters; “Unsubscribe from digest” from profile.
- **Unsubscribe by link:** `/unsubscribe?token=...` — Token from email; deactivates subscription.

## Env vars (reference)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key (cron, unsubscribe) |
| `OPENAI_API_KEY` | OpenAI API key |
| `OPENAI_MODEL` | Optional; default `gpt-4o-mini` |
| `RESEND_API_KEY` | Resend API key |
| `FROM_EMAIL` | Sender for digest emails |
| `NEXT_PUBLIC_APP_URL` | App base URL (unsubscribe links) |

## .cursor/

- `rules.md` — Architecture and style rules for AI.
- `PROMPTS.md` — Key prompts with short context and outcome.

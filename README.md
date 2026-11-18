# Human Bingo

Make a custom people-bingo board, share its link, and let a room full of people find each other.

- **Create** boards from 3 × 3 to 6 × 6, written by hand or drafted by AI from a short description.
- **Share** each board at its own unlisted URL (`/b/<slug>`). Players need no account.
- **Play** on any phone. Progress is saved on the device; each person's name counts once.
- **Manage** your boards (open, share, edit, delete) under `/boards`.

## Stack

Next.js 16 (App Router, Cache Components, Server Actions) · React 19 · Supabase (Postgres, Auth, RLS) · shadcn/ui + Tailwind CSS 4 · Groq and Gemini via the AI SDK · Zod

## Setup

Requires Node 22+, pnpm, the [Supabase CLI](https://supabase.com/docs/guides/local-development), and Docker for the local database.

```bash
pnpm install
touch .env.local             # then add the variables below
supabase start               # boots Postgres + Auth and applies supabase/migrations
pnpm dev
```

| Variable | Where it comes from |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `supabase status` locally, or Project Settings → API when hosted |
| `GROQ_API_KEY` | Free key from the [Groq console](https://console.groq.com/keys). Tried first when set |
| `GEMINI_API_KEY` | Free key from [Google AI Studio](https://aistudio.google.com/apikey). Used as the fallback, or alone if there is no Groq key |
| `GROQ_MODEL`, `GEMINI_MODEL` | Optional model overrides |
| `SUPABASE_AUTH_EXTERNAL_GOOGLE_CLIENT_ID`, `SUPABASE_AUTH_EXTERNAL_GOOGLE_SECRET` | Local Supabase only; see below |

### Google sign-in

1. In Google Cloud Console, create an OAuth client of type **Web application**.
2. Add the authorised redirect URI:
   - local: `http://127.0.0.1:54321/auth/v1/callback`
   - hosted: `https://<project-ref>.supabase.co/auth/v1/callback`
3. Local: put the client ID and secret in `.env.local` and restart `supabase start`.
   Hosted: enter them under Authentication → Providers → Google.
4. Hosted: under Authentication → URL Configuration, set the Site URL and add `https://<your-domain>/auth/callback` to the redirect allow-list.

### Deploying the database

```bash
supabase link --project-ref <project-ref>
supabase db push
supabase gen types typescript --linked > lib/supabase/database.types.ts
```

## How it fits together

| Path | Purpose |
| --- | --- |
| `supabase/migrations` | Schema, Row Level Security, and the two RPCs |
| `lib/board.ts` | Shared domain logic: grid maths, win detection, Zod schemas |
| `lib/boards.ts` | Data access. Public board lookups are cached and tagged per slug |
| `actions/` | Server Actions for auth, board CRUD, and AI generation |
| `hooks/use-board-progress.ts` | Hydration-safe, per-device progress storage |
| `proxy.ts` | Refreshes Supabase sessions for signed-in requests |

Security notes: boards are readable only by their owner through the table; everyone else goes through `get_board_by_slug`, which returns a single board for an exact slug. All writes are checked by RLS and re-validated on the server. AI generation requires sign-in and is limited to 10 requests per user per hour by `consume_ai_generation`.

## Scripts

- `pnpm dev` / `pnpm build` / `pnpm start`
- `pnpm lint` and `pnpm typecheck`
- `pnpm qr-local` prints a QR code for opening the dev server on a phone

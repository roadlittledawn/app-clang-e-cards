# CLAUDE.md

This project uses SDD (Spec-Driven Development). All feature work follows the spec → plan → implement → verify lifecycle.

## Stack

- **Framework:** Next.js 16 (App Router, Turbopack)
- **Language:** TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** MongoDB Atlas (Mongoose ODM)
- **Assets:** AWS S3 (`us-west-2`, bucket: `clang-e-cards`)
- **Auth:** Auth.js v5 (next-auth@5) — Google OAuth + email/password, JWT session strategy
- **Deployment:** Vercel (free tier)
- **CI:** GitHub Actions (`.github/workflows/ci.yml`)

## Architecture

Single Next.js 16 App Router app — no separate backend. API lives in `app/api/` route handlers.

```
app/
  (protected)/        # Requires auth (layout.tsx enforces it)
    dashboard/        # Card archive
    cards/[id]/edit/
    cards/[id]/share/
    cards/new/
    library/          # Image library
    admin/invites/    # Admin only
  login/
  invite/[token]/     # Public invite acceptance
  view/[token]/       # Public card viewer
  api/
    auth/[...nextauth]/
    cards/
    images/
    invites/
    giphy/search/
    memes/templates/
    view/[token]/
proxy.ts              # Auth.js proxy (Next.js 16 — replaces middleware.ts)
auth.ts               # Auth.js config
```

## Key Conventions

- **proxy.ts** — Next.js 16 uses `proxy.ts` instead of `middleware.ts`. Public paths: `/login`, `/invite`, `/view`, `/api/auth`, `/api/view`
- **Session strategy** — JWT (required for Credentials provider; database strategy silently fails)
- **SessionProvider** — wrapped in `components/layout/Providers.tsx`, added to root layout. Required for `signIn`/`signOut` from `next-auth/react` in App Router
- **Images** — `next/image` configured for `i.imgflip.com`, `media*.giphy.com`, S3. Use plain `<img>` for dynamic thumbnail grids (avoid fill/height issues)
- **S3 uploads** — presigned PUT URLs via `/api/images/presign`. Direct browser-to-S3, never through Vercel functions (4.5MB limit). Max 10MB per file
- **Env vars** — lazy-validated at request time (not module load), so `next build` passes without `.env.local`
- **Dark mode** — intentionally disabled in `globals.css`. Input/textarea always light background

## MongoDB Collections

| Collection | Purpose |
|------------|---------|
| `users` | Accounts (role: admin\|user, provider: google\|credentials) |
| `invites` | Single-use invite tokens (admin-only creation) |
| `cards` | E-cards (title, message, recipientName, image, effect, templateType) |
| `images` | S3 image metadata (userId scoped) |
| `shareLinks` | Public share tokens with optional expiry |

## Card Image Modes

| Mode | Storage |
|------|---------|
| `upload` | S3 key stored, URL derived via `s3PublicUrl()` |
| `giphy` | GIF URL stored directly (no S3 copy) |
| `meme` | Canvas-rendered PNG uploaded to S3 |

## Effect Registry

Effects are self-contained modules in `effects/`. Registry in `effects/registry.ts`. Add a new effect by creating a file that exports `play(): void` and registering it.

Current effects: `confetti`, `balloons`, `leaves`

## First-Time Setup

```bash
cp .env.local.example .env.local
# fill in all values

npm run seed:admin   # creates admin user in MongoDB
npm run dev
```

Admin logs in at `/login`, sends invites at `/admin/invites`.

## SDD Commands

- `/sdd` — context-aware guidance and next step suggestions
- `/sdd-run change create --type feature --name <name>` — start a new feature
- `/sdd-run change list` — list active changes
- `/sdd-run change approve spec <id>` — approve spec, generate plan
- `/sdd-run change approve plan <id>` — approve plan, enable implementation

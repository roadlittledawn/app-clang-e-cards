---
title: Implementation Plan: MVP Foundation
change: mvp-foundation-1
type: feature
spec: ./SPEC.md
created: 2026-06-03
sdd_version: 7.3.0
---

# Implementation Plan: MVP Foundation

## Overview

**Spec:** [SPEC.md](./SPEC.md)

Full MVP implementation of the e-card application. All components are new — starts with project scaffolding, then data model, auth, image library, card creation, effects, sharing, archive, and CI/CD.

Tests are deferred to post-MVP per spec.

---

## Affected Components

- `config` (new)
- `ecards-db` — database, MongoDB (new)
- `ecards-app` — webapp, Next.js 16 App Router (new)
- `main-pipeline` — cicd, GitHub Actions → Vercel (new)

---

## Phases

### Phase 1: Project Scaffolding

**Outcome:** Runnable Next.js 16 skeleton with MongoDB connection, S3 client, and Auth.js wired up. All env vars documented.

**Deliverables:**
- Next.js 16 project bootstrapped (`create-next-app`, App Router, TypeScript, Tailwind)
- MongoDB connection utility (`lib/db.ts`) with Mongoose
- S3 client utility (`lib/s3.ts`) using AWS SDK v3
- Auth.js base config (`auth.ts`) — providers stubbed, MongoDB adapter connected
- `.env.example` with all required keys documented
- `sdd-settings.yaml` updated with all four components

**Expected files to create:**
```
app/
lib/
  db.ts
  s3.ts
  auth.ts
auth.ts              ← Auth.js config root
.env.example
next.config.ts
tailwind.config.ts
tsconfig.json
```

**Environment variables to document:**
```
NEXTAUTH_SECRET
NEXTAUTH_URL
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
MONGODB_URI
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
S3_BUCKET_NAME
GIPHY_API_KEY
```

---

### Phase 2: Data Model

**Outcome:** All five Mongoose schemas defined and exported. Index strategy applied.

**Deliverables:**
- `models/User.ts` — fields: email, name, image, role, provider, passwordHash, createdAt
- `models/Invite.ts` — fields: email, token (unique), status, acceptedBy, createdAt, acceptedAt
- `models/Card.ts` — fields: userId, templateType, title, message, recipientName, image (nested), effect, createdAt, updatedAt
- `models/Image.ts` — fields: userId, s3Key, filename, size, mimeType, createdAt
- `models/ShareLink.ts` — fields: cardId, token (unique), expiresAt (nullable), createdAt

**Indexes:**
```
Invite:    token (unique), email
Card:      userId + createdAt (desc)
Image:     userId + createdAt (desc)
ShareLink: token (unique), cardId, expiresAt
```

**Expected files to create:**
```
models/
  User.ts
  Invite.ts
  Card.ts
  Image.ts
  ShareLink.ts
```

---

### Phase 3: Authentication & Invite System

**Outcome:** Invite-only auth working end-to-end. Admin can create and copy invite links. Invited users can sign up via Google or email+password. Uninvited visitors see login only.

**Deliverables:**

*Auth:*
- Auth.js fully configured: Google OAuth provider + Credentials provider (bcrypt, cost 12)
- MongoDB adapter for session persistence
- Middleware (`middleware.ts`): protect all routes except `/login`, `/invite/[token]`, `/view/[token]`, `/api/auth/*`
- Admin role check middleware for `/admin/*` routes

*Invite API:*
- `POST /api/invites` — create invite, generate `crypto.randomBytes(32)` token, return invite link
- `GET /api/invites` — list all invites (admin only)
- `GET /api/invites/[token]` — validate token (used by signup page)

*Invite UI:*
- `/login` — login form (Google button + email/password form), no signup link
- `/invite/[token]` — validates token, shows signup form (Google or email+password), marks invite accepted on submit
- `/admin/invites` — table of all invites (email, status, created date, invite link + copy button), form to create new invite

**Expected files to create:**
```
app/
  login/page.tsx
  invite/[token]/page.tsx
  admin/invites/page.tsx
  api/
    invites/route.ts
    invites/[token]/route.ts
middleware.ts
lib/
  invite.ts       ← token generation + validation helpers
  password.ts     ← bcrypt helpers
components/
  auth/
    LoginForm.tsx
    InviteSignupForm.tsx
  admin/
    InviteTable.tsx
    InviteForm.tsx
```

---

### Phase 4: Image Library

**Outcome:** Users can upload images directly to S3. All past uploads are browsable within the card creator.

**Deliverables:**

*API:*
- `POST /api/images/presign` — generate S3 presigned PUT URL, scoped to `users/{userId}/images/{uuid}.{ext}`, 5-minute TTL, 10MB limit enforced
- `GET /api/images` — list authenticated user's images (from `images` collection), paginated

*UI:*
- `ImageUploader` component — file picker with type + size validation (client-side), uploads directly to S3 via presigned URL, saves metadata via POST to `/api/images` on success
- `ImageLibrary` component — grid of user's past uploads (thumbnails), click to select
- `/library` page — full-page image library view

**Expected files to create:**
```
app/
  library/page.tsx
  api/
    images/route.ts
    images/presign/route.ts
components/
  images/
    ImageUploader.tsx
    ImageLibrary.tsx
    ImageThumbnail.tsx
lib/
  s3-upload.ts    ← presigned URL generation helper
```

---

### Phase 5a: Card API Routes

**Outcome:** Full CRUD for cards, duplication, and share link management via API.

**Deliverables:**
- `GET /api/cards` — list authenticated user's cards, sorted by createdAt desc
- `POST /api/cards` — create card, validate required fields
- `GET /api/cards/[id]` — get card (owner only)
- `PUT /api/cards/[id]` — update card (owner only)
- `DELETE /api/cards/[id]` — hard delete card + all its shareLinks
- `POST /api/cards/[id]/duplicate` — create new independent card pre-filled from original
- `POST /api/cards/[id]/share` — create shareLink with chosen expiry
- `GET /api/cards/[id]/share` — list shareLinks for card
- `GET /api/view/[token]` — resolve share link → return card data; enforce expiry (410 if expired, 404 if not found/deleted)

**Ownership enforcement:** All card routes verify `card.userId === session.user.id`.

**Expected files to create:**
```
app/api/
  cards/route.ts
  cards/[id]/route.ts
  cards/[id]/duplicate/route.ts
  cards/[id]/share/route.ts
  view/[token]/route.ts
lib/
  share-link.ts   ← token generation + expiry helpers
```

---

### Phase 5b: Card Creator & Archive UI

**Outcome:** Users can create, edit, and manage cards. Archive shows all past cards with link status.

**Deliverables:**

*Card creator (`/cards/new`, `/cards/[id]/edit`):*
- Title, message, recipient name fields (all required)
- Image section with three mode tabs: **Upload** (uses ImageUploader + ImageLibrary picker), **GIF** (Giphy picker), **Meme** (Imgflip flow)
- Effect picker: none / confetti / balloons / leaves (radio or segmented control)
- Save button

*Card archive (`/dashboard`):*
- Table/grid: title, recipient, created date, link status (active/expired/none)
- Actions per card: Edit, Share, Duplicate, Delete
- Duplicate → opens `/cards/new` pre-filled

*Share management (`/cards/[id]/share`):*
- "Generate link" button with expiry selector (7 / 30 / 90 days / never)
- Lists existing share links with status and copy button

**Expected files to create:**
```
app/
  dashboard/page.tsx
  cards/new/page.tsx
  cards/[id]/edit/page.tsx
  cards/[id]/share/page.tsx
components/
  cards/
    CardForm.tsx
    CardTable.tsx
    ShareManager.tsx
    ImageModeSelector.tsx
    EffectPicker.tsx
    ExpiryPicker.tsx
  giphy/
    GiphyPicker.tsx
  memes/
    MemePicker.tsx
    MemeCanvas.tsx
app/api/
  giphy/search/route.ts    ← proxy (hides API key)
  memes/templates/route.ts ← proxy Imgflip get_memes
```

---

### Phase 6: Effect Registry & Effects

**Outcome:** Effect registry wired into the public card viewer. Confetti, balloons, and leaves effects implemented.

**Deliverables:**
- `effects/registry.ts` — maps effect name → lazy import
- `effects/confetti.ts` — wraps `canvas-confetti`, exports `play(): void`
- `effects/balloons.tsx` — CSS keyframe animation, self-contained React component
- `effects/leaves.tsx` — CSS keyframe animation, self-contained React component
- `EffectPlayer` component — reads effect name, lazy-loads module, calls `play()` on mount

**Expected files to create:**
```
effects/
  registry.ts
  confetti.ts
  balloons.tsx
  leaves.tsx
components/
  effects/
    EffectPlayer.tsx
```

---

### Phase 7: Public Card Viewer

**Outcome:** Share links resolve to a public card view page. Effects auto-play on load. Expiry and not-found states handled gracefully.

**Deliverables:**
- `/view/[token]` page — server component fetches card via `/api/view/[token]`, renders card content
- Card display: title, recipient name, message, image (upload/GIF/meme), `EffectPlayer`
- Expired link state: friendly "This card has expired" page
- Not-found/deleted state: "Card not found" page
- No auth required — fully public

**Expected files to create:**
```
app/
  view/[token]/page.tsx
  view/[token]/expired/page.tsx
components/
  viewer/
    CardViewer.tsx
    ExpiredCard.tsx
    NotFoundCard.tsx
```

---

### Phase 8: CI/CD Pipeline

**Outcome:** GitHub Actions runs on every push. Vercel deploys automatically on merge to main.

**Deliverables:**
- `vercel.json` — project config (framework: nextjs, no special overrides needed for free tier)
- `.github/workflows/ci.yml` — on push/PR: `npm ci`, `npm run build`, type-check
- Vercel project linked to GitHub repo (manual step — documented)
- Env vars checklist documented in README

**Expected files to create:**
```
vercel.json
.github/workflows/ci.yml
```

**README updates:**
- Environment variable setup guide
- Vercel deployment instructions
- MongoDB Atlas + AWS S3 + Giphy setup steps

---

### Phase 9: Review

**Outcome:** Implementation verified against all acceptance criteria in SPEC.md.

**Checklist:**
- [ ] Invite flow: admin creates invite, copies link, uninvited user sees login only
- [ ] Invited user signs up via Google and email+password
- [ ] Card created with each image mode (upload, GIF, meme)
- [ ] Effect plays automatically on card open
- [ ] Share link respects all four expiry options
- [ ] Expired link shows expiry page, deleted card shows not-found page
- [ ] Card archive shows all user cards
- [ ] Duplicate opens pre-filled, saves as independent card
- [ ] Delete removes card and invalidates share links
- [ ] Image library shows past uploads; re-selecting works in card creator

---

## Implementation State

**Current Phase:** Phase 9 (Review)
**Status:** in_progress

### Completed Phases
- [x] Phase 1: Project Scaffolding
- [x] Phase 2: Data Model
- [x] Phase 3: Authentication & Invite System
- [x] Phase 4: Image Library
- [x] Phase 5a: Card API Routes
- [x] Phase 5b: Card Creator & Archive UI
- [x] Phase 6: Effect Registry & Effects
- [x] Phase 7: Public Card Viewer
- [x] Phase 8: CI/CD Pipeline
- [ ] Phase 2: Data Model
- [ ] Phase 3: Authentication & Invite System
- [ ] Phase 4: Image Library
- [ ] Phase 5a: Card API Routes
- [ ] Phase 5b: Card Creator & Archive UI
- [ ] Phase 6: Effect Registry & Effects
- [ ] Phase 7: Public Card Viewer
- [ ] Phase 8: CI/CD Pipeline
- [ ] Phase 9: Review

### Actual Files Changed
*(updated during implementation)*

### Blockers
None

---

## Dependencies

| Dependency | Setup Required |
|-----------|---------------|
| MongoDB Atlas | Create free cluster, get connection string |
| AWS S3 | Create bucket, IAM user with S3 permissions, get credentials |
| Google Cloud Console | Create OAuth 2.0 credentials, set redirect URIs |
| Giphy | Create app, get API key |
| Vercel | Link GitHub repo, set env vars in dashboard |

---

## Risks

| Risk | Mitigation |
|------|------------|
| Next.js 16 API changes from 15 | Check Next.js 16 release notes before scaffolding; Auth.js compatibility |
| S3 presigned URL CORS on Vercel | Configure S3 bucket CORS to allow Vercel domain |
| Imgflip templates fetched fresh each session | Cache in localStorage or server-side with short TTL |
| Canvas meme render quality | Test font rendering on mobile; use system fonts for reliability |
| Giphy API key exposed | Always proxy through `/api/giphy/search` — never client-side |

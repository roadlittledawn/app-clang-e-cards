---
title: MVP Foundation
change_id: mvp-foundation-1
type: feature
status: ready_for_review
created: 2026-06-03
workflow: m5ha2q-mvp-foundation
---

# MVP Foundation

## Overview

### Background

A new multi-user e-card web application. Users can create digital greeting cards, apply visual effects, and share them via public links. The app supports image uploads, Giphy GIFs, and client-rendered memes using Imgflip templates.

### Current State

Empty repository. No application code exists. This spec covers the full MVP: authentication, card creation, sharing, archive, and personal image library.

---

## User Stories

### Auth & Invites
- As the admin, I can invite users by email so they can create an account
- As the admin, I can view a management page showing pending and accepted invites
- As the admin, I can copy an invite link at any time to share directly with the invitee
- As an invited user, I click the invite link and complete signup via Google or email+password
- As an uninvited visitor, I see the login page with no signup option visible

### Card Creation
- As a user, I can create an e-card with a title, message, and recipient name
- As a user, I can attach an image by uploading a file, picking a Giphy GIF, or building a meme from an Imgflip template with client-side caption rendering
- As a user, I can apply one visual effect (confetti, balloons, leaves, or none) that plays when my card is opened
- As a user, I can choose how long my share link stays active: 7 days / 30 days / 90 days / never

### Sharing
- As a user, I can generate a public share link for any card so anyone can view it without logging in
- As a recipient, I can open a share link and view the card with its effect playing automatically on load
- As a recipient, I see a friendly message when a share link has expired or is invalid

### Archive & Reuse
- As a user, I can view a list of all cards I've created with title, recipient, created date, and link status
- As a user, I can duplicate a past card and update its details (e.g., recipient name) before resharing
- As a user, I can delete a card (hard delete — immediately removes card and invalidates share links)

### Image Library
- As a user, when creating a card, I can browse all images I've previously uploaded (scoped to my account)
- As a user, I can select an image from my library instead of re-uploading it

---

## Functional Requirements

### FR-1: Invite-Only Registration
- Admin is the only user who can send invites
- Admin enters an email address → system generates a unique invite token → invite link is displayed and copyable
- Invited user clicks the link → signup page shown (Google OAuth or email+password)
- Uninvited visitors see the login page only — no signup option rendered
- Invites have status: `pending` | `accepted`

### FR-2: Authentication
- Google OAuth sign-in/sign-up (via Auth.js)
- Email + password sign-in/sign-up (via Auth.js credentials provider, passwords hashed with bcrypt)
- Session-based auth (Auth.js sessions stored in MongoDB)
- Role field on user: `admin` | `user`

### FR-3: Admin Invite Management
- Admin UI at `/admin/invites`
- Table showing all invites: email, status (pending/accepted), created date, invite link
- Admin can copy invite link at any time
- Admin can create new invites from the same page

### FR-4: Card Creation
- Fields: title (required), message (required), recipient name (required), image (optional), effect (optional, default: none), template_type (default: `standard`)
- Image modes (mutually exclusive):
  - **Upload**: jpg/png/gif, max 10MB, uploaded to S3 via presigned URL
  - **Giphy**: user searches Giphy, picks a GIF, URL stored directly (no S3 copy)
  - **Meme**: user picks Imgflip template from searchable grid of top 100 templates, types caption, canvas renders text overlay client-side, result uploaded to S3 as PNG
- Effects: `confetti` | `balloons` | `leaves` | `none`
- Template type: `standard` (only type in MVP — field exists for extensibility)

### FR-5: Effect Registry
- Effects are registered by name in a central registry
- Each effect is a self-contained module (no shared state)
- Adding a new effect = adding one file to the registry
- No animation library at project level; `canvas-confetti` used only for the confetti effect

### FR-6: Share Links
- Generating a share link creates a `shareLink` document with a unique token
- Expiry options: 7 days / 30 days / 90 days / never (sender's choice at generation time)
- Public viewer at `/view/[token]` — no auth required
- Effect auto-plays on card open
- Multiple share links per card are allowed

### FR-7: Card Archive
- Authenticated users see all their cards at `/dashboard`
- Columns: title, recipient name, created date, link status (active/expired/no link)
- Cards sorted by created date descending

### FR-8: Card Duplication
- User can duplicate any card from their archive
- Duplicate opens in the card editor pre-filled with all fields
- Treated as a new card (new `_id`, no link to original)

### FR-9: Card Deletion
- Hard delete: card document removed from MongoDB
- Any associated share links invalidated immediately (deleted or flagged)
- Uploaded images in S3 are NOT deleted (images are independent of cards)

### FR-10: Personal Image Library
- All images a user has uploaded are stored in S3 under `users/{userId}/images/{uuid}.{ext}`
- Metadata stored in `images` collection (S3 key, filename, size, mime type, userId, createdAt)
- Image library accessible within the card creator (browse + select)
- New uploads automatically appear in the library
- No image deletion in MVP

---

## Non-Functional Requirements

- **Image uploads**: Direct-to-S3 via presigned URLs (bypasses Vercel 4.5MB function payload limit)
- **Upload cap**: 10MB per file (jpg, png, gif)
- **Link expiry**: Enforced server-side on every `/view/[token]` request
- **Auth**: Passwords hashed with bcrypt (via Auth.js)
- **Scale**: Personal side project — no specific throughput targets
- **Hosting**: Vercel free tier
- **Database**: MongoDB Atlas free tier (512MB)
- **Tests**: Deferred to post-MVP

---

## Technical Design

### Architecture

Single Next.js 16 App Router application deployed on Vercel. No separate backend service.

```
Browser → Vercel (Next.js 16 App Router)
            ├── Server Components (pages, layouts)
            ├── Route Handlers (API: /api/*)
            ├── MongoDB Atlas (via Mongoose or native driver)
            ├── AWS S3 (presigned URL generation server-side)
            └── Third-party APIs: Auth.js, Giphy, Imgflip
```

### App Router Pages

| Route | Auth Required | Description |
|-------|--------------|-------------|
| `/` | No | Redirects to `/dashboard` or `/login` |
| `/login` | No | Login page (no signup visible) |
| `/invite/[token]` | No | Invite acceptance + account creation |
| `/dashboard` | Yes | Card archive |
| `/cards/new` | Yes | Card creator |
| `/cards/[id]/edit` | Yes | Edit existing card |
| `/cards/[id]/share` | Yes | Share link management |
| `/view/[token]` | No | Public card viewer |
| `/admin/invites` | Yes (admin) | Invite management |
| `/library` | Yes | Personal image library |

### Data Model

#### `users`
```
{
  _id: ObjectId,
  email: string (unique),
  name: string,
  image: string (avatar URL, optional),
  role: "admin" | "user",
  provider: "google" | "credentials",
  passwordHash: string (null for Google users),
  createdAt: Date
}
```

#### `invites`
```
{
  _id: ObjectId,
  email: string,
  token: string (unique, URL-safe random),
  status: "pending" | "accepted",
  acceptedBy: ObjectId (ref: users, null until accepted),
  createdAt: Date,
  acceptedAt: Date (null until accepted)
}
```

#### `cards`
```
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  templateType: "standard",
  title: string,
  message: string,
  recipientName: string,
  image: {
    mode: "upload" | "giphy" | "meme" | null,
    imageId: ObjectId (ref: images, null for giphy),
    giphyUrl: string (null unless mode = "giphy"),
    s3Key: string (null unless mode = "upload" or "meme")
  } | null,
  effect: "confetti" | "balloons" | "leaves" | null,
  createdAt: Date,
  updatedAt: Date
}
```

#### `images`
```
{
  _id: ObjectId,
  userId: ObjectId (ref: users),
  s3Key: string,
  filename: string,
  size: number (bytes),
  mimeType: string,
  createdAt: Date
}
```

#### `shareLinks`
```
{
  _id: ObjectId,
  cardId: ObjectId (ref: cards),
  token: string (unique, URL-safe random),
  expiresAt: Date | null (null = never expires),
  createdAt: Date
}
```

### S3 Structure
```
users/{userId}/images/{uuid}.{ext}    ← uploaded images and meme renders
```
Giphy GIF URLs are stored directly in the card document — not copied to S3.

### Meme Flow (Client-Side)
1. Fetch top 100 Imgflip templates on mount (cached)
2. User searches by name (client-side filter)
3. User picks template → types caption
4. Canvas draws template image + caption text (live preview)
5. Canvas exported as PNG blob → presigned URL requested → uploaded to S3
6. S3 key stored on card as `mode: "meme"`

### Effect Registry
```typescript
// effects/registry.ts
export const effects: Record<string, EffectModule> = {
  confetti: () => import('./confetti'),
  balloons: () => import('./balloons'),
  leaves:   () => import('./leaves'),
}
```
Each effect module exports a single `play(): void` function.
`canvas-confetti` is a local dependency of `effects/confetti.ts` only.

---

## API Contract

All routes are Next.js Route Handlers under `/api/`.

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/invites` | Admin | Create invite, return token |
| GET | `/api/invites` | Admin | List all invites |
| GET | `/api/invites/[token]` | No | Validate invite token |
| POST | `/api/auth/[...nextauth]` | — | Auth.js handler |
| GET | `/api/cards` | User | List user's cards |
| POST | `/api/cards` | User | Create card |
| GET | `/api/cards/[id]` | User | Get card |
| PUT | `/api/cards/[id]` | User | Update card |
| DELETE | `/api/cards/[id]` | User | Delete card + share links |
| POST | `/api/cards/[id]/duplicate` | User | Duplicate card |
| POST | `/api/cards/[id]/share` | User | Create share link |
| GET | `/api/cards/[id]/share` | User | List share links for card |
| GET | `/api/view/[token]` | No | Resolve share link → card data |
| POST | `/api/images/presign` | User | Generate S3 presigned upload URL |
| GET | `/api/images` | User | List user's image library |
| GET | `/api/giphy/search` | User | Proxy Giphy search (hides API key) |
| GET | `/api/memes/templates` | User | Proxy Imgflip get_memes |

---

## Security Considerations

- Invite tokens: cryptographically random (crypto.randomBytes), single-use
- Share link tokens: cryptographically random (crypto.randomBytes)
- Passwords: hashed with bcrypt (cost factor 12) via Auth.js credentials provider
- S3 presigned URLs: scoped to user's prefix, short TTL (5 minutes)
- Giphy API key: never exposed client-side (proxied through `/api/giphy/search`)
- Card ownership enforced server-side: users can only read/modify their own cards
- `/admin/invites` route: middleware checks `role === "admin"`, returns 403 otherwise
- `/view/[token]` expiry: checked on every request server-side (not just client-side)

---

## Error Handling

| Scenario | Response |
|----------|---------|
| Invite token already used | "This invite has already been accepted" |
| Google sign-in with uninvited email | Redirected to login, no signup shown |
| Duplicate invite email | Admin sees warning, no duplicate created |
| Upload exceeds 10MB | Inline error before upload starts |
| Unsupported file type | Inline error |
| Giphy API unavailable | Fallback message; user can switch to upload mode |
| Imgflip API unavailable | Fallback message; user can switch to upload mode |
| Expired share link opened | Friendly "This card has expired" page |
| Invalid/deleted share link | "Card not found" page |
| Card deleted with active share links | Share links return 410 Gone |
| Unauthorized card access | 403 Forbidden |

---

## Observability

Deferred to post-MVP. Vercel provides basic request logs and error tracking on free tier.

---

## Acceptance Criteria

**Invite flow**
- Given I'm the admin, when I enter an email and send an invite, then the invite appears as "pending" in my dashboard and the invite link is displayed and copyable
- Given a pending invite exists, when I click "Copy link", then the invite URL is copied to my clipboard
- Given an invite link is clicked, when the user completes signup, then their status changes to "accepted" and they can log in
- Given an uninvited visitor hits the app, when they reach the login page, then no signup option is visible

**Card creation**
- Given I'm logged in, when I create a card, then title, message, and recipient name are required before saving
- Given I select upload mode, when I choose a file over 10MB or wrong type, then I see an inline error before upload starts
- Given I select meme mode, when I pick a template and type a caption, then I see a live preview rendered on canvas
- Given I select GIF mode, when I search Giphy and pick a GIF, then it appears as the card image
- Given I pick an effect, when the card is saved, then that effect is stored with the card
- Given I set share expiry, when I choose 7 / 30 / 90 days / never, then that duration is applied to generated links

**Sharing & viewing**
- Given a card exists, when I click "Get link", then a unique public URL is generated and copyable
- Given a valid, unexpired share link is opened, then the card is shown and the effect plays automatically
- Given an expired share link is opened, then a friendly expiry message is shown (no card content)
- Given an invalid share link is opened, then a "card not found" message is shown

**Archive & reuse**
- Given I'm logged in, when I visit `/dashboard`, then I see all my cards with title, recipient, date, and link status
- Given I duplicate a card, then a new draft opens pre-filled with the original's content
- Given I delete a card, then it is removed from my archive and all its share links return "card not found"

**Image library**
- Given I've previously uploaded images, when I open the card creator, then I can browse and select from my image library
- Given I upload a new image, then it appears in my library for future use

---

## Domain Model

### Entities

| Entity | Definition |
|--------|-----------|
| User | An authenticated account (admin or regular user) |
| Invite | A single-use token granting signup access to one email |
| Card | A digital greeting card with content, image, and effect |
| Image | An uploaded file stored in S3, owned by a user |
| ShareLink | A public URL token pointing to a card, with optional expiry |

### Relationships
```
User (1) ──< Invite (many, as creator)
User (1) ──< Card (many)
User (1) ──< Image (many)
Card (1) ──< ShareLink (many)
Card (0..1) ──> Image (optional)
```

### Glossary

| Term | Definition |
|------|-----------|
| Invite | A single-use token sent by the admin granting one email access to sign up |
| Share link | A public URL with an optional expiry that lets anyone view a specific card |
| Effect | A viewport-level animation that plays automatically when a card is opened |
| Effect registry | A central map of effect name → self-contained animation module |
| Template type | A card layout variant; only `standard` exists in MVP |
| Image library | A per-user collection of all previously uploaded images |
| Meme mode | Card image creation by picking an Imgflip template and rendering caption on canvas |

### Bounded Contexts
- **Identity**: users, invites, auth sessions
- **Cards**: cards, images, share links
- **Viewer**: public card view (no auth context)

---

## Specs Directory Changes

### Before
```
specs/
└── INDEX.md
```

### After
```
specs/
└── INDEX.md   (updated with this change entry)

changes/
└── 2026/
    └── 06/
        └── 03/
            └── m5ha2q-mvp-foundation/
                └── 01-mvp-foundation/
                    └── SPEC.md
```

### Changes Summary

| Path | Action | Description |
|------|--------|-------------|
| `changes/2026/06/03/m5ha2q-mvp-foundation/01-mvp-foundation/SPEC.md` | Created | This spec |
| `specs/INDEX.md` | Updated | Added mvp-foundation-1 entry |

---

## Components

New components will be scaffolded during implementation.

### New Components

| Component | Type | Settings | Purpose |
|-----------|------|----------|---------|
| `config` | config | `{}` | Centralized project config (singleton) |
| `ecards-db` | database | `provider: mongodb` | MongoDB Atlas data store |
| `ecards-app` | webapp | Next.js 16 App Router, deployed on Vercel | Full-stack application (frontend + API routes) |
| `main-pipeline` | cicd | GitHub Actions → Vercel | CI/CD pipeline |

---

## System Analysis

### Inferred Requirements
- Auth.js requires a `NEXTAUTH_SECRET` env var and MongoDB adapter for session persistence
- S3 presigned URL generation requires AWS credentials in Vercel env vars
- Giphy API key must be server-side only (proxied)
- Imgflip `get_memes` endpoint is public (no key needed for template listing)
- Invite token must be invalidated after use (single-use)

### Gaps & Assumptions
- **Email sending deferred**: Admin copies and shares invite links manually in MVP; Resend integration is v2
- **No image deletion**: Images persist in S3 indefinitely in MVP
- **Single effect per card**: Stacking effects is a future enhancement
- **Giphy URLs stored directly**: No S3 copy of GIFs in MVP; dependency on Giphy CDN accepted
- **Hard delete only**: No soft delete / trash in MVP
- **No invite expiry**: Invite links do not expire in MVP (deferred)
- **Tests deferred**: No unit, integration, or E2E tests in MVP

### Dependencies

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Next.js | 16 | Full-stack framework |
| Auth.js | Latest | Authentication |
| Mongoose | Latest | MongoDB ODM |
| AWS SDK v3 | Latest | S3 presigned URLs |
| canvas-confetti | Latest | Confetti effect only |
| MongoDB Atlas | Free tier | Data store |
| AWS S3 | — | Asset storage |
| Giphy API | v1 | GIF search |
| Imgflip API | — | Meme templates (no key needed) |
| Vercel | Free tier | Hosting |

---

## Testing Strategy

Deferred to post-MVP. No tests in initial implementation.

---

## Out of Scope

- Email delivery for invites (Resend integration — v2)
- Email delivery for share links
- Unit, integration, and E2E tests (post-MVP)
- Multiple effects per card
- Text overlay on GIFs
- Traditional card template (front + inside)
- Template gallery / template picker UI
- Image deletion from library
- User-to-user invites (admin only in MVP)
- Soft delete / trash
- Card link click analytics / view counts
- Mobile app

---

## Open Questions

None — all questions resolved or explicitly deferred.

---

## Requirements Discovery

### Solicitation Phase

| # | Question | Answer |
|---|----------|--------|
| 1 | What is the scope of the MVP? | Full e-card creation + sharing — not just infra skeleton |
| 2 | What framework? | Next.js 16 (App Router) |
| 3 | What can a user put on a card? | Title, message, recipient name, optional image (upload/meme/GIF), optional effect. No "inside" for MVP. |
| 4 | Are there pre-made templates? | No gallery in MVP. `template_type` field added for extensibility. |
| 5 | How does image attachment work? | Three modes: upload (10MB max), Giphy GIF (URL stored), Imgflip meme (canvas render → S3) |
| 6 | How does meme search/selection work? | Fetch top 100 Imgflip templates, user searches client-side by name, picks one, types caption, canvas renders, uploads to S3 as PNG |
| 7 | How does GIF support work via Giphy? | Giphy Picker component, URL stored directly. No text overlay on GIFs in MVP. |
| 8 | Content restrictions? | None for now |
| 9 | What effects are supported? | Confetti (canvas-confetti), Balloons (CSS), Leaves (CSS). One per card. Auto-plays on open. |
| 10 | Animation/3D library needed? | No project-level library. canvas-confetti for confetti only. Effects are self-contained modules. |
| 11 | How does sharing work? | Generate public link (essential). Email delivery deferred to v2. |
| 12 | Share link expiry? | User-configurable: 7 / 30 / 90 days / never |
| 13 | Multi-tenancy model? | Multi-user (not org-level). Each user has their own account. |
| 14 | Authentication? | Google OAuth + email/password. Invite-only registration. |
| 15 | Who can send invites? | Admin only |
| 16 | Invite flow? | Admin enters email → system generates link → admin copies and shares directly |
| 17 | Admin invite UI? | Page at /admin/invites showing pending/accepted invites with copy link action |
| 18 | Uninvited visitor experience? | Login page only — no signup option visible |
| 19 | Card archive? | Yes — list of all user's cards with title, recipient, date, link status |
| 20 | Card duplication? | Yes — opens pre-filled editor, saves as new independent card |
| 21 | Card deletion? | Yes — hard delete, immediately invalidates share links |
| 22 | Image reuse across cards? | Yes — personal image library (per-user, browse and select from past uploads) |
| 23 | Image deletion from library? | No — not in MVP |
| 24 | Email provider for invites? | Resend chosen, then cut from MVP scope. Admin shares link directly. |
| 25 | MongoDB collections sufficient? | Yes — users, invites, cards, images, shareLinks |
| 26 | App routes look right? | Yes |
| 27 | Template gallery concept? | Good idea — add `template_type` field now, ship only `standard`, expand in v2 |
| 28 | Tests? | Deferred to post-MVP |

---

## References

- [Auth.js docs](https://authjs.dev)
- [Imgflip API](https://imgflip.com/api)
- [Giphy Developers](https://developers.giphy.com)
- [canvas-confetti](https://github.com/catdad/canvas-confetti)
- [AWS SDK v3 S3 presigned URLs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/modules/_aws_sdk_s3_request_presigner.html)
- [Vercel deployment limits](https://vercel.com/docs/functions/runtimes#request-body-size)

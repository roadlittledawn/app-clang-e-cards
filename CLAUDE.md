# CLAUDE.md

This project uses SDD (Spec-Driven Development). All feature work follows the spec → plan → implement → verify lifecycle.

## Stack

- **Framework:** Next.js 15 (App Router)
- **Database:** MongoDB (Atlas)
- **Assets:** AWS S3
- **Auth:** TBD (via SDD spec)
- **Deployment:** Vercel
- **Multi-tenancy:** Yes

## SDD Commands

- `/sdd` — context-aware guidance
- `/sdd-run change create --type feature --name <name>` — start a new feature
- `/sdd-run change list` — list active changes

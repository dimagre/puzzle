# Decisions

## 2026-05-20 — Project initialized

- **Decision**: Accept owner's tech stack as-is (Next.js 14 App Router, TS, Prisma, PostgreSQL, Tailwind, Sharp, JWT HTTP-only cookies)
- **Alternatives considered**: None — owner specified stack explicitly
- **Owner sign-off**: Implicit (owner provided the stack)

## 2026-05-20 — Auth: Auth.js v5

- **Decision**: Use Auth.js v5 (formerly NextAuth.js) with Credentials provider
- **Alternatives considered**: Custom JWT (more code, no proven patterns), Clerk (paid at scale), Auth0 (overkill)
- **Owner sign-off**: Yes — owner said "те шо менше потребує писати самім, краще вже пророблене"

## 2026-05-20 — Payments: Monobank Acquiring API

- **Decision**: All payments via Monobank Acquiring API. Deposits use `paymentType: "hold"` (9-day pre-auth). Regular payments use `paymentType: "debit"`.
- **Alternatives considered**: LiqPay, card transfer, cash on delivery — owner explicitly chose Monobank only
- **Owner sign-off**: Yes — "Думав все закрити монобанком тільки"

## 2026-05-20 — UI Library: shadcn/ui

- **Decision**: Use shadcn/ui (free, copy-paste components, Radix primitives for a11y)
- **Alternatives considered**: DaisyUI (simpler but less customizable, weaker a11y), Tailwind UI (paid)
- **Owner sign-off**: Yes — "shadcn/ui - ок"

## 2026-05-20 — Color Scheme: Sage & Cream

- **Decision**: Primary #5B8C5A (muted green), Secondary #F5F0E8 (warm cream), Accent #D4956A (terracotta)
- **Alternatives considered**: Deep Teal & Coral (modern marketplace), Indigo & Amber (premium feel)
- **Owner sign-off**: Yes — "Sage & Cream - ок"

## 2026-05-20 — Image Storage: Vercel Blob (dev)

- **Decision**: Vercel Blob for development (free tier, zero-config). Migrate to local storage or Cloudflare R2 on production move to ukraone.com.ua
- **Alternatives considered**: Cloudflare R2 (cheap but needs account setup), local+nginx (free but no CDN)
- **Owner sign-off**: Yes — "Що простіше і швидше"

## 2026-05-20 — Hosting: Vercel (dev) -> ukraone.com.ua (prod)

- **Decision**: Develop on Vercel free tier. Production deployment to owner's existing hosting at ukraone.com.ua
- **Alternatives considered**: VPS from start (slower dev loop)
- **Owner sign-off**: Yes

## 2026-05-20 — Branching: main + feature branches

- **Decision**: main as protected branch, feature branches with PR-based workflow
- **Alternatives considered**: main + develop (unnecessary complexity for this team size)
- **Owner sign-off**: Yes — "обирай сам"

## 2026-05-20 — Scope: free puzzles deferred, exchange admin-only

- **Decision**: Remove free puzzles from MVP scope. Exchange feature stays but admin-managed only.
- **Alternatives considered**: Include both (owner explicitly deferred free puzzles)
- **Owner sign-off**: Yes

## 2026-05-20 — Agents created by Lead (self-service)

- **Decision**: Lead creates agents directly via `multica agent create` rather than posting hiring specs for owner to execute manually.
- **Alternatives considered**: Owner creates agents manually from hiring specs
- **Owner sign-off**: Yes — owner asked "are you capable to create agents?" confirming preference for autonomous setup
- **Agents created**: fullstack-dev (Opus, d4735889), ui-dev (Sonnet, d0b844c2)

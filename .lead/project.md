# PuzzleShare (ukraone.com.ua)

## What
Web platform for renting and exchanging jigsaw puzzles in Ukraine. Admin-managed inventory — users browse a catalog, rent puzzles for N days, pay online, receive via Nova Poshta / Ukrposhta / self-pickup.

## Target User
Puzzle enthusiasts in Ukraine who want variety without buying every puzzle. Initially Kyiv-area, expanding later.

## Problem
Puzzles are expensive, take up space, and lose replay value after assembly. No convenient rental service exists in Ukraine.

## Success Metrics
- Live staging by end of May 2026
- First real order within 2 weeks of production launch
- 50+ puzzles in catalog at launch

## Tech Stack
- Next.js 14 (App Router), TypeScript strict
- Prisma + PostgreSQL (Neon for staging/prod)
- Tailwind + shadcn/ui
- Auth.js v5 (Credentials)
- Vercel hosting
- Monobank Acquiring (payments)
- Nova Poshta / Ukrposhta APIs (delivery)
- Domain: ukraone.com.ua

## Hard Constraints
- Currency: UAH only
- Bilingual: Ukrainian (default) + English
- Mobile-first
- Admin-only puzzle creation (no user uploads in MVP)
- No free puzzles in MVP
- Exchange: admin-managed only

## Cost Thresholds (owner-set defaults)
- Recurring: $20/month
- One-time: $100

## Current Phase
Phase 1 (Foundation) nearly complete. Auth done, Puzzle API merged, catalog UI wired next. Staging deploy in progress on Vercel.

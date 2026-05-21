# PuzzleShare

## What We're Building

Web platform for renting, exchanging, and giving away jigsaw puzzles. Warehouse in Kyiv, delivery via Nova Poshta / Ukrposhta across Ukraine.

## Target User

- **Primary**: Puzzle enthusiasts in Ukraine who want access to variety without buying every puzzle (rent, exchange, get free ones)
- **Secondary**: Admin/operator managing inventory from a Kyiv warehouse

## Problem

Puzzles are expensive, take up space, and are typically assembled once. There's no convenient service in Ukraine for renting or exchanging them affordably with nationwide delivery.

## Success Metrics

- TBD by owner (suggested: active rentals/month, user retention, catalog size, order fulfillment time)

## Tech Stack (owner-specified)

- Next.js 14 (App Router)
- TypeScript (strict)
- Prisma + PostgreSQL
- Tailwind CSS + shadcn/ui
- Color scheme: "Sage & Cream" — Primary #5B8C5A, Secondary #F5F0E8, Accent #D4956A
- Sharp (image optimization)
- Auth.js v5 (Credentials provider, email/password)
- Monobank Acquiring API (payments + hold for deposits)
- Vercel Blob (dev) -> local/R2 (prod) for image storage
- Vercel (dev) -> ukraone.com.ua (prod) for hosting

## Hard Constraints

- Currency: UAH (₴) only
- Delivery: Nova Poshta, Ukrposhta, self-pickup from warehouse (Kyiv), self-pickup from seller
- Language: bilingual UI (Ukrainian / English) with switcher
- Mobile-first responsive design
- Admin-only puzzle creation (no user-generated listings)
- Telegram notifications for orders
- Payments: Monobank only (no LiqPay, no cash on delivery)
- Deposit mechanism: Monobank hold (9-day pre-auth, auto-cancel if not finalized)
- Free puzzles: deferred (not in MVP)
- Exchange: admin-managed only (no user-to-user for now)

## Current Phase

Greenfield — repo exists but is empty. Moving from spec to implementation.

## Cost Thresholds (defaults until owner sets)

- Recurring: $20/month
- One-time: $100

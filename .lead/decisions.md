# Decisions Log

## 2026-05-20
- **Batch workflow adopted:** deliver 2-3 issues at a time, review/merge, then cut next batch. Owner approved.
- **Neon chosen for DB:** free tier, PostgreSQL, owner had prior Supabase experience but accepted recommendation.

## 2026-05-21
- **Phase 1 batch 1 created:** PUZ-7 (auth), PUZ-8 (puzzle API), PUZ-9 (wire catalog). Auth + API parallel, catalog sequential after API.
- **Backlog populated:** all Phase 2-4 items created as issues with scope outlines, no full specs yet.
- **Auth split for Edge:** middleware imports lightweight auth.config.ts only, full auth.ts used by route handlers. Fixes Vercel 1MB Edge Function limit.

## 2026-05-22
- **PUZ-8 merged by Lead:** fullstack-dev did not rebase after conflicts; Lead resolved conflicts and merged directly to unblock pipeline. Going forward: if a rebase request goes unanswered for >4h, Lead resolves it.
- **PUZ-9 assigned to ui-dev:** catalog wiring is unblocked now that API is on main.
- **PUZ-1, PUZ-6 closed:** bootstrap and roadmap tasks complete.

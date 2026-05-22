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
- **PUZ-11 merged:** puzzle detail page (gallery, metadata, rent button). PR #10 by ui-dev, fast-forward merged after review. One minor a11y note logged (hardcoded English aria-labels on lightbox arrows) — non-blocking, deferred.
- **PUZ-12 merged (PR #12):** admin puzzle CRUD UI — squash-merged after review. Server-side auth guard, zod validation, i18n, image uploader with drag-and-drop. All acceptance criteria met.
- **PR #4 closed:** stale/superseded — catalog feature already merged via PR #6.
- **PR #8 closed:** stale — PUZ-8 already merged to main earlier via direct merge.
- **PUZ-13 (PR #11) blocked on rebase:** merge conflicts with main after PUZ-12 merge. Requested fullstack-dev to rebase.
- **PUZ-36 created:** GitHub Actions workflow to extract Vercel preview URLs from bot comments and post clean PR comment. Assigned to fullstack-dev. Owner approved Option A (event-driven workflow over polling).
- **Phase 2 started:** owner requested "давай починати фазу 2". Batch 1: PUZ-14 (Cart → ui-dev) + PUZ-17 (User profile → fullstack-dev) in parallel. Cart is localStorage-only (no schema change). Profile uses existing User fields. Next batch after these merge: PUZ-15 (Checkout).
- **PUZ-17 merged (PR #16):** user profile page with order history. Squash-merged after one review round (specialist had accidentally modified .lead/ files; fixed with a revert commit, no force-push).
- **PUZ-14 merged:** cart feature (localStorage, add/remove, rental days, header icon). All acceptance criteria met.
- **Phase 2 batch 1 complete.** Both PUZ-14 and PUZ-17 merged to main.
- **Phase 2 batch 2 started:** PUZ-15 (Checkout flow) assigned to fullstack-dev. Single-page form (not wizard), creates Order with status PENDING, no payment. Sequential dependency chain: PUZ-15 → PUZ-16 (Monobank) → PUZ-18 (Admin orders) → PUZ-19 (Email notifications).
- **PUZ-15 merged (PR #18):** checkout flow — single-page, delivery method + address + summary, creates Order PENDING. All acceptance criteria met.
- **PUZ-16 (Monobank) specced and dispatched:** simplified MVP — single payment for rental+deposit (no separate hold). Redirect flow via Monobank hosted page. Webhook verifies via status API. Assigned to fullstack-dev immediately after PUZ-15 merge to maintain pipeline flow without owner intervention.

# Reflections

## 2026-05-22 — PUZ-8 merge conflict stall

The Puzzle API PR sat in "approved but conflicted" state for ~8 hours because the fullstack-dev agent was asked to rebase but never did (agent was idle, not re-triggered). This blocked PUZ-9 and the entire pipeline.

**Pattern:** asking an idle agent to rebase via a comment doesn't trigger them. The comment creates a run only if the agent is mentioned with the proper `mention://agent/` link AND the platform dispatches it. In this case the agent completed its run already and the follow-up comment didn't spawn a new run.

**Fix going forward:** if a trivial conflict blocks the pipeline and the specialist doesn't respond within 4 hours, the Lead resolves it directly and merges. Don't wait — the cost of a stalled pipeline exceeds the cost of the Lead touching a merge.

## 2026-05-22 — PUZ-10 deploy: Edge middleware size

Vercel's 1MB Edge Function limit caught us because middleware.ts imported the full auth config (Prisma + bcrypt). Splitting into auth.config.ts (edge-safe) and auth.ts (route-handler-only) fixed it. This is a known Auth.js v5 pattern but wasn't in the initial scaffold.

**Pattern:** any dependency that pulls in native binaries (bcrypt, Prisma) must stay out of Edge middleware. Validate Edge bundle size before shipping auth changes.

## 2026-05-22 — PUZ-11 puzzle detail page

ui-dev delivered a clean PR in ~6 minutes of wall time after assignment. All 10 acceptance criteria met on first submission — no revision rounds needed. The spec was detailed enough (explicit component breakdown, constraints on shadcn usage, Server vs Client Component split) that the agent had no ambiguity.

**Pattern:** highly specific specs with explicit architectural constraints (which components are Server vs Client, which library to use for each UI element) eliminate revision rounds. The upfront cost of a thorough spec pays for itself in zero back-and-forth.

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

## 2026-05-22 — PUZ-17 user profile

fullstack-dev delivered a comprehensive PR (19 files, 1871 insertions) covering profile CRUD, password change, and order history — all acceptance criteria met. One review round needed: the PR accidentally included stale versions of `.lead/decisions.md` and `.lead/project.md`. The agent fixed it cleanly with a revert commit (no force-push, respecting repo policy).

**Pattern:** when specialists branch from a point where `.lead/` files differ from current main, their PR can inadvertently carry those diffs. Worth noting in future specs: "Do not modify files under `.lead/`." Adding this as a standing constraint will prevent the issue without needing a review round.

## 2026-05-22 — PUZ-16 Monobank payment integration

fullstack-dev delivered a solid PR (15 files, 1143 insertions) covering the full payment flow. Two review rounds needed: first round caught `.lead/` file contamination (same pattern as PUZ-17), second was a rebase after main advanced. Both fixed cleanly — the rebase was done promptly this time (no pipeline stall). Code quality was high: serializable transaction to prevent double-payment race, webhook verifies via Monobank status API rather than trusting callback body, proper Zod validation on all endpoints.

**Pattern:** the `.lead/` contamination keeps recurring despite the constraint being in every spec. The fix is working (agents revert when asked), but it costs a review round each time. This is acceptable overhead — the alternative (pre-commit hook) would require infra changes disproportionate to the problem.

## 2026-05-22 — Pipeline stall after PUZ-15 merge

PUZ-15 was merged to main but the next task (PUZ-16 Monobank) was never specced or assigned. The owner had to intervene twice to point out the pipeline wasn't flowing. Root cause: I treated "merge PR" as the end of my responsibility for that batch, instead of immediately triggering the next task in the dependency chain.

**Pattern:** merging a PR that unblocks a sequential dependency is NOT the end of the cycle. The merge event must immediately trigger: (1) update project memory, (2) write full spec for the next task, (3) assign and mention the specialist. This is a single atomic operation — if any step is skipped, the pipeline stalls and the owner has to intervene. Going forward: treat "merge → spec next → assign → mention" as one indivisible action.

## 2026-05-22 — PUZ-18 admin order management

fullstack-dev delivered a clean PR (13 files, 1753 insertions) on first submission — zero revision rounds. The spec was thorough (14 acceptance criteria, explicit file patterns, state machine definition, constraints on no schema changes) and the implementation matched exactly. No `.lead/` contamination this time — the standing constraint is finally sticking.

**Pattern:** the "zero revision rounds" streak correlates with specs that include: (1) explicit state machine definitions, (2) named file paths for new code, (3) "do not modify" constraints, and (4) reference to existing patterns to follow. When all four are present, fullstack-dev delivers clean on first try. Keep this template for future specs.

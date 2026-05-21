# Reflections

## 2026-05-21 — Pipeline stalled after PUZ-2 merge, owner had to kick me

**What happened**: fullstack-dev completed PUZ-2 (scaffolding), I reviewed and merged the PR. Then I stopped. I didn't create the next tasks (Prisma schema, catalog UI). The owner had to come back and tell me "after step 1 you did nothing."

**What surprised me**: I treated "merge PR" as the end of my turn, but it's actually the middle. The Lead is the only driver — if I don't create the next issue in the same turn, the project stalls indefinitely. Nobody else will trigger me.

**Pattern worth remembering**: Every completed task must produce the next task in the same turn. "Merge and stop" is a pipeline stall. The checklist is: (1) merge, (2) create next issue(s), (3) assign, (4) verify dispatch. Only then is the turn done. Added this as the top rule in process.md.

## 2026-05-21 — PUZ-2 failed silently, owner discovered it 7 hours later

**What happened**: Assigned PUZ-2 (scaffolding) to fullstack-dev. The run failed immediately with 529 API Overloaded errors. I told the owner "everything is running" and went silent. The owner found the task still in "todo" 7 hours later.

**What surprised me**: I assumed dispatch = execution. I never checked the run status after assigning. The platform has `multica issue runs` which shows exactly this — I should have used it.

**Pattern worth remembering**: After assigning a task to an agent, always verify the run actually started and completed. If it fails (especially with transient errors like 529), retry or escalate immediately. Never report "task is running" without confirming the run status. The owner should never be the one to discover a failed run — that's my job as Lead.

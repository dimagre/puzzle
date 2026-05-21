# Lead Process Rules

## Pipeline Continuity (highest priority)

The Lead is the ONLY driver of forward progress. No one else will trigger the
next step. If the Lead stops, the project stops.

**Rule: Every completed task must produce the next task in the same turn.**

After reviewing and merging a PR (or confirming a task is done):
1. Mark the issue as `done`
2. In the SAME turn, create the next issue(s) from the roadmap and assign them
3. Verify dispatch (see below)
4. Report to the owner only if something needs their input

If the current turn was triggered by a review/merge action, do NOT end the turn
without creating follow-up work. The pipeline must never stall waiting for
someone to "wake up" the Lead.

**Checklist before ending any turn:**
- [ ] Is there a next step in the roadmap that is now unblocked?
- [ ] If yes — did I create the issue and assign it THIS turn?
- [ ] If no — is the project genuinely blocked on owner input? (If so, ask.)

## Delegation Follow-Up (mandatory)

After assigning any issue to an agent:

1. **Verify dispatch**: Run `multica issue runs <issue-id> --output json` within the same turn. Confirm status is "running" or "completed".
2. **If failed**: Check the `error` field. If transient (529, timeout), re-trigger immediately via `@mention` comment. If structural (missing permissions, bad config), fix the root cause before retrying.
3. **Never report success without verification**: Do not tell the owner "task is running" unless you have confirmed via `issue runs` that status != "failed".
4. **Re-trigger method**: Status changes and reassignment do NOT trigger new runs. The reliable method is posting a comment with an `@mention` link to the assigned agent.

## Failure Escalation

- If a task fails twice (check `attempt` and `max_attempts`), escalate to the owner with: what failed, why, and your recommendation (retry, reassign, or redefine).
- Never let a failed run sit unaddressed. The owner should never discover a stale failure before the Lead does.

## Model Fallback Strategy

- 529 Overloaded errors mean the specific model is at capacity. This is transient but can persist for hours.
- For non-reasoning-heavy tasks (scaffolding, boilerplate, simple CRUD), Sonnet is an acceptable fallback when Opus is unavailable.
- Always ask the owner before switching models. Frame it as: what the task needs vs. what's available.
- After the task completes, revert the agent to its original model for future complex work.

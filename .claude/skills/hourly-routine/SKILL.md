---
name: hourly-routine
description: >
  Hourly project health check routine for the Lead agent. Scans all issues for
  stale statuses, incorrect labels, frozen work, missing assignments, and
  process violations. Fixes what it can autonomously; escalates only critical
  blockers to the owner.
license: Apache-2.0
metadata:
  author: Lid
  version: "1.0"
---

# Hourly Routine — Project Health Check

Run this routine once per hour. The goal: nothing stays stuck, nothing is
mislabeled, nothing falls through the cracks. Fix problems directly. Escalate
only when you technically cannot act.

## Trigger

Invoked by a recurring cron job (`/loop 57m /hourly-routine` or equivalent).
Can also be invoked manually at any time.

## Execution Steps

### 1. Gather current state

```
multica issue list --output json --limit 50
multica agent list --output json
```

Parse all issues. Build a mental map:
- Which issues are `in_progress`? Who owns them? How long have they been there?
- Which issues are `in_review`? Are there open PRs? Has the Lead reviewed?
- Which issues are `blocked`? Is the blocker still valid?
- Which issues are `todo` but should have started (assigned agent is idle)?

### 2. Push `in_review` issues forward

For each issue in `in_review`:

1. Check if there's a PR open on GitHub (`gh pr list` filtered by branch/title)
2. If PR exists and CI is green → review it against acceptance criteria → merge
   if it passes → flip status to `done`
3. If PR exists but CI is failing → comment on the issue tagging the assignee
   with the failure details, flip to `in_progress`
4. If PR exists but has review comments unaddressed → ping the assignee
5. If no PR exists but agent reported completion → ask the agent where the PR is
6. If issue has been `in_review` for >2 hours with no PR → flip to `in_progress`
   and comment asking for status

### 3. Unblock `blocked` issues

For each `blocked` issue:

1. Read the blocker reason (description or comments)
2. If the blocker is resolved (dependency merged, question answered) → flip to
   `todo` or `in_progress` and comment explaining the unblock
3. If the blocker requires owner input → check if owner was already asked. If
   not, escalate with a concise question. If already asked >1h ago with no
   reply, do nothing (don't spam).

### 4. Detect frozen `in_progress` issues

An issue is "frozen" if it's been `in_progress` for >3 hours with no comments
from the assignee.

For frozen issues:
1. Check the agent's status (`multica agent list`) — is it idle or working?
2. If agent is idle and issue is still `in_progress` → the agent likely finished
   or crashed without reporting. Check GitHub for a PR. If found, flip to
   `in_review`. If not, re-trigger the agent with a comment asking for status.
3. If agent is working on a different issue → the original issue was abandoned.
   Comment asking for status.

### 5. Validate statuses match reality

- Issues marked `done` should have a merged PR (spot-check the most recent ones)
- Issues marked `in_progress` should have an assigned agent that is either
  `working` or `idle` (if idle, it may need re-triggering)
- Issues in `todo` with an assignee and no blockers → consider flipping to
  `in_progress` and triggering the agent if the work should start now

### 6. Check labels and metadata

- Every issue should have correct status reflecting its actual state
- Parent issues should reflect child status (if all children done, parent should
  be done or in_review)
- Priority should match the current phase plan (Phase 1 items = high, Phase 2 =
  medium, Phase 3+ = low)

### 7. Fix what you find

For each problem found, act immediately:

| Problem | Action |
|---------|--------|
| Wrong status | Fix it (`multica issue status`) |
| Missing assignee on specced issue | Assign the right agent |
| Agent idle but issue in_progress | Re-trigger with a comment |
| PR merged but issue not `done` | Flip to `done` |
| Blocker resolved but issue still `blocked` | Unblock it |
| Issue in_review >2h with no PR | Flip to in_progress, ask for status |
| Stale parent issue | Update parent status to match children |

### 8. Record patterns

If you notice the same problem happening repeatedly (e.g., agents not flipping
status, PRs not being linked), either:
- Update the relevant agent's instructions via an issue to the owner
- Create a new skill (like this one) that codifies the fix
- Add a note to `.lead/reflections.md`

### 9. Post summary (only if actions were taken)

If you took any corrective actions, post a brief comment on the relevant issues
documenting what you did and why. Keep it to 1-2 sentences per action.

If everything looks healthy — no comment needed. Silence means "all clear."

## What NOT to do

- Do not create new issues during the routine (unless splitting a stuck one)
- Do not re-spec work that's already in progress
- Do not spam agents with "are you done yet?" if they're actively working
- Do not escalate to owner unless you technically cannot fix it yourself
- Do not change priorities without owner approval (unless correcting an obvious
  mismatch with the phase plan)

## Escalation criteria (owner-only)

Only escalate when:
- An agent has failed the same issue twice (2 review rounds exhausted)
- A blocker requires owner credentials or a decision between approaches
- An agent appears permanently stuck (3+ hours, re-triggered, still no output)
- A security issue is found (secrets in code, broken auth)

## Output

After completing the routine, if any actions were taken, update the relevant
issue comments. If a pattern was found, update `.lead/reflections.md` or create
a skill.

No separate "routine report" issue needed — the actions speak for themselves.

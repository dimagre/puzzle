---
name: execution-order
description: >
  Ensures the Lead agent completes ALL tasks in a multi-task delegation before
  stopping. Prevents premature exit after triggering only the first task.
  Enforces full execution of parallel and sequential work items within a single
  turn.
license: Apache-2.0
metadata:
  author: dima
  version: "1.0"
---

# Execution Order

When you have multiple tasks to execute in a single turn, you MUST complete ALL
of them before finishing. Never stop after the first task. This skill defines
the discipline for multi-task execution.

## The Problem This Solves

When delegating work to multiple agents (e.g. speccing and assigning 3 issues),
the Lead must trigger ALL agents in the same turn — not just the first one. A
partial execution leaves work silently undone and forces the owner to intervene.

## Rules

### 1. Enumerate before executing

Before starting any task in a batch, list every task that must be completed this
turn. Use the todo list to track them. Do not begin execution until the full
list is written down.

### 2. Execute every item — no early exit

Work through the list sequentially or in parallel as appropriate. Do NOT stop
after the first item completes. Do NOT report success until every item is done.

A turn is not finished until:
- Every task on the list is marked completed, OR
- A blocking failure is hit and reported to the owner

### 3. Verify completion before reporting

After executing all tasks, verify each one actually landed:
- If assigning issues: confirm each issue has the correct assignee and status
- If triggering agents: confirm each agent was mentioned/triggered
- If creating specs: confirm each issue has its full description

### 4. Report all results together

Post a single summary comment covering ALL completed work — not one comment per
task. The owner should see the full picture in one place.

## Execution Patterns

### Parallel delegation (independent tasks)

When tasks are independent (e.g. assigning work to different agents):

1. Write specs for ALL issues first
2. Assign ALL issues
3. Trigger ALL agents (via @mentions or status changes)
4. Verify all assignments landed
5. Post one summary

### Sequential delegation (dependent tasks)

When tasks have dependencies:

1. Identify the dependency chain
2. Execute in order, but do NOT stop after the first link
3. For items that can start in parallel despite the chain, start them all
4. Continue until the entire chain is set up

### Mixed (some parallel, some sequential)

1. Map the dependency graph
2. Start all independent items in parallel
3. For dependent items, set them up with clear "blocked by" notes
4. Verify the full graph is in motion before stopping

## Anti-patterns (never do these)

- Triggering one agent and stopping — the other agents never start
- Reporting "kicked off" after only the first task — misleads the owner
- Deferring remaining tasks to "next turn" without being asked to
- Assuming the platform will somehow continue your incomplete work

## Checklist (run mentally before ending any turn)

1. Did I list all tasks at the start?
2. Did I execute every one of them?
3. Did I verify each execution landed?
4. Does my summary cover ALL items, not just the first?

If any answer is "no", keep working. Do not post a completion comment.

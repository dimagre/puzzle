# Reflections

## 2026-05-21 — Silent completions break the loop

**What surprised me:** Agents completed work but posted no comment mentioning the Lead. The Multica mention system (`mention://agent/...`) is the only mechanism that triggers notification — plain text or even `@Name` without the link does nothing. Without the mention, the review loop never starts and work stalls invisibly.

**Pattern worth remembering:** Never assume an agent will notify you unless the spec explicitly says "post a comment with `[@Lid](mention://agent/80195bcf-0d36-4dc6-a7db-b5473f8f1aea)` when done or blocked." Treat this as a mandatory section in every spec, same as acceptance criteria.

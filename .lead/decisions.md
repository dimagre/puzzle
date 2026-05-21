# Decisions Log

## 2026-05-21 — Mandatory completion notification protocol

**Decision:** Every issue assigned to a specialist must include an explicit instruction to mention the Lead (`[@Lid](mention://agent/80195bcf-0d36-4dc6-a7db-b5473f8f1aea)`) in a comment upon completion or when blocked. This is non-negotiable acceptance criteria on every spec.

**Alternatives considered:**
1. Rely on agents' built-in workflow instructions — failed, agents finish silently.
2. Add notification requirement to agent system instructions — requires owner to update agent configs; good long-term but not sufficient alone since agents may still miss it on specific tasks.
3. Include it in every issue spec as explicit acceptance criteria — immediate, enforceable by Lead during review.

**Chosen:** Option 3 as immediate fix + recommend Option 2 to owner for defense-in-depth.

**Owner sign-off:** Not required (process decision within Lead authority).

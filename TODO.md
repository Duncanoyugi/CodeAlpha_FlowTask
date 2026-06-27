# TODO.md

## Phase 0 (forensic audit)
- [ ] (Cancelled/blocked) Produce full audit report with route table, UI entry-point table, role-resolution hop trace, OWNER reconciliation, bug reproduction, and IDOR spot check.

## Phase 2 (implementation options)
- [x] Option B approved for implementation.

## Phase 3 (implementation)
- [ ] Repair/rollback any unsafe intermediate authorization logic in `backend/src/modules/workspaces/workspace.service.ts`.
- [ ] Add a real repository helper in `backend/src/modules/workspaces/workspace.repository.ts` to fetch the caller’s workspace membership role(s).
- [ ] Implement backend authorization for `POST /workspaces` using DB-backed membership role(s), consistent with effective-role mapping.
- [ ] Ensure mutating endpoints consistently enforce effective role server-side.
- [ ] Update frontend guards for all creation entry points (defense-in-depth) and consume backend-returned effective role.
- [ ] Resolve OWNER handling end-to-end (remove dead branches or make consistent).

## Phase 4 (tests)
- [ ] Backend unit/integration tests for each mutating endpoint per role.
- [ ] Regression test reproducing MEMBER/VIEWER creating workspace/project now fails correctly.

## Phase 5 (prod-readiness)
- [ ] Single-source permission map documented.
- [ ] Verify no auth decision trusts client-supplied role.
- [ ] Add audit logging for authorization denials.


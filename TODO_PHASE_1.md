# TaskFlow — Phase 1 TODO (Security parity: Socket.IO unify + authorization)

## 1) Server unification (canonical system)
- [ ] Decide canonical inbound/outbound event vocabulary and delete/disable the duplicate system.
  - Canonical system: `backend/src/sockets/*` (handler-per-domain)
  - Remove duplicate domain listeners from `backend/src/config/socket.ts` for task/comment events.

## 2) Authorization parity in socket mutators
- [ ] Update `backend/src/sockets/handlers/task.handler.ts`
  - Reject any attempt to use client-provided `userId`
  - Use identity from `socket.data.userId`
  - Call the effective-role resolver (same logic as REST) before any Prisma mutation
  - Emit canonical events: `task:created|updated|moved|deleted` to rooms

- [ ] Update `backend/src/sockets/handlers/comment.handler.ts`
  - Reject any attempt to use client-provided `userId`
  - Use identity from `socket.data.userId`
  - Call effective-role resolver before any Prisma mutation
  - Emit canonical events: `comment:added|updated|deleted` to rooms

## 3) Event vocabulary alignment
- [ ] Update inbound socket listener names to match canonical vocabulary exactly.
- [ ] Remove all `:success` / `:error` variants for task/comment events unless required for UI; if required, define a single canonical error response pattern.
- [ ] Ensure no old event names remain referenced.

## 4) Frontend socket lifecycle + event name updates
- [ ] Ensure socket connects once on auth success.
  - Wire `socketService.connect(accessToken)` into a provider or auth-success hook.
- [ ] Ensure listeners are registered once.
- [ ] Update frontend code to use canonical event names.

## 5) Verification against acceptance criteria
- [ ] Two-session realtime: move card + add comment appear once in other session.
- [ ] Unauthorized raw socket emit is rejected (no DB mutation).
- [ ] Old event names removed.


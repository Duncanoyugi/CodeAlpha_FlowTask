# TODO

## Goal: Fix TypeScript build errors (backend)

1. Fix `backend/src/jobs/index.ts` imports to match existing job files.
2. Fix `backend/src/modules/mailer/email.service.ts` logger/env imports (module shape mismatches).
3. Fix `backend/src/modules/search/search.controller.ts` query param typing (`string | string[]`).
4. Export `SocketUser` from `backend/src/config/socket.ts`.
5. Fix `backend/src/sockets/middleware/auth.middleware.ts` to remove dependency on `socket.io/dist/typed-emitter`.
6. Re-run `cd backend && npm run build` and resolve any remaining TS errors.


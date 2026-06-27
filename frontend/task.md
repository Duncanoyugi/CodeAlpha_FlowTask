# Frontend Architecture & Implementation Logbook (TaskFlow)

> Scope: This document explains the **logical implementation** in `frontend/src`—how the UI flows work, how state management is organized, how network calls are made, and how real-time updates integrate. It also calls out **missing, incomplete, or risky parts** that should be implemented in a production-grade frontend.

---

## 1) High-level system overview

### 1.1 Runtime model

- **SPA**: React + React Router.
- **State**:
  - Redux Toolkit slices for auth/workspace/task/etc.
  - TanStack React Query for API/query orchestration (partially used).
- **Data fetching**: custom Axios client (`frontend/src/lib/axios.ts`) behind per-domain services (e.g., `services/auth.service.ts`).
- **Real-time**: Socket.IO client wrapper (`frontend/src/lib/socket.ts`) + a hook (`frontend/src/hooks/useSocket.ts`).

### 1.2 Entry points

- `frontend/src/main.tsx`
  - Creates React root.
  - Wraps with `Provider` (Redux) and `QueryClientProvider`.
  - Mounts `<App />`.

- `frontend/src/App.tsx`
  - Syncs the access token from Redux to Axios via `setAccessTokenGetter`.
  - If an `accessToken` exists but `isAuthenticated` is false, it dispatches `getCurrentUser()`.
  - Wraps routes with `BrowserRouter` and `AppRoutes`.

---

## 2) Routing & authorization flow

### 2.1 Route structure

- `frontend/src/routes/AppRoutes.tsx`
  - Public:
    - `/` -> `HomePage`
    - Auth pages under `AuthLayout` (login/register/forgot/verify)
  - Protected:
    - All app routes are wrapped in `<ProtectedRoute><MainLayout/></ProtectedRoute>`.
  - Role guards:
    - Some routes use `<RoleGuard allow=[...]>` to restrict visibility.

### 2.2 Authentication guard

- `frontend/src/routes/ProtectedRoute.tsx`
  - Reads `isAuthenticated` and `isLoading` from `auth` slice.
  - If loading: shows spinner.
  - If not authenticated: redirects to `/login`.

### 2.3 Role guard

- `frontend/src/routes/RoleGuard.tsx`
  - Reads `currentRole` from `workspace` slice.
  - If loading: spinner.
  - If role not loaded yet: spinner (prevents flicker).
  - If role not allowed: shows an `EmptyState` with a lock icon.

**Risk / gap**
- `RoleGuard` depends on `workspace.currentRole` being loaded correctly. If the user refreshes on a deep link and `currentRole` is not yet set, the guard will show loading spinner (safe) but can lead to a slow UX. A fallback derivation could be added.

---

## 3) Networking layer

### 3.1 Axios configuration

- `frontend/src/lib/axios.ts`
  - Creates an Axios instance with:
    - `baseURL = import.meta.env.VITE_API_URL`
    - `withCredentials: true`
    - JSON content type
  - Request interceptor:
    - Injects `Authorization: Bearer <token>` if not already set, using a runtime getter `getAccessToken`.
  - Response interceptor:
    - On `401` (and not already retried), it calls `POST /api/v1/auth/refresh-token`.
    - Stores user via `storeUser(...)` if present.
    - Retries original request with the new access token.
    - On refresh failure: clears auth data and redirects to `/login`.

**Risk / gap**
- `axios.refresh-token` response handling assumes `{ accessToken, user }` exists in `response.data.data`.
- If backend changes payload shape, this breaks.
- No concurrency lock: multiple simultaneous 401s can trigger multiple refresh calls.

### 3.2 Token getter wiring

- `frontend/src/App.tsx` calls `setAccessTokenGetter(getAccessToken)`.
- `getAccessToken` is a memoized function returning `accessToken` from Redux.

---

## 4) State management (Redux slices)

### 4.1 Store setup

- `frontend/src/store/store.ts`
  - Uses `configureStore` + `rootReducer`.
  - Disables serializable checks.

### 4.2 Auth slice

- `frontend/src/store/slices/authSlice.ts`
  - Initial state loads stored user and sets `isAuthenticated` accordingly.
  - Async thunks:
    - `login`, `register`
    - `logout`
    - `getCurrentUser`
  - On login/register:
    - stores userId via `storeUser`.
    - sets `accessToken` into Redux.

**Risk / gap**
- Initial state sets `isLoading: storedAuth`, but does not automatically load `getCurrentUser()`—that happens in `App.tsx` only when `accessToken && !isAuthenticated`.
- If accessToken is never persisted, refresh logic relies on cookie refresh (good), but the app still might not set `accessToken` until refresh occurs.

### 4.3 Workspace slice

- `frontend/src/store/slices/workspaceSlice.ts`
  - Holds:
    - `workspaces`, `currentWorkspace`, `currentRole`
    - `members`
  - Thunks:
    - fetch workspaces
    - fetch workspace by id
    - create/update/delete workspace
    - fetch workspace members
    - update member role
    - remove member
  - `fetchWorkspaceMembers.fulfilled` computes `currentRole` by matching stored `userId`.

**Bug found**
- `updateMemberRole` reducer line appears malformed:
  - `const index = state.members.findIndex((m) => m.id === action.payload.id);` is followed by extra `)` in the file.
  - This would break compilation unless the actual file differs from what is shown.

---

## 5) UI pages and dashboard workflow

### 5.1 Dashboard page orchestration

- `frontend/src/pages/dashboard/DashboardPage.tsx`
  - Determines an `effectiveRole` based on:
    - `currentWorkspace.role ?? member.role ?? Role.MEMBER`
    - if memberRole is ADMIN and user is workspace owner -> upgrades to OWNER.
  - useEffects:
    1. If authenticated but no user in Redux, dispatch `getCurrentUser()`.
    2. After auth is established, fetch `fetchWorkspaces()`.
    3. When workspace/projects/boards are available:
       - picks `currentWorkspace || workspaces[0]`
       - fetches members for that workspace
       - fetches activities (project or workspace)
       - fetches columns + tasks for the first board

**Risk / gap**
- This dashboard bootstrap selects `projects[0]` and `boards[0]` instead of using URL state.
- It may show incorrect data when navigating between workspaces/projects.

---

## 6) Task & board UI state

### 6.1 Task slice

- `frontend/src/store/slices/taskSlice.ts`
  - Holds:
    - `tasks[]` (flattened)
    - `currentTask`
  - Thunks:
    - fetch tasks for a board
    - fetch task by id
    - create/update/move/delete
    - reorder tasks
  - Reducers update state by locating tasks by `id`.
  - Reorder reducer logic:
    - Takes `columnId` and `taskIds`.
    - Builds `reorderedTasks` with `position: (index + 1) * 100`.

**Risk / gap**
- Reorder reducer uses the order sent from backend thunk response, but backend response shape must match.
- No optimistic UI + no socket reconciliation described.

---

## 7) Real-time (Socket.IO) integration (client)

### 7.1 Socket service

- `frontend/src/lib/socket.ts`
  - Wraps Socket.IO client.
  - `connect(token)`:
    - uses env `VITE_SOCKET_URL`
    - passes auth token in `auth: { token }`
    - forces `transports: ['websocket']`
    - reconnection enabled
  - exposes:
    - `emit`, `on`, `off`

### 7.2 Socket hook

- `frontend/src/hooks/useSocket.ts`
  - Returns socket instance and `isConnected`.

**Risk / gap**
- The hook never calls `socketService.connect(token)`.
  - If components don’t explicitly connect, realtime never starts.
- No centralized event subscription/unsubscription strategy in React lifecycles is visible.

---

## 8) Services layer (per-domain APIs)

- `frontend/src/services/*.service.ts` use the Axios client.
- Example: `frontend/src/services/auth.service.ts`
  - `login`, `register`, `logout`, `getMe`, `forgotPassword`, `resetPassword`, `verifyEmail`.

**Risk / gap**
- Services should reflect backend route shapes precisely.
- `api.post('/auth/refresh-token', ...)` expects backend `POST /api/v1/auth/refresh-token` and consistent payload.

---

## 9) Missing / incomplete / risky items that should be implemented

### 9.1 Realtime workflow missing
- There is socket client infrastructure but no clear orchestration:
  - Where do components call `socketService.connect(accessToken)`?
  - Where do they subscribe to events like `task:created` / `comment:added`?
  - Where do they unsubscribe on logout/unmount?

### 9.2 Redux-React Query duplication risk
- The project includes TanStack Query providers but the examined slices use Axios+Redux thunks.
- If both are used without a clear boundary, you get inconsistent caching and state drift.

### 9.3 Concurrency issues in refresh-token flow
- Axios interceptor can trigger multiple refresh calls in parallel.
- Add an in-flight promise lock / queue.

### 9.4 Bootstrap logic based on array[0]
- `DashboardPage` uses `projects[0]` and `boards[0]` rather than the user’s selected context.
- Add routing-driven selection (URL params) and persist last-used workspace/project/board.

### 9.5 Potential bug in `workspaceSlice`
- The `updateMemberRole` reducer seems syntactically broken due to an extra parenthesis.

### 9.6 Error handling UX consistency
- Slices mostly store string messages.
- UI components should map backend error formats (`AppError` messages) to consistent UI/translation.

---

## Appendix A: What to do next (engineering checklist)

1. Add a `SocketProvider` or `useSocketManager` that:
   - connects once on auth success
   - registers event listeners once
   - cleans up listeners on disconnect/logout
   - dispatches Redux actions or React Query invalidations on socket events.
2. Implement refresh-token deduplication (single-flight).
3. Fix/verify `workspaceSlice` reducer syntax.
4. Update dashboard bootstrap to be URL/state-driven.
5. Decide and document caching strategy between Redux and React Query.



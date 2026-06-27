# Backend Architecture & Implementation Logbook (TaskFlow)

> Scope: This document explains the **logical implementation** present in `backend/src` (and how it connects to infra like Prisma, auth, sockets, cron jobs, and permissions). It also calls out **missing / inconsistent / risky parts** that should exist in a production-grade backend.

---

## 1) High-level system overview

### 1.1 Runtime model

- **HTTP API**: Express app mounts route modules under `/api/v1`.
- **Database**: Prisma (singleton client) is used for all persistence.
- **Auth**:
  - Access token: used for HTTP authorization (`Authorization: Bearer <token>`).
  - Refresh token: stored server-side and also placed in an `httpOnly` cookie.
- **Real-time**: Socket.IO provides updates for:
  - task lifecycle events (created/updated/moved/deleted)
  - comment lifecycle events (added/updated/deleted)
  - typing indicators
  - presence and user online/offline notifications
- **Background jobs**: `node-cron` schedules:
  - due-date checks (hourly)
  - invite cleanup (daily)

### 1.2 Entry points

- `backend/src/app.ts`
  - Global middleware: cookies, CORS, JSON parsing, rate limiter, request logging.
  - `/health` endpoints.
  - mounts `backend/src/routes/v1.ts`.
  - final `errorHandler`.

- `backend/src/server.ts`
  - loads validated environment (`env`).
  - connects Prisma.
  - starts HTTP server.
  - initializes Socket.IO.

- `backend/src/routes/v1.ts`
  - mounts module routers using nested workspace/project/board/column/task resources.

---

## 2) Cross-cutting concerns (infra)

### 2.1 Environment validation

File: `backend/src/config/env.ts`
- Uses `zod` to validate required values.
- JWT secrets and TTLs are read from env.
- Rate limit config is provided.

**Risk / gap**
- `envSchema` requires `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`.
- Optional Cloudinary + SMTP env variables exist but are not enforced.

### 2.2 Database lifecycle

File: `backend/src/config/database.ts`
- Exposes `connectDatabase()` and `disconnectDatabase()`.
- Uses Prisma singleton from `backend/src/lib/prisma.ts`.

File: `backend/src/lib/prisma.ts`
- Standard Next-style singleton pattern via `globalThis`.

### 2.3 Logging

File: `backend/src/lib/logger.ts`
- Provides logger abstraction used by HTTP middleware and Socket.IO setup.

**Gap (to verify manually)**
- The code we inspected doesn’t show structured logging schemas; the error handler logs an object, so logger should accept objects.

### 2.4 Error model

File: `backend/src/utils/error.ts`
- Central `AppError` base class with:
  - `statusCode`
  - `isOperational`
  - optional `details`

Derived errors:
- `BadRequestError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ValidationError`, `TooManyRequestsError`, `InternalServerError`.

File: `backend/src/middleware/error.middleware.ts`
- Logs error context.
- Handles:
  - `AppError`
  - Prisma known request errors:
    - `P2002` (unique constraint)
    - `P2025` (record not found)
    - `P2003` (FK/related record issue)
  - JWT errors by `err.name`.

**Risk / gap**
- `req.user?.id` is logged, but `auth.middleware.ts` attaches `req.user = { userId, email }`.
  - So `req.user.id` may be undefined unless Express type augmentation differs.

---

## 3) HTTP request pipeline

### 3.1 Express app middleware

File: `backend/src/app.ts`
- `cookieParser()`
- `corsMiddleware` from `backend/src/middleware/cors.ts`
- `express.json()` + `express.urlencoded()`
- `limiter` from `backend/src/middleware/rate-limiter.ts`
- HTTP request logging middleware: `logger.http(`${req.method} ${req.url}`)`
- mounts `v1Routes`
- then `errorHandler`

### 3.2 Auth middleware

File: `backend/src/middleware/auth.middleware.ts`
- Expects `Authorization: Bearer <token>`.
- Uses `verifyAccessToken(token)`.
- On success: `req.user = { userId, email }`.
- On failure: `UnauthorizedError`.

**Gap**
- No explicit role/workspace membership checks here; those are done inside services/permissions.

### 3.3 Validation middleware

File: `backend/src/middleware/validation.middleware.ts`
- Intended to enforce schema validation.

**Gap to verify**
- We did not inspect its exact behavior; `schema` usage depends on each route wiring.

### 3.4 Workspace scoping middleware

File: `backend/src/middleware/workspace.middleware.ts`
- Intended for workspace membership/role context.

**Gap**
- We did not inspect its integration in the routes; services often call `assertProjectAccess` or `workspaceRepository.isMember` directly.

### 3.5 Upload middleware

File: `backend/src/middleware/upload.middleware.ts`
- Intended for attachment uploads.

**Gap**
- Not inspected.

---

## 4) Routing topology

File: `backend/src/routes/v1.ts`

Mounted endpoints:
- `/api/v1/auth` -> auth routes
- `/api/v1/workspaces` -> workspace routes
- `/api/v1/workspaces/:workspaceId/projects` -> project routes
- `/api/v1/workspaces/:workspaceId/projects/:projectId/boards` -> board routes
- `/api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns` -> column routes
- `/api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks` -> task routes
- `/api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments` -> comment routes
- `/api/v1/workspaces/:workspaceId/activities` -> activity routes
- `/api/v1/workspaces/:workspaceId/search` -> search routes
- `/api/v1/notifications` -> notifications routes
- `/api/v1/` -> invite routes

---

## 5) Domain permissions & authorization model

Files:
- `backend/src/permissions/*.permissions.ts`
- `backend/src/permissions/project-access.permissions.ts`
- `backend/src/constants/roles.ts`

### 5.1 Observed permission enforcement pattern

Across services (Workspace/Project/Board/Column/Task), enforcement follows a consistent pattern:
1. Resolve parent object access (workspace/project/board).
2. Compute requestor role (from membership / owner).
3. Call permission helper (e.g., `WorkspacePermissions.canUpdateWorkspace(...)`).
4. If forbidden, throw `ForbiddenError`.

Examples we inspected:
- `WorkspaceService.updateWorkspace(...)`:
  - checks `WorkspacePermissions.canUpdateWorkspace(userRole, userId, workspace.ownerId)`
- `ProjectService.createProject(...)`:
  - checks `ProjectPermissions.canManageProject(workspaceAccess.role, userId, workspaceAccess.ownerId)`
- `TaskService.updateTask(...)`:
  - checks `TaskPermissions.canUpdateTask(workspaceAccess.role, task.reporterId, task.assigneeId, userId)`

### 5.2 Gap / risk

- Some services compute access using repositories directly (`workspaceRepository.isMember`), others use `assertProjectAccess`.
- This inconsistency can lead to subtle authorization discrepancies.

---

## 6) Auth implementation

### 6.1 Controller responsibilities

File: `backend/src/modules/auth/auth.controller.ts`
- `register`: creates refreshToken cookie + returns access token + user
- `login`: same flow
- `refreshToken`: reads refresh cookie -> returns new access token -> rotates refresh cookie
- `logout`: revokes refresh token
- `logoutAll`: revokes all refresh tokens for a user
- `getMe`: returns userId from middleware context

Refresh cookie options:
- `httpOnly: true`
- `sameSite: 'strict'`
- `maxAge` = 7 days
- `path` tied to refresh endpoint

### 6.2 Service logic

File: `backend/src/modules/auth/auth.service.ts`

#### register
1. `AuthRepository.findUserByEmail`
2. If exists -> `ConflictError`
3. hash password (`hashPassword` from `src/utils/bcrypt.ts`)
4. create user record
5. generate:
   - access token
   - refresh token
6. store refresh token + expiry (`saveRefreshToken`)
7. return user DTO + tokens

#### login
1. find user by email
2. compare password
3. generate access + refresh tokens
4. store refresh token

#### refreshToken
1. verify refresh token (`verifyRefreshToken`)
2. fetch stored refresh token by token string
3. ensure token exists and not revoked
4. ensure `expiresAt` is not passed
5. revoke old refresh token
6. issue new access+refresh tokens and store new refresh token

#### logout / logoutAll
- revoke refresh token(s)

### 6.3 Repository behavior

File: `backend/src/modules/auth/auth.repository.ts`
- Expected to include:
  - user lookup by email
  - user create
  - refresh token store/revoke

**Gap to verify**
- We did not inspect `auth.repository.ts`, so repository correctness (revocation flags, uniqueness constraints) wasn’t fully validated.

---

## 7) Workspaces, Projects, Boards, Columns, Tasks

This is the core product domain. The backend is layered as:
- Controller: HTTP I/O mapping
- Service: permission checks + orchestration
- Repository: Prisma persistence

### 7.1 Workspaces

Files:
- `workspace.controller.ts`, `workspace.service.ts`, `workspace.repository.ts`
- `workspace.permissions.ts`

#### createWorkspace
`WorkspaceService.createWorkspace(userId, data)`
1. generate unique slug via `slugify` + collision loop using `workspaceRepository.findBySlug`.
2. create workspace with:
   - name, slug, description, logo
   - `ownerId = userId`
3. add owner as an ADMIN member:
   - `workspaceRepository.addMember({ workspaceId, userId, role: Role.ADMIN })`

#### getWorkspaceById
1. verify requester is workspace member:
   - `workspaceRepository.isMember`
2. fetch workspace by id

#### updateWorkspace
1. fetch workspace
2. permission check:
   - `WorkspacePermissions.canUpdateWorkspace(userRole, userId, workspace.ownerId)`
3. if name changes: slug recomputed and uniqueness preserved.
4. update

#### deleteWorkspace
- only owner allowed:
  - fetch `ownerId`
  - `WorkspacePermissions.canDeleteWorkspace(userId, ownerId)`
- calls repository delete

#### transferOwnership
- only owner allowed
- validates target member exists
- updates workspace ownerId
- updates member roles:
  - old owner -> ADMIN
  - new owner -> ADMIN

#### addMember / removeMember / updateMemberRole
- addMember currently contains a “simplified” direct add path.

**Critical missing implementation**
- `WorkspaceService.addMember(...)` contains explicit comment:
  - “This will be implemented with invites in Step 5. For now, we'll add directly (simplified)”

So invite flow is not fully enforced for membership.

### 7.2 Projects

Files:
- `project.controller.ts`, `project.service.ts`, `project.repository.ts`
- `project.permissions.ts`
- `project-access.permissions.ts`

#### access resolution
`ProjectService` uses two approaches:
- `checkWorkspaceAccess`: queries Prisma `workspaceMember` + workspace `ownerId`.
- `assertProjectAccess(projectId, userId)`: used in many methods.

#### createProject
- check workspace access role
- call `ProjectPermissions.canManageProject(...)`
- repository create

#### getProjectById
- fetch project
- validate access via `assertProjectAccess`

#### getWorkspaceProjects
- workspace membership check
- fetch all projects in workspace
- then tries to restrict projects where the user is not a project member:
  - it collects project IDs from `projectMember.groupBy`
  - then iterates restricted IDs and calls `assertProjectAccess` per project ID

**Risk / gap**
- This can produce N calls to `assertProjectAccess` and become slow for large workspaces.
- Could be replaced with one query / more efficient access logic.

#### updateProject
- permission check via `ProjectPermissions.canManageProject(...)`

#### deleteProject
- supports soft delete vs hard delete using repository methods.

#### addProjectMember
- validates target user is a workspace member first.
- then checks project repository membership.

#### removeProjectMember
- permission check via project manager policy.

### 7.3 Boards

Files:
- `board.controller.ts`, `board.service.ts`, `board.repository.ts`
- `board.permissions.ts`

BoardService follows:
- check project access using `assertProjectAccess(projectId, userId)`.
- enforce `BoardPermissions.canManageBoard(...)`.
- create/update/delete with soft/hard delete support.

### 7.4 Columns

Files:
- `column.controller.ts`, `column.service.ts`, `column.repository.ts`
- `column.permissions.ts`

ColumnService:
- resolves board.projectId via prisma `board.findUnique({ select: { projectId } })`
- uses `assertProjectAccess(projectId, userId)`
- computes max `position` when creating column.
- supports reorder (`reorderColumns`) via repository.

### 7.5 Tasks

Files:
- `task.controller.ts`, `task.service.ts`, `task.repository.ts`
- `task.permissions.ts`

TaskService contains the most complex workflow logic.

#### createTask
1. check board access -> workspace role/ownerId via `assertProjectAccess`.
2. enforce `TaskPermissions.canCreateTask(workspaceRole)`.
3. ensure column exists.
4. calculate `position = column max position`.
5. call repository create with:
   - title/description/priority/dueDate
   - reporterId = userId
   - assigneeId = data.assigneeId
   - position

#### updateTask
- fetch task
- permission check depends on reporter/assignee role and userId.

#### moveTask
Algorithm overview:
1. fetch task
2. permission check via `TaskPermissions.canMoveTask(...)`
3. validate target column exists and belongs to the same board.
4. fetch tasks in target column
5. compute newPosition based on provided `data.position` and list length.
6. If insertion is within bounds:
   - shifts subsequent tasks by updating their positions in a loop (manual sequential await calls)
7. updates moving task position and column.

**Risk / gap**
- The shifting algorithm is not transactional.
  - If concurrent moves happen, ordering can break.
- Sequential awaits inside a for-loop can be slow.
- Many reorder systems use atomic SQL update with a transaction.

#### deleteTask
- fetch task
- permission check via `TaskPermissions.canDeleteTask(...)`
- supports soft delete vs hard delete

#### getUserTasks
- uses repository method `findAllByAssignee(userId)`

#### reorderTasks
- permission check via `TaskPermissions.canReorderTasks(role, tasks, userId)`
- calls repository `reorderTasks(columnId, taskIds)`

---

## 8) Search

Files:
- `search.routes.ts`, `search.controller.ts`, `search.service.ts`

### 8.1 Global search
`SearchService.searchGlobal(workspaceId, query, userId)`

Flow:
1. verify user is workspace member
   - uses `workspaceMember.findUnique`.
   - if missing -> throws `Error('Access denied')` (not AppError)
2. determine accessible project IDs by:
   - getting restricted project IDs from `projectMember`
   - for each restricted project ID, calling `assertProjectAccess`
3. query tasks:
   - tasks where board.project.workspaceId matches
   - if accessibleProjectIds length > 0, apply IN filter
   - title/description contains query (case insensitive)
4. query projects similarly (name/description contains)
5. query comments on accessible tasks
6. query workspace members filtered by user firstName/lastName/email contains

### 8.2 Filtered search tasks
`searchTasks(workspaceId, filters, userId)`
- builds `where` object:
  - workspaceId scoping + deletedAt null
  - applies query/assigneeId/priority/dueDateFrom-dueDateTo
- includes relations and labels, counts.

**Risk / gap**
- `throw new Error('Access denied')` will hit default error branch and may leak message based on env.
- missing pagination: tasks/projects/comments/users are hard `take` limited, not cursor-based.

---

## 9) Real-time (Socket.IO)

### 9.1 Socket initialization
File: `backend/src/config/socket.ts`
- creates a Socket.IO server.
- applies auth middleware:
  - reads `socket.handshake.auth.token`
  - verifies access token
  - sets `socket.data.userId` + `socket.data.email`

- On connection:
  - maintains a `connectedUsers` Map
  - supports join/leave rooms:
    - `workspace:<workspaceId>`
    - `board:<boardId>`
    - `task:<taskId>`
  - emits:
    - typing start/stop
    - task created/updated/moved/deleted
    - comment added/updated/deleted
    - notification read broadcast
    - presence list
    - offline on disconnect if workspaceId was joined

Also exports `emitToWorkspace`, `emitToBoard`, `emitToTask`, `emitToUser`.

### 9.2 Duplicate socket implementation
Files:
- `backend/src/sockets/index.ts`, `backend/src/sockets/connection.ts`
- `backend/src/sockets/handlers/*`

We inspected:
- `backend/src/sockets/connection.ts` sets up `registerTaskHandlers`, `registerCommentHandlers`, `registerTypingHandlers`, `registerPresenceHandlers`.
- `backend/src/sockets/handlers/task.handler.ts` directly manipulates Prisma and emits.

**Critical inconsistency / gap**
- There are two parallel socket implementations:
  1) `src/config/socket.ts` includes many event listeners inline.
  2) `src/sockets/*` registers other handlers that also interact with Prisma.

This can cause:
- double event registration
- inconsistent authorization (one path does prisma writes without permission checks)
- different event names (`task:create` vs `task:created`, etc.)

**Actionable missing requirement**
- unify socket event handling into one system.
- all socket mutations must enforce authorization with the same permission helpers as REST.

---

## 10) Cron jobs

Files:
- `backend/src/jobs/index.ts`
- `backend/src/jobs/due-date.job.ts`
- `backend/src/jobs/reminder.job.ts`
- `backend/src/jobs/invite-cleanup.job.ts`

### 10.1 due-date.job (hourly)
`checkDueDates()`:
- Finds tasks due tomorrow with assigneeId not null.
- For each, calls `NotificationService.notifyDueDateApproaching(...)`.

- Finds overdue tasks (dueDate < today start) and creates notifications via `NotificationService.createNotification(...)`.

**Risk / gap**
- No deduplication logic visible:
  - if job runs hourly, it may create repeated notifications unless `NotificationService` checks existing notifications.
  - not verified because NotificationService wasn’t inspected here.

### 10.2 invite-cleanup.job (daily)
- deletes invites where `expiresAt < now` and `acceptedAt` is null.

### 10.3 reminder.job
- Not inspected in full.

---

## 11) Invitations, Notifications, Activities, Attachments, Labels, Mailer, Templates

> Due to time/inspection limits in this run, these were not fully expanded line-by-line here.
> However, the architecture patterns are clear and should be documented once those files are thoroughly reviewed.

Documented evidence exists from routes and modules:
- `modules/invites/*` + `templates/invite-email.ts` + `jobs/invite-cleanup.job.ts`
- `modules/notifications/*` + `templates/task-assigned.ts`
- `modules/activities/*` (activity feed)
- `modules/attachments/*` + `middleware/upload.middleware.ts` + `lib/cloudinary.ts`
- `modules/labels/*`
- `modules/mailer/email.service.ts`

### Known gap from observed code
- `WorkspaceService.addMember(...)` bypasses invites temporarily.

---

## 12) Comprehensive list of “should have been implemented / missing” (based on code we saw)

### 12.1 Security & authorization gaps
1. **Socket authorization parity is missing**
   - Socket handlers directly call Prisma writes in `src/sockets/handlers/task.handler.ts` and `comment.handler.ts` without permission verification.
   - REST services enforce permissions; sockets should do the same.

2. **Duplicate socket implementations**
   - `src/config/socket.ts` and `src/sockets/*` both register socket logic.
   - Unify event model.

3. **Improper error types in several places**
   - `SearchService` throws `new Error('Access denied')` instead of `ForbiddenError`.

### 12.2 Data consistency gaps
4. **Task move ordering not transactional**
   - `TaskService.moveTask` shifts positions with sequential updates and no transaction.
   - concurrent moves will corrupt ordering.

5. **Notification deduplication not validated**
   - Cron runs hourly; notifications may repeat.

### 12.3 Feature completeness gaps
6. **Invite-based workspace membership is not complete**
   - `WorkspaceService.addMember` contains an explicit “for now, simplified direct add” comment.

7. **Potential performance inefficiencies**
   - `getWorkspaceProjects` calls `assertProjectAccess` in a loop per restricted project.

### 12.4 Architectural consistency gaps
8. **Mixed approaches to authorization resolution**
   - some services use repository membership checks directly
   - others use `assertProjectAccess`

---

## 13) Recommended next steps (engineering actions)

1. **Unify Socket.IO implementation**
   - remove one of: `src/config/socket.ts` inline handlers OR `src/sockets/*` handler system.

2. **Enforce permissions in sockets**
   - create a shared authorization helper for each realtime mutation:
     - task create/update/move/delete
     - comment create/edit/delete

3. **Make task ordering updates transactional**
   - use Prisma transaction `$transaction`.
   - consider optimized reordering approach (bulk updates).

4. **Implement invite flow end-to-end**
   - make workspace member additions require invites.

5. **Convert plain `Error()` to `AppError` variants**
   - for consistent error response formats.

6. **Audit jobs for deduplication**
   - ensure due-date notifications aren’t duplicated across runs.

---

## Appendix A: Observed event naming (socket)

From `src/config/socket.ts`:
- `task:created`, `task:updated`, `task:moved`, `task:deleted`
- `comment:added`, `comment:updated`, `comment:deleted`

From `src/sockets/handlers/task.handler.ts`:
- `task:create:success`, `task:created` emitted on success
- `task:move:success`
- `task:update:success`

From `src/sockets/handlers/comment.handler.ts`:
- `comment:add:success`, `comment:edit:success`, `comment:delete:success`

**Risk**: inconsistent event naming makes client integration fragile.

---

## Appendix B: What is not fully expanded in this run

To produce truly “step-by-step, full backend documentation”, the following files require deeper inspection:
- `modules/users/*` (we observed empty controller/service reads for user)
- `modules/comments/*` controllers/services/repositories
- `modules/notifications/*`
- `modules/invites/*`
- `modules/activities/*`
- `modules/attachments/*`
- `modules/labels/*`
- `modules/mailer/*` and `templates/*`
- `jobs/reminder.job.ts`
- `middleware/*` not inspected line-by-line (cors, rate-limiter, upload, workspace middleware, typing/presence/notification handlers)

This file already captures major logic and the most critical correctness risks.


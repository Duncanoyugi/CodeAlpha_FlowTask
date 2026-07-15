# TODO_PHASE_3 — Admin & Member Dashboard Split + Real Metrics (Option C)

## Phase 3.0 — Requirements alignment
- [ ] Ensure DashboardPage entry selection uses exactly two entry components: `AdminDashboard` and `MemberDashboard`.
- [ ] Ensure `effectiveRole` mapping:
  - [ ] OWNER/ADMIN => AdminDashboard
  - [ ] MEMBER => MemberDashboard
  - [ ] VIEWER => block from /dashboard (per decision)

## Phase 3.1 — Backend dashboard correctness (real metrics)
- [ ] Update `backend/src/modules/dashboard/dashboard.service.ts`:
  - [ ] Admin: compute `completionRate`, `completedTasks`, `progress` per project, and any completion/weekday charts using `Task.completedAt` (written by TaskLifecycleService).
  - [ ] Admin: compute deltas (vs last month) for total projects and completion rate.
  - [ ] Member: compute assigned tasks `completed` and `pending` using `Task.completedAt` and status.
  - [ ] Member: compute recently-completed and tasks completed per weekday (if required by UI spec).
- [ ] Verify the dashboard module meets performance requirements:
  - [ ] No per-task extra network/database calls for list widgets.
  - [ ] Use aggregate/groupBy/joins/bulk includes.
  - [ ] Avoid N+1 patterns.
- [ ] Add/confirm DB indexes needed for new aggregates.

## Phase 3.2 — Activities scoping semantics
- [ ] Confirm “Recent Activity involving current user” semantics for Member dashboard.
  - [ ] If implemented via actor (`Activity.userId`), verify it matches the product decision.
  - [ ] If not, implement proper filter/join in dashboard module.

## Phase 3.3 — Frontend: data fetching foundation
- [ ] Replace/retire old Redux bootstrap reliance on `projects[0]`, `boards[0]` for dashboard rendering.
- [ ] Ensure Admin dashboard uses `useAdminDashboard(workspaceId)`.
- [ ] Ensure Member dashboard uses `useMemberDashboard()`.

## Phase 3.4 — Frontend: rebuild dashboard UIs
- [ ] Rebuild AdminDashboard UI to match target widget structure using backend data.
  - [ ] Header with Export Report + New Project (gated by `usePermissions`).
  - [ ] Total Projects (count + month delta)
  - [ ] Active Tasks (status != DONE and not soft-deleted; plus week delta)
  - [ ] Team Members (workspaceMember count + pending invites)
  - [ ] Completion Rate (% + last-month delta)
  - [ ] Projects Overview grid with per-project progress and done/total tasks
  - [ ] Recent Activity widget from dashboard response
  - [ ] Priority Distribution from grouped task aggregates
  - [ ] Project Progress list and Quick Stats
  - [ ] Recent Tasks list using a single joined query response from backend (no N+1)
- [ ] Rebuild MemberDashboard UI to match target widget structure using backend data.
  - [ ] Header with Create Task (gated by `usePermissions`).
  - [ ] My Tasks / In Progress / Due Soon
  - [ ] Completion Rate (% + last-week delta)
  - [ ] Urgent banner
  - [ ] My Active Tasks list
  - [ ] Recent Activity (scoped)
  - [ ] My Task Status grouped by status
  - [ ] Tasks completed per weekday (if required)
  - [ ] Recently Completed list
  - [ ] My Progress (streak/on-time/weekly goal) — only implement if supported by backend schema; otherwise omit/flag unavailable per metricAvailability.

## Phase 3.5 — Orchestrator + routing hardening
- [ ] Update `frontend/src/pages/dashboard/DashboardPage.tsx`:
  - [ ] Remove any `ViewerDashboard` usage.
  - [ ] Block VIEWER from reaching /dashboard (redirect or forbidden UI per existing route conventions).

## Phase 3.6 — Tests
- [ ] Component tests validating workspace-scoped vs user-scoped metric correctness.
- [ ] Regression tests ensuring no “boards[0]/projects[0] scope” bugs remain.
- [ ] Query-count / N+1 prevention tests for dashboard data endpoints.

## Done criteria
- [ ] Exactly two dashboard entry components selected by role.
- [ ] Viewer blocked from /dashboard.
- [ ] All required dashboard metrics are real (no placeholder/approx).
- [ ] Dashboard queries are efficient and correctly scoped.


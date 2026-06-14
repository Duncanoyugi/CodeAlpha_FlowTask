# TaskFlow Frontend

A React SPA for project management with Kanban boards, real-time collaboration, and workspace management.

## Tech Stack

- **Framework**: React 19.x with Vite 8.x
- **Language**: TypeScript
- **State Management**: Redux Toolkit (with async thunks)
- **Data Fetching**: TanStack React Query
- **Routing**: React Router DOM 7.x
- **UI**: Tailwind CSS 4.x
- **Drag & Drop**: @dnd-kit/core
- **Real-time**: Socket.IO Client 4.x
- **Forms**: React Hook Form with Zod resolvers
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Charts**: Recharts

## Project Structure

```
frontend/
├── src/
│   ├── main.tsx                      # App entry point
│   ├── App.tsx                       # Root component with router
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Sidebar.tsx           # Navigation sidebar
│   │   │   └── Header.tsx            # Top header
│   │   ├── ui/                       # Reusable UI components
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── Toast.tsx
│   │   │   ├── Badge.tsx
│   │   │   ├── Avatar.tsx
│   │   │   ├── Spinner.tsx
│   │   │   └── Dropdown.tsx
│   │   ├── board/
│   │   │   ├── KanbanBoard.tsx       # Main kanban board with dnd-kit
│   │   │   ├── Column.tsx            # Single column component
│   │   │   └── TaskCard.tsx          # Task card in column
│   │   ├── task/
│   │   │   ├── CreateTaskModal.tsx
│   │   │   ├── EditTaskModal.tsx
│   │   │   └── TaskDetailModal.tsx
│   │   ├── column/
│   │   │   └── CreateColumnModal.tsx
│   │   ├── comment/
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   └── CommentForm.tsx
│   │   ├── notification/
│   │   │   ├── NotificationBell.tsx
│   │   │   └── NotificationList.tsx
│   │   ├── activity/
│   │   │   └── ActivityLog.tsx
│   │   └── workspace/
│   │       ├── WorkspaceCard.tsx
│   │       └── CreateWorkspaceModal.tsx
│   ├── pages/
│   │   ├── auth/
│   │   │   ├── LoginPage.tsx
│   │   │   ├── RegisterPage.tsx
│   │   │   ├── ForgotPasswordPage.tsx
│   │   │   └── VerifyOTP.tsx
│   │   ├── dashboard/
│   │   │   └── DashboardPage.tsx
│   │   ├── workspace/
│   │   │   ├── WorkspacesPage.tsx
│   │   │   └── WorkspacesDetailPage.tsx
│   │   ├── project/
│   │   │   ├── ProjectPage.tsx
│   │   │   └── ProjectDetailPage.tsx
│   │   ├── board/
│   │   │   └── BoardPage.tsx
│   │   ├── search/
│   │   │   └── SearchPage.tsx
│   │   ├── settings/
│   │   │   └── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── layouts/
│   │   ├── MainLayout.tsx            # Main app layout with sidebar
│   │   ├── AuthLayout.tsx            # Auth pages layout
│   │   └── DashboardLayout.tsx       # Dashboard variant
│   ├── routes/
│   │   ├── AppRoutes.tsx             # Route definitions
│   │   ├── ProtectedRoute.tsx        # Auth guard
│   │   └── AdminRoute.tsx          # Admin role guard
│   ├── store/
│   │   ├── store.ts                # Redux store configuration
│   │   ├── hooks.ts                # Typed hooks (useAppDispatch, useAppSelector)
│   │   ├── rootReducer.ts          # Combined reducers
│   │   └── slices/
│   │       ├── authSlice.ts          # Authentication state
│   │       ├── workspaceSlice.ts     # Workspace CRUD actions
│   │       ├── projectSlice.ts       # Project state
│   │       ├── boardSlice.ts         # Board state
│   │       ├── taskSlice.ts          # Task state (drag-drop)
│   │       ├── commentSlice.ts       # Comment state
│   │       ├── activitySlice.ts      # Activity feed state
│   │       ├── notificationSlice.ts  # Notification state
│   │       ├── searchSlice.ts        # Search results state
│   │       └── uiSlice.ts            # UI state (modals, toasts)
│   ├── services/
│   │   ├── api.ts                  # Axios instance (empty - using @lib/axios)
│   │   ├── auth.service.ts         # Auth API calls
│   │   ├── workspace.service.ts    # Workspace API calls
│   │   ├── project.service.ts      # Project API calls
│   │   ├── board.service.ts        # Board API calls
│   │   ├── column.service.ts       # Column API calls
│   │   ├── task.service.ts         # Task API calls
│   │   ├── comment.service.ts      # Comment API calls
│   │   ├── activity.service.ts     # Activity logging
│   │   ├── notification.service.ts # Notifications
│   │   └── search.service.ts       # Search API
│   ├── types/
│   │   ├── index.ts                # Empty barrel export
│   │   ├── auth.types.ts
│   │   ├── user.types.ts
│   │   ├── workspace.types.ts
│   │   ├── project.types.ts
│   │   ├── board.types.ts
│   │   ├── task.types.ts
│   │   ├── comment.types.ts
│   │   ├── activity.types.ts
│   │   ├── notification.types.ts
│   │   ├── search.types.ts
│   │   └── socket.types.ts
│   ├── hooks/
│   │   ├── index.ts                # Barrel export
│   │   ├── useSocket.ts            # Socket hook
│   │   ├── useLocalStorage.ts      # LocalStorage helper
│   │   ├── useDebounce.ts          # Debounce hook
│   │   └── useAuth.ts              # Auth hook
│   ├── lib/
│   │   ├── axios.ts                # Axios with interceptors
│   │   ├── socket.ts               # Socket.IO service
│   │   └── react-query.ts          # React Query client
│   ├── utils/
│   │   ├── index.ts                # Barrel export
│   │   ├── cn.ts                   # Tailwind class merge
│   │   ├── token.ts                  # Token storage helpers
│   │   ├── formatDate.ts           # Date formatting
│   │   └── validators.ts           # Form validation
│   └── constants/
│       ├── index.ts                # Barrel export
│       ├── routes.ts               # Route paths
│       ├── roles.ts                # Role enum
│       └── priorities.ts           # Priority levels
├── package.json
├── vite.config.ts
├── tsconfig.json
└── eslint.config.js
```

## Architecture

### State Management

Redux Toolkit slices handle async operations via `createAsyncThunk`:

**Auth Flow**:
- JWT tokens stored in localStorage via `@utils/token.ts`
- Axios interceptors attach token to requests
- Auto-refresh on 401 responses
- Socket connection established on login

**Entity Slices**:
- Each slice manages CRUD operations for its domain
- Optimistic updates for drag-drop operations
- Async thunks handle API calls and error states

### Socket.IO Integration

`SocketService` class provides:
- Connection with auth token
- Auto-reconnection (5 attempts)
- Event emitters/listeners for real-time updates
- Used by `useSocket()` hook in components

Real-time features:
- Task updates (create, update, move, delete)
- Comment updates
- Typing indicators
- User presence
- Notifications

### Drag & Drop

Kanban board uses `@dnd-kit/core`:
- `KanbanBoard.tsx` - Main board with `DndContext`
- `Column` - Sortable columns
- `TaskCard` - Draggable task cards
- Position calculations maintain gap-based ordering (100, 200, 300...)

### Component Patterns

**Modal Pattern**:
- Controlled by `uiSlice` for global state
- Components receive `isOpen`, `onClose`, `onSubmit` props

**Form Pattern**:
- React Hook Form with Zod validation
- Async submission with error handling
- Toast notifications for feedback

## Pages & Routes

```
/login           → LoginPage
/register        → RegisterPage  
/forgot-password → ForgotPasswordPage
/verify-otp      → VerifyOTPPage

/                → ProtectedRoute → DashboardPage
/dashboard       → ProtectedRoute → DashboardPage
/workspaces      → ProtectedRoute → WorkspacesPage
/workspaces/:id  → ProtectedRoute → WorkspaceDetailPage
/projects        → ProtectedRoute → ProjectPage
/projects/:id    → ProtectedRoute → ProjectDetailPage
/boards/:id      → ProtectedRoute → BoardPage
/settings        → ProtectedRoute → SettingsPage
/search          → ProtectedRoute → SearchPage
/404            → NotFoundPage
/*              → Redirect to /404
```

## State Structure

```typescript
// Auth
{
  user: User | null,
  accessToken: string | null,
  refreshToken: string | null,
  isAuthenticated: boolean,
  isLoading: boolean,
  error: string | null,
}

// Workspace
{
  workspaces: Workspace[],
  currentWorkspace: Workspace | null,
  members: WorkspaceMember[],
  isLoading: boolean,
  error: string | null,
}

// Task
{
  tasks: Task[],
  currentTask: Task | null,
  isLoading: boolean,
  error: string | null,
}
```

## UI Components

**Core UI** (in `components/ui/`):
- `Button` - Primary, secondary, danger variants
- `Input` - Form input with validation states
- `Modal` - Dialog with overlay
- `Badge` - Status/priority indicators
- `Avatar` - User profile images
- `Spinner` - Loading indicator
- `Dropdown` - Select/dropdown menus
- `Toast` - Notification toasts

**Layout**:
- `Sidebar` - Collapsible navigation (20px/64px)
- `MainLayout` - Wrapper with sidebar + header

## Environment Variables

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

## Scripts

```bash
npm run dev        # Start dev server (port 5173)
npm run build      # TypeScript check + Vite build
npm run lint       # ESLint check
npm run preview    # Preview production build
```

## Type Definitions

**Core Types**:
- `Task` - Kanban card with priority, assignee, reporter, due date
- `Workspace` - Container with members, projects
- `Project` - Container with boards, timeline
- `Board` - Container with columns
- `Column` - Task pipeline stage
- `User` - Profile with firstName, lastName, email, avatar

**Priority**: `'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'`

**Role**: `'ADMIN' | 'MEMBER' | 'VIEWER'` (workspace-scoped)

## Hooks

- `useSocket()` - Returns socket instance and connection status
- `useAuth()` - Authentication state and methods
- `useLocalStorage()` - Sync state with localStorage
- `useDebounce()` - Delay callback execution

## Styling

- Tailwind CSS utility classes
- `cn()` utility (tailwind-merge) for class merging
- Responsive design with mobile-first approach
- Color tokens: `primary-600`, `primary-50`, etc.
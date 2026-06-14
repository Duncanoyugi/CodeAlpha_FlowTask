# TaskFlow Backend

A Node.js/Express REST API with Socket.IO for real-time collaboration, supporting project management workflows with workspaces, projects, boards, tasks, and comments.

## Tech Stack

- **Runtime**: Node.js (ES2022)
- **Framework**: Express 5.x
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.IO 4.x
- **Authentication**: JWT (Access + Refresh tokens)
- **Validation**: Zod
- **File Storage**: Cloudinary
- **Email**: Nodemailer with Ethereal (dev) / SMTP (production)
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit

## Project Structure

```
backend/
├── src/
│   ├── app.ts                    # Express app setup
│   ├── server.ts                 # Server entry point
│   ├── config/
│   │   ├── env.ts               # Environment validation (Zod schema)
│   │   ├── database.ts          # Database connection
│   │   ├── socket.ts            # Socket.IO initialization
│   │   ├── cloudinary.ts        # Cloudinary config
│   │   └── rate-limiter.ts      # Rate limiting config
│   ├── lib/
│   │   ├── prisma.ts            # Prisma client singleton
│   │   ├── logger.ts            # Winston logger
│   │   ├── socket.ts            # Socket helper utilities
│   │   └── cloudinary.ts        # Cloudinary instance
│   ├── middleware/
│   │   ├── auth.middleware.ts   # JWT authentication
│   │   ├── workspace.middleware.ts # Workspace access check
│   │   ├── validation.middleware.ts # Zod validation wrapper
│   │   ├── error.middleware.ts  # Global error handler
│   │   ├── cors.ts              # CORS configuration
│   │   └── upload.middleware.ts # Multer file upload
│   ├── modules/
│   │   ├── auth/                # User registration, login, tokens
│   │   ├── workspaces/          # Workspace CRUD, member management
│   │   ├── projects/            # Project CRUD, project members
│   │   ├── boards/              # Board CRUD
│   │   ├── columns/             # Column CRUD, reordering
│   │   ├── tasks/               # Task CRUD, move, assign
│   │   ├── comments/            # Comment CRUD with mentions
│   │   ├── activities/          # Activity logging
│   │   ├── notifications/       # User notifications
│   │   ├── invites/             # Workspace invitations
│   │   ├── search/              # Global and task search
│   │   ├── labels/              # Task labels
│   │   ├── attachments/         # File attachments
│   │   └── mailer/              # Email templates, sending
│   ├── routes/
│   │   ├── index.ts             # Main router
│   │   └── v1.ts                # API v1 routes
│   ├── sockets/
│   │   ├── handlers/            # Event handlers (task, comment, presence, typing, notification)
│   │   └── connection.ts        # Socket connection logic
│   ├── jobs/
│   │   ├── index.ts             # Cron job registration
│   │   ├── due-date.job.ts      # Due date reminders
│   │   ├── invite-cleanup.job.ts # Expired invite cleanup
│   │   └── reminder.job.ts      # Additional reminders
│   ├── templates/               # Email HTML templates
│   ├── utils/
│   │   ├── bcrypt.ts            # Password hashing
│   │   ├── jwt.ts               # Token generation/verification
│   │   ├── error.ts             # Custom error classes
│   │   ├── slugify.ts           # Slug generation
│   │   ├── date.ts              # Date utilities
│   │   ├── sanitize.ts          # Input sanitization
│   │   └── pagination.ts        # Pagination helper
│   └── constants/
│       ├── roles.ts             # Role enum values
│       ├── permissions.ts       # Permission constants
│       ├── http.ts              # HTTP status codes
│       └── events.ts            # Notification types
├── prisma/
│   └── schema.prisma            # Database schema
├── package.json
└── tsconfig.json
```

## Architecture

### Module Pattern

Each module follows a consistent structure:
- `*.routes.ts` - Express route definitions
- `*.controller.ts` - Request/response handling
- `*.service.ts` - Business logic
- `*.repository.ts` - Database operations via Prisma
- `*.schema.ts` - Zod validation schemas
- `*.dto.ts` - Data transfer objects (types)

### Middleware Flow

1. **CORS** - Restricts origins to `FRONTEND_URL` + localhost
2. **JSON Parser** - Parses request body
3. **Rate Limiter** - Global (100 req/15min) + `authLimiter` (5 req/15min)
4. **Auth Middleware** - Extracts JWT, attaches user to request
5. **Workspace Middleware** - Verifies workspace membership for scoped routes

### Permission System

Roles (inherited per workspace):
- **ADMIN** - Full access: manage workspace, projects, members, tasks
- **MEMBER** - Can create tasks, comment, move/assign own tasks
- **VIEWER** - Read-only access

Permission checks are implemented in:
- `src/modules/tasks/task.permissions.ts` - Task operations
- `src/modules/workspaces/workspace.permissions.ts` - Workspace operations
- `src/permissions/*.ts` - Additional permission utilities

## API Endpoints

### Authentication
```
POST   /api/v1/auth/register           # Register new user
POST   /api/v1/auth/login              # Login
POST   /api/v1/auth/refresh-token      # Refresh tokens
POST   /api/v1/auth/logout             # Logout (auth required)
POST   /api/v1/auth/logout-all         # Logout all devices
GET    /api/v1/auth/me                 # Current user info
```

### Workspaces
```
POST   /api/v1/workspaces              # Create workspace
GET    /api/v1/workspaces              # Get user workspaces
GET    /api/v1/workspaces/:workspaceId # Get workspace
PATCH  /api/v1/workspaces/:workspaceId # Update workspace
DELETE /api/v1/workspaces/:workspaceId # Delete workspace (owner only)
GET    /api/v1/workspaces/:workspaceId/members    # List members
PATCH  /api/v1/workspaces/:workspaceId/members/:memberId/role # Update role
DELETE /api/v1/workspaces/:workspaceId/members/:memberId       # Remove member
```

### Projects (nested under workspace)
```
GET    /api/v1/workspaces/:workspaceId/projects          # List projects
POST   /api/v1/workspaces/:workspaceId/projects          # Create project
GET    /api/v1/workspaces/:workspaceId/projects/:projectId
PATCH  /api/v1/workspaces/:workspaceId/projects/:projectId
DELETE /api/v1/workspaces/:workspaceId/projects/:projectId
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/members
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/members
DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/members/:memberId
```

### Boards (nested under project)
```
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/boards
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId
PATCH  /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId
DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId
```

### Columns (nested under board)
```
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId
PATCH  /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId
DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/reorder
```

### Tasks (nested under column)
```
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId
PATCH  /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId
DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/move
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/tasks/my-tasks   # Assigned to user
POST   /api/v1/.../columns/:columnId/tasks/column/:columnId/reorder
```

### Comments (nested under task)
```
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments
POST   /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments
GET    /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments/:commentId
PATCH  /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments/:commentId
DELETE /api/v1/workspaces/:workspaceId/projects/:projectId/boards/:boardId/columns/:columnId/tasks/:taskId/comments/:commentId
```

### Notifications
```
GET    /api/v1/notifications           # Get user notifications
GET    /api/v1/notifications/unread-count
POST   /api/v1/notifications/mark-all-read
POST   /api/v1/notifications/mark-read
PATCH  /api/v1/notifications/:notificationId/read
```

### Invites
```
GET    /api/v1/invite/check?token=...   # Check invite validity (public)
POST   /api/v1/invite/accept            # Accept invite (auth required)
POST   /api/v1/workspaces/:workspaceId/invites  # Create invite
GET    /api/v1/workspaces/:workspaceId/invites
DELETE /api/v1/workspaces/:workspaceId/invites/:inviteId
```

## Socket.IO Events

### Connection
- `join:workspace` - Join workspace room
- `join:board` - Join board room
- `join:task` - Join task room
- `leave:*` - Leave respective room

### Presence
- `user:online` - User joined workspace
- `user:offline` - User left workspace
- `presence:get` / `presence:list` - Get online users

### Typing Indicators
- `typing:start` - User started typing
- `typing:stop` - User stopped typing
- `user:typing` - Broadcast typing status

### Real-time Updates
- `task:created` / `task:updated` / `task:moved` / `task:deleted`
- `comment:added` / `comment:updated` / `comment:deleted`
- `activity:updated` - Activity feed updates
- `notification:*` events

## Database Schema

### Core Entities

**User** - Authentication, profile (email, name, avatar, verified)
**Workspace** - Container for projects, has owner, slug, logo
**WorkspaceMember** - Many-to-many User/Workspace with Role (ADMIN/MEMBER/VIEWER)
**Project** - Contains boards, optional date range, soft delete
**ProjectMember** - Restricts project access within workspace
**Board** - Contains columns, soft delete
**Column** - Task pipeline stage, ordered by position
**Task** - Kanban card with priority, due date, assignee, reporter, soft delete
**Label** - Colored tags on tasks
**TaskLabel** - Many-to-many Task/Label

**Comment** - Task discussion with mentions
**CommentMention** - User mentions in comments (@username)
**Attachment** - Files on tasks via Cloudinary

**Notification** - User alerts (TASK_ASSIGNED, COMMENT_ADDED, MENTION, INVITE_RECEIVED, DUE_DATE, TASK_COMPLETED, MEMBER_JOINED)
**Activity** - Audit trail for workspace actions
**AuditLog** - Enterprise compliance logs

**RefreshToken** - JWT refresh token storage
**UserSession** - Session tracking
**Invite** - Workspace invitation system
**TaskHistory** - Field change tracking
**TaskDependency** - Task blocking relationships

## Background Jobs

- **Due Date Job** (`0 * * * *`) - Hourly: sends reminders for tasks due tomorrow, overdue alerts
- **Invite Cleanup** (`0 0 * * *`) - Daily at midnight: removes expired invites

## Environment Variables

```env
# Server
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://...

# JWT
JWT_SECRET=minimum_32_characters
JWT_REFRESH_SECRET=minimum_32_characters
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Email (SMTP for production, Ethereal for development)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASS=
EMAIL_FROM=noreply@taskflow.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## Scripts

```bash
npm run dev              # Start dev server (ts-node-dev)
npm run build            # Compile TypeScript
npm run start            # Run compiled server
npm run prisma:generate  # Generate Prisma client
npm run prisma:migrate   # Run migrations
npm run prisma:studio    # Open Prisma Studio
```

## Error Handling

Custom error classes extend `AppError`:
- `NotFoundError` - 404
- `UnauthorizedError` - 401
- `ForbiddenError` - 403
- `ValidationError` - 400
- `ConflictError` - 409
- `TooManyRequestsError` - 429

Handle errors via `error.middleware.ts` with automatic Prisma error mapping.

## Security Features

- Password hashing with bcrypt
- JWT access/refresh token rotation
- Rate limiting on all endpoints
- CORS origin restrictions
- Input validation with Zod
- Workspace-level access control
- Soft deletes for recovery
- Session tracking
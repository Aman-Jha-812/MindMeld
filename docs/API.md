# API Documentation

## Base URL
`/api`

## Authentication
All protected routes require a JWT token in the Authorization header: `Bearer <token>`

### Auth Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login user |
| POST | /api/auth/logout | Logout user |
| GET | /api/auth/me | Get current user |
| PUT | /api/auth/update-password | Update password |
| POST | /api/auth/refresh-token | Refresh access token |
| POST | /api/auth/forgot-password | Forgot password |
| PUT | /api/auth/reset-password/:token | Reset password |

### User Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/users | Get all users |
| GET | /api/users/:id | Get user by ID |
| PUT | /api/users/profile | Update profile |
| PUT | /api/users/avatar | Update avatar |
| DELETE | /api/users/account | Delete account |

### Workspace Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/workspaces | Create workspace |
| GET | /api/workspaces | Get user workspaces |
| GET | /api/workspaces/:id | Get workspace by ID |
| PUT | /api/workspaces/:id | Update workspace |
| DELETE | /api/workspaces/:id | Delete workspace |
| POST | /api/workspaces/:id/invite | Invite member |
| DELETE | /api/workspaces/:id/members/:memberId | Remove member |
| POST | /api/workspaces/:id/leave | Leave workspace |
| PUT | /api/workspaces/:id/members/:memberId/role | Update role |
| GET | /api/workspaces/:id/members | Get members |

### Chat Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/channels/workspaces/:workspaceId/channels/:channelId/messages | Get messages |
| POST | /api/channels/workspaces/:workspaceId/channels/:channelId/messages | Send message |
| PUT | /api/channels/messages/:id | Edit message |
| DELETE | /api/channels/messages/:id | Delete message |
| GET | /api/channels/workspaces/:workspaceId/channels | Get channels |
| POST | /api/channels/workspaces/:workspaceId/channels | Create channel |

### AI Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/ai/chat-summary | Summarize chat |
| POST | /api/ai/generate-code | Generate code |
| POST | /api/ai/debug-code | Debug code |
| POST | /api/ai/explain-code | Explain code |
| POST | /api/ai/meeting-notes | Generate meeting notes |
| POST | /api/ai/documentation | Generate documentation |
| POST | /api/ai/commit-message | Generate commit message |
| POST | /api/ai/technical-question | Answer technical question |
| POST | /api/ai/action-items | Extract action items |
| POST | /api/ai/suggest-tasks | Suggest tasks |
| POST | /api/ai/code-review | Review code |
| GET | /api/ai/history | Get AI history |

### Task Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/tasks/workspaces/:workspaceId/tasks | Get tasks |
| POST | /api/tasks/workspaces/:workspaceId/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| PUT | /api/tasks/reorder | Reorder tasks |

### Notification Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/notifications | Get notifications |
| GET | /api/notifications/unread-count | Get unread count |
| PUT | /api/notifications/:id/read | Mark as read |
| PUT | /api/notifications/read-all | Mark all as read |
| DELETE | /api/notifications/:id | Delete notification |
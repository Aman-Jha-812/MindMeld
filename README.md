# MindMeld — AI-Powered Team Collaboration Platform

MindMeld is a modern team collaboration platform combining real-time chat, AI assistance, task management, and workspace organization — inspired by **Slack + Notion + Trello + ChatGPT**.

Live deployments:
- **Client (Frontend):** Vercel
- **API (Backend):** Render

---

## Features

### Real-time Chat
- Channel-based messaging with instant delivery via Socket.io
- File and image sharing (Cloudinary)
- Message editing and deletion (admin/sender)
- Typing indicators, mentions, reply threading
- Emoji support

### AI Assistant (Powered by Sarvam AI)
- Summarize chat conversations
- Generate, debug, and explain code
- Generate meeting notes from transcripts
- Create documentation and commit messages
- Answer technical questions directly (the assistant answers normally instead of always forcing a summary prompt)
- Extract action items and suggest tasks
- Code review
- Custom **MindMeld system prompt** injected into every request so the AI understands the product context

### Task Management
- Create, assign, and track tasks
- Priority levels (low, medium, high, urgent)
- Status workflow (todo → in_progress → completed) — toggle directly from the task card
- Due dates with color-coded indicators
- **Assignee selection** — assigning a task notifies the assignee in real time

### Workspaces & Channels
- Organized team spaces with role-based access (owner, admin, member, viewer)
- Default channels: General, Development, Design, HR
- Custom channels with admin and member roles
- Invite system with email notifications

### File Management & Safety
- Upload via Cloudinary (images, PDFs, DOCX, ZIP)
- Preview and download with original filenames
- **NSFW content filtering** — images are scanned client-side with `nsfwjs` before upload and blocked if they contain pornographic/hentai/sexy content (blocks the vulgar-content abuse case)

### Notifications (Real-time)
- Real-time in-app notifications delivered over **Socket.io**
- Triggered by:
  - **New channel message** — all workspace members (except the sender) are notified
  - **Task assignment** — the assignee is notified
  - **@mentions** — mentioned users are notified
- **Sound alert** (Web Audio API beep) + **toast popup** on every new notification
- **Unread count badge** on the bell icon (updates live, no refresh needed)
- **Auto mark-as-read** — opening a channel marks all its notifications as read and the badge resets to 0
- Notifications for the currently-open channel do not ring the bell (you can already see the message)

### User Profiles
- Avatar upload, bio, skills, social links
- Password management
- Forgot / reset password via email

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT + Refresh Tokens, Bcrypt |
| AI | Sarvam AI API (`sarvam-105b`) |
| Realtime | Socket.io |
| Storage | Cloudinary |
| Email | Nodemailer (SendGrid SMTP) |
| Image Safety | nsfwjs (client-side NSFW detection) |
| Deployment | Vercel (client) + Render (API) |

---

## Architecture

```
MindMeld-SaaS/
├── client/                  # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Modal, Avatar, Badge, etc.
│   │   │   ├── layout/      # AppLayout (sidebar, bell badge), Header
│   │   │   ├── chat/        # MessageList, MessageInput, ChannelList
│   │   │   ├── ai/          # AIAssistantPanel, AICodeBlock
│   │   │   ├── dashboard/   # StatsCard, TaskCard, ActivityFeed
│   │   │   └── workspace/   # MemberList, CreateChannelModal
│   │   ├── pages/           # Route-level page components
│   │   ├── context/         # Auth, Chat (socket + notifications), Workspace providers
│   │   ├── services/        # API client and service modules
│   │   ├── hooks/           # Custom hooks (useSocket, useDebounce)
│   │   └── styles/          # Tailwind CSS with design system
├── server/                  # Express backend (MVC pattern)
│   ├── config/              # DB, Socket.io, Cloudinary, Sarvam AI (+ MindMeld system prompt)
│   ├── controllers/         # Request handlers (auth, workspace, chat, task, notification, activity)
│   ├── models/              # Mongoose schemas (User, Workspace, Channel, Message, Task, Notification)
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic (AI, Email/SMTP, Socket, Storage)
│   ├── middleware/           # Auth, upload, error handling
│   └── .env                 # Environment variables (gitignored)
├── shared/                  # Shared constants and utilities
└── docs/                    # API and database documentation
```

**High-level flow:**
1. Client (React) talks to the Express API over REST (`/api/*`).
2. Real-time events (new messages, notifications, typing) travel over **Socket.io** (WebSocket fallback to polling).
3. MongoDB (Atlas) stores users, workspaces, channels, messages, tasks, notifications.
4. AI calls go to **Sarvam AI**; file uploads go to **Cloudinary** (with client-side NSFW pre-check); emails go through **SendGrid SMTP**.

---

## Project Summary (for Interviews)

### What is MindMeld?
A full-stack SaaS-style team collaboration app — Slack-style channels + real-time chat, Notion-style workspaces, Trello-style tasks, and a ChatGPT-style AI assistant — with JWT auth, real-time notifications, and cloud storage.

### Key design decisions
1. **REST + Socket.io split** — REST handles durable CRUD; Socket.io handles ephemeral real-time events (new messages, typing, notifications). This keeps the message delivery instant while keeping everything persisted in MongoDB.
2. **JWT access + refresh token pattern** — short-lived access token + long-lived refresh token for secure session management.
3. **Centralized AI service** — one `aiService` builds prompts; the controller passes `query` and `context` separately so the AI can answer questions directly (fixed the "refuse to answer" bug) instead of blindly forcing a summary.
4. **Client-side NSFW pre-screening** — `nsfwjs` runs a lightweight model in the browser before upload, so bad images never reach Cloudinary. This solved an account-suspension abuse case.
5. **Notification read-state in the DB + live badge via socket** — unread count is computed from MongoDB (`/notifications/unread-count`), and the badge increments in real time when a `notification` socket event arrives. Opening a channel marks its notifications read.
6. **MVC backend** — controllers/routes/models/services separation; easy to test and extend.
7. **Deployed on managed platforms** — Vercel for the static client, Render for the Node API (why it works without Docker in production).

### Notable bugs I fixed (great to talk about)
- **Duplicate AI bubbles** — separate `response` state rendered twice; removed the extra render, errors also show inside the history entry.
- **AI refusing questions in the Summarize tab** — the prompt forced "summarize" mode; fixed by passing `query` + `context` separately so it answers questions normally and only summarizes when asked.
- **Emails not sending** — SendGrid needs `SMTP_USER=apikey`, port `2525`, and `SMTP_FROM` for sender identity (550 sender-identity error).
- **CORS errors after deploy** — `CLIENT_URL` on Render must include the exact Vercel origin.
- **Dashboard showing fake data** — replaced placeholders with real queries (`/api/activity/recent`, real tasks, real unread count).
- **Task completion toggle not working** — added optimistic status update with rollback on API failure.
- **Notifications never arriving** — client never sent `mentions`, and the socket `notification` event wasn't listened to; added triggers (new message / task assignment) and a socket listener with sound + toast.

---

## Environment Variables

Create `server/.env` with the following:

| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | JWT signing secret |
| `JWT_EXPIRE` | Token expiry (e.g. `30d`) |
| `JWT_REFRESH_SECRET` | Refresh token secret |
| `JWT_REFRESH_EXPIRE` | Refresh token expiry (e.g. `90d`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `SARVAM_API_KEY` | Sarvam AI API key |
| `SMTP_HOST` | SMTP server (e.g. `smtp.sendgrid.net`) |
| `SMTP_PORT` | SMTP port (SendGrid: `2525`, Gmail: `587`) |
| `SMTP_USER` | `apikey` (SendGrid) or Gmail address |
| `SMTP_PASS` | SendGrid API key / Gmail app password |
| `SMTP_FROM` | Verified sender email |
| `CLIENT_URL` | Frontend URL (e.g. `http://localhost:3000`) |

Client env (`.env` / `.env.production`): `VITE_API_URL` — the API base URL.

---

## Getting Started

### Prerequisites
- Node.js 20+
- MongoDB Atlas account
- Cloudinary account
- Sarvam AI API key
- SendGrid or Gmail account for email

### Run Locally

**Terminal 1 — Server:**
```bash
cd server
npm install
npm run dev
```

**Terminal 2 — Client:**
```bash
cd client
npm install
npm run dev
```

The app will be at `http://localhost:3000` (client) and `http://localhost:5000` (API).

### Build & Deploy
- **Client:** `npm run build` in `client/`, push to GitHub → Vercel auto-deploys
- **Server:** push to GitHub → Render auto-deploys; set env vars in Render dashboard

---

## API Overview

| Base Path | Module |
|-----------|--------|
| `/api/auth` | Register, login, logout, refresh token, forgot/reset password |
| `/api/users` | Profile management, avatar upload, notification settings |
| `/api/workspaces` | Workspace CRUD, members, invite |
| `/api/channels` | Channel CRUD, messages |
| `/api/ai` | AI endpoints (summarize, code, notes, docs, etc.) |
| `/api/tasks` | Task CRUD, reorder, status update |
| `/api/notifications` | List, unread count, mark read, mark channel read, delete |
| `/api/activity` | Recent activity feed (dashboard) |
| `/api/files` | File upload (with NSFW pre-check) |

## API Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

---

## Interview Questions

### General / Project
1. **What is MindMeld and what problem does it solve?**
   - A team collaboration SaaS app that combines real-time chat, AI assistance, task management, and workspaces. Teams can chat in channels, get AI help, and manage tasks in one place instead of juggling Slack/Notion/Trello.

2. **What is your role in this project?**
   - Full-stack development — architecture, REST API, Socket.io real-time layer, frontend components, AI integration, and deployment (Vercel + Render).

3. **What was the hardest bug you fixed?**
   - The AI assistant refusing questions in the Summarize tab. Root cause: the prompt always forced a summary. Fix: pass `query` and `context` separately so it answers questions normally and only summarizes when explicitly asked.

### Backend / Architecture
4. **Why did you use REST + Socket.io together?**
   - REST is simple, cached, and durable for CRUD; Socket.io gives bidirectional, low-latency push for real-time events (new messages, typing, notifications). Messages are saved via REST then broadcast over sockets.

5. **How does authentication work?**
   - Bcrypt hashes passwords; JWT access token (short-lived) + refresh token (long-lived). Refresh endpoint issues a new access token when it expires.

6. **Explain the notification system end to end.**
   - Backend creates a `Notification` document in MongoDB when a message is sent / task is assigned / mention happens, then emits a `notification` socket event to the recipient's `user:<id>` room. The client listens on that event, plays a sound, shows a toast, and increments the unread badge. Opening a channel calls `PUT /notifications/read-channel/:channelId` which marks them read and resets the count.

7. **Why does Socket.io have a polling fallback?**
   - Some networks/proxies block WebSockets. `transports: ['websocket', 'polling']` lets it fall back to HTTP long-polling so real-time still works.

8. **How do you store and query notifications?**
   - A `Notification` collection with fields `recipient`, `type`, `title`, `message`, `data`, `isRead`, `createdAt`. Indexed on `{ recipient, isRead, createdAt }` for fast unread-count queries.

### Frontend
9. **How did you make the unread badge real-time?**
   - A global `ChatContext` manages the Socket.io connection and an `unreadCount` state. On the `notification` event it increments; `refreshUnreadCount()` syncs from the server. The bell badge and dashboard card both read this shared state.

10. **How do you prevent duplicate AI responses?**
    - There was a separate `response` state rendered outside the message list. Removed it so the AI reply only exists inside the history entries, which are keyed by id to avoid duplicates.

11. **How does NSFW filtering work without a backend model?**
    - `nsfwjs` runs a TensorFlow.js model in the browser. The image is classified before upload; if porn/hentai/sexy probability ≥ 0.7, upload is blocked client-side, so unsafe content never reaches the server.

12. **How is state managed?**
    - React Context (Auth, Chat, Workspace) plus hooks. Auth holds the token and user; Chat holds the socket, messages, active channel, and unread count; Workspace holds workspaces and members.

### Deployment / DevOps
13. **How is this deployed?**
    - Frontend on Vercel (static build via `npm run build`), backend on Render (Node service). Env vars set in each dashboard. CORS configured with `CLIENT_URL`.

14. **Why were emails failing and how did you fix it?**
    - SendGrid requires `SMTP_USER=apikey` (not the email), port `2525`, and a verified sender for `SMTP_FROM`. Also fixed the 550 sender-identity error by using the verified address.

15. **How did you handle a Cloudinary account suspension?**
    - Added client-side NSFW detection so the abusive content never gets uploaded, then contacted support to restore the account.

### Database / Data Modeling
16. **What collections does the database have and how are they related?**
    - `User`, `Workspace` (has `owner`, `channels`, `members`), `WorkspaceMember` (membership + role, unique per workspace+user), `Channel`, `Message`, `Task`, `Notification`. Workspaces contain channels; messages belong to a channel; tasks belong to a workspace and can have an assignee; notifications point to a recipient with embedded `data` (e.g. `channelId`) for scoping read-state.

17. **Why do you have a separate `WorkspaceMember` model instead of storing roles in `Workspace.members`?**
    - Keeps the `Workspace.members` array simple and queryable, and gives a clean place to store per-member metadata (role, joinedAt) with a unique index on `{ workspace, user }` to prevent duplicates. It also makes "workspaces a user belongs to" queries fast.

18. **How do you keep chat message history performant?**
    - Messages are indexed by channel and use cursor-based pagination (`before` timestamp) so loading older messages is efficient. New messages are pushed via socket and deduped by `_id` on the client.

### Advanced / Engineering
19. **How do you do optimistic updates and rollback?**
    - In the task status toggle, the UI updates the status immediately (optimistic), then calls `PUT /api/tasks/:id`. If the API fails, the previous status is restored (rollback) and an error toast is shown — this makes the UI feel instant.

20. **What would you do to scale this app if it grew?**
    - Horizontally scale the API; add a Redis adapter to Socket.io so sockets share rooms across instances; move the NSFW check to a server-side queue; add rate limiting and message pagination tuning; use a CDN for static assets; and move email/AI/file-processing to background jobs.

### Follow-up / Design questions you should be ready for
- "How would you scale real-time chat to 10k users?" → horizontally scale Socket.io with a Redis adapter for sticky rooms.
- "How would you prevent notification spam?" → dedupe by message/channel, batch notifications, only notify when user is not viewing the channel (already done for the active channel).
- "How would you secure the API?" → helmet, rate limiting, JWT on protected routes, sanitize inputs, CORS allowlist.
- "How do you debug a bug in production?" → check logs on Render, reproduce locally with the same env, add temporary logging, fix and redeploy, then confirm on the live URL.
- "How do you handle secrets and keys?" → never commit `.env` (gitignored); set secrets in the Render dashboard; rotate keys if they are ever exposed.

---

## License

MIT

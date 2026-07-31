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

> Har question ke neeche detailed answer diya hai. Inhe apne words me bolne ki practice karo.

### General / Project

**1. What is MindMeld and what problem does it solve?**
MindMeld is a full-stack team collaboration SaaS platform that combines real-time chat, AI assistance, task management, and workspace organization in one product — think Slack + Notion + Trello + ChatGPT. The problem it solves: teams currently juggle multiple paid tools (one for chat, one for tasks, one for docs). MindMeld brings messaging, task tracking, and an AI assistant together so a team can collaborate in one place. It also includes role-based access control, file sharing with safety filtering, email invites, and real-time notifications.

**2. What is your role in this project?**
I built it end-to-end as a full-stack developer. That means: designing the architecture (REST API + Socket.io + MongoDB), writing the Express backend (auth, workspaces, channels, chat, tasks, notifications, activity), building the React frontend (pages, contexts, socket integration, AI assistant panel), integrating third-party services (Sarvam AI, Cloudinary, SendGrid, nsfwjs), and deploying it to Vercel (client) and Render (API). I also debugged production issues like CORS, SMTP, and duplicate AI responses.

**3. What was the hardest bug you fixed?**
The AI assistant was refusing to answer questions in the Summarize tab — it kept replying with things like "please ask for a summary." Root cause: the service always injected a "you are a summarizer" instruction, so even normal questions got forced into summary mode. Fix: I changed the service to accept a `query` and a `context` separately. The assistant answers the query normally, uses the chat transcript as context, and only summarizes when the user explicitly asks. This was the hardest because it wasn't an error — it was a subtle prompt/logic issue that required understanding how the AI call was built.

### Backend / Architecture

**4. Why did you use REST + Socket.io together?**
Because they solve different problems. REST is simple, stateless, cacheable, and perfect for durable CRUD operations — creating workspaces, saving messages, updating tasks, fetching profiles. Socket.io gives us a persistent, bidirectional, low-latency connection for real-time events — new messages, typing indicators, and notifications. The flow: a message is saved via REST (so it's durable in MongoDB), and then the server broadcasts it to everyone in that channel over the socket. If the socket connection is slow or drops, REST is still reliable — and the socket's polling fallback keeps real-time working.

**5. How does authentication work?**
Passwords are hashed with bcrypt before storing. On login, the server verifies the hash and issues two tokens: a short-lived JWT access token (used on every protected request) and a long-lived refresh token. When the access token expires, the client calls the refresh endpoint, which validates the refresh token and issues a new access token — so the user stays logged in without re-entering their password. The auth middleware (`protect`) verifies the JWT on every protected route and attaches the user to the request. This reduces risk because even if an access token is stolen, it expires quickly.

**6. Explain the notification system end to end.**
When a message is sent, a task is assigned, or someone is mentioned, the backend creates a `Notification` document in MongoDB for the recipient (with fields like `recipient`, `type`, `title`, `message`, `data` containing the `channelId`, and `isRead: false`). It then emits a `notification` socket event to the recipient's private room (`user:<id>`), which each user joins automatically on socket connect. The client's `ChatContext` listens for that event, plays a sound (Web Audio API), shows a toast, and increments the unread badge. If the user is currently viewing that channel, we skip the alert and mark it read immediately. When the user opens a channel, the client calls `PUT /api/notifications/read-channel/:channelId`, which marks all of that channel's notifications as read and refreshes the badge to 0.

**7. Why does Socket.io have a polling fallback?**
Because WebSockets aren't always available — some corporate networks, proxies, or load balancers block the WebSocket upgrade. Socket.io's `transports: ['websocket', 'polling']` means it tries WebSocket first and automatically falls back to HTTP long-polling. This keeps real-time features (messages, notifications) working even on restrictive networks. It's a resilience choice.

**8. How do you store and query notifications?**
Notifications live in their own `Notification` MongoDB collection with fields `recipient`, `workspace`, `type`, `title`, `message`, `data` (a mixed object where I store the `channelId`, `workspaceId`, `messageId`/`taskId`), `isRead`, and `createdAt`. The key index is on `{ recipient, isRead, createdAt }` — that makes the unread-count query (count documents where `recipient = user` and `isRead = false`) and the sorted list fast. To mark a channel read, I update all unread notifications where `data.channelId` matches, which avoids storing duplicate per-channel read state.

### Frontend

**9. How did you make the unread badge real-time?**
I keep a single global `ChatContext` that owns the Socket.io connection and a shared `unreadCount` state. On socket connect, it fetches the accurate count from `/api/notifications/unread-count`. Whenever a `notification` socket event arrives, the handler increments the count, plays a sound, and shows a toast. Both the bell icon badge in the layout and the "Notifications" card on the dashboard read from this same context — so the count updates live everywhere without refetching or refreshing the page.

**10. How do you prevent duplicate AI responses?**
The bug was a UI state problem: the AI assistant had a separate `response` state that was rendered as an extra bubble outside the message history, while the same response was also stored inside the history. So the user saw two bubbles. Fix: I removed the standalone `response` render and made the history entry the single source of truth. Entries are keyed by message id and deduped, so an AI reply renders exactly once — and errors now also render inside the history entry instead of vanishing.

**11. How does NSFW filtering work without a backend model?**
I use `nsfwjs`, which runs a TensorFlow.js model directly in the browser. When the user picks an image in the chat input, I classify it before upload. If the probability for pornographic, hentai, or sexy content is ≥ 0.7, the upload is blocked and a message tells the user the image is not allowed. Because the check happens client-side, unsafe content never reaches the server or Cloudinary at all — this was added after a Cloudinary account got suspended due to vulgar content being uploaded.

**12. How is state managed?**
I use React Context + hooks — no heavy state library, because the app didn't need one. `AuthContext` holds the user and tokens; `ChatContext` holds the socket connection, messages, active channel, and unread notification count; `WorkspaceContext` holds workspaces and members. Server data is fetched through service modules that wrap the Axios client, and local UI state (modals, forms, toggles) lives in component `useState`. Socket events update context state so every page reacts in real time.

### Deployment / DevOps

**13. How is this deployed?**
The frontend is a static build (`npm run build`) deployed on Vercel, and the backend is a Node service deployed on Render. Both auto-deploy from the GitHub repo on push. Environment variables (Mongo URI, JWT secrets, Cloudinary, Sarvam key, SMTP, CLIENT_URL) are set in each platform's dashboard — never committed. CORS is configured server-side using `CLIENT_URL`, which must exactly match the Vercel origin (that mismatch caused a real CORS bug we fixed).

**14. Why were emails failing and how did you fix it?**
Three issues in sequence. First, connection timeouts on port 587 — Render blocks that port, so I switched to SendGrid's port 2525. Second, a 535 authentication error — SendGrid requires `SMTP_USER=apikey` and the API key as `SMTP_PASS`, not a normal email/password. Third, a 550 "sender identity" error — the `from` address must be a verified sender in the SendGrid account, so I added a separate `SMTP_FROM` env var pointing to the verified address. After those fixes, invites and password-reset emails worked.

**15. How did you handle a Cloudinary account suspension?**
Cloudinary suspended the account because a user uploaded vulgar images, returning "uploading is disabled" (401) for every upload. The code was fine — the account was blocked. I added client-side NSFW detection with `nsfwjs` so such content can never be uploaded again, and I raised a support request to restore the account. So the fix had two parts: a prevention layer and a provider-side escalation.

### Database / Data Modeling

**16. What collections does the database have and how are they related?**
- `User` — profiles, passwords, avatar
- `Workspace` — has `owner`, `channels` (array), `members` (array), `inviteCode`
- `WorkspaceMember` — membership with `role` (owner/admin/member/viewer), unique index on `{ workspace, user }`
- `Channel` — belongs to a workspace, has `name`, `type`, optional members
- `Message` — belongs to a channel, has `sender`, `content`, `mentions`, `file`, `replyTo`
- `Task` — belongs to a workspace, has `title`, `assignedTo`, `priority`, `status`, `dueDate`
- `Notification` — belongs to a `recipient`, has `type`, `data`, `isRead`

Relationships: Workspace → Channels (1:N), Channel → Messages (1:N), Workspace → Tasks (1:N), User → Notifications (1:N). Memberships connect Users to Workspaces with a role.

**17. Why do you have a separate `WorkspaceMember` model instead of storing roles in `Workspace.members`?**
Storing `ObjectId`s in `Workspace.members` is fine for a simple "who's in this workspace" list, but it can't hold per-member metadata cleanly. The `WorkspaceMember` model stores `workspace`, `user`, and `role` with a unique index on `{ workspace, user }` — so a user can't join twice, roles are easy to query and update, and "give me all workspaces this user belongs to" is a fast indexed lookup. It's a standard many-to-many join table pattern in Mongo.

**18. How do you keep chat message history performant?**
Messages are fetched per channel and paginated using cursor-based pagination — the client passes a `before` timestamp and the query does `createdAt < before` with a limit, then sorts newest-first. That means loading older messages is one indexed query, not a full scan. New messages come over the socket and are appended/deduped by `_id`, so the list stays correct even if the socket and the REST response arrive out of order.

### Advanced / Engineering

**19. How do you do optimistic updates and rollback?**
In the task status toggle, I update the UI state immediately (optimistic) so the checkmark changes instantly, then fire `PUT /api/tasks/:id` with the new status. If the request fails, I roll the state back to the previous status and show an error toast. This gives a fast, responsive feel and a correct fallback — the classic optimistic-UI pattern. I also applied it to task reordering earlier.

**20. What would you do to scale this app if it grew?**
- Add a Redis adapter to Socket.io so multiple API instances share rooms and can push messages across servers.
- Add rate limiting and request throttling per user on the API.
- Move heavy work (email, AI calls, image processing) into background queues instead of doing them inline.
- Serve static assets through a CDN and lazy-load route chunks (the client already uses React lazy).
- Optimize MongoDB queries with targeted indexes and possibly read replicas.
- Run the NSFW check server-side too, since client-side checks can be bypassed.

### Follow-up / Design questions you should be ready for

**How would you scale real-time chat to 10k users?**
You can't rely on one process and in-memory rooms at that scale. I'd run multiple API instances behind a load balancer and add a Redis adapter to Socket.io so socket rooms are shared across instances — then any message emitted on one instance reaches sockets on other instances. I'd also add sticky sessions or fall back to polling, tune connection limits, and consider sharding workspaces/channels across nodes.

**How would you prevent notification spam?**
A few layers: dedupe notifications by (recipient, channel, messageId) so one message doesn't create duplicates; batch/digest notifications instead of one per message when a user is offline; and only notify when the user is not currently viewing the target channel — which I already do for the active channel. Add a per-user notification preference system (already scaffolded in Settings) and cap how many notifications one message can create.

**How would you secure the API?**
Use security headers (helmet), CORS allowlist (already using CLIENT_URL), rate limiting to block brute force, validate and sanitize all inputs (express-validator/joi), hash passwords with bcrypt, sign JWTs with a strong secret and short expiry, restrict refresh tokens, protect file uploads (extension/type checks + NSFW check), and never log secrets.

**How do you debug a bug in production?**
First, check the logs on Render (server) and Vercel (client). Reproduce the issue locally with the same env variables and data if possible. If it's environment-specific (like the SMTP port or CORS), test the exact same config. Add temporary logging around the failing call, deploy, and confirm. Once fixed, remove the debug logs and verify on the live URL with the exact steps the user reported.

**How do you handle secrets and keys?**
`.env` is in `.gitignore`, so secrets are never committed. Production secrets are set directly in the Render dashboard. If a key is ever exposed (like the SendGrid API key appearing in chat), the right move is to rotate it — delete the old key and generate a new one — and update the env var, then avoid pasting secrets anywhere shared.

---

## License

MIT

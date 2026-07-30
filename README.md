# MindMeld — AI-Powered Team Collaboration Platform

MindMeld is a modern team collaboration platform combining real-time chat, AI assistance, task management, and workspace organization — inspired by **Slack + Notion + Trello + ChatGPT**.

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
- Answer technical questions
- Extract action items and suggest tasks
- Code review

### Task Management
- Create, assign, and track tasks
- Priority levels (low, medium, high, urgent)
- Status workflow (todo → in_progress → completed)
- Due dates with color-coded indicators
- Drag-and-drop reordering

### Workspaces & Channels
- Organized team spaces with role-based access
- Default channels: General, Development, Design, HR
- Custom channels with admin and member roles
- Invite system with email notifications

### File Management
- Upload via Cloudinary (images, PDFs, DOCX, ZIP)
- Preview and download with original filenames

### Notifications
- Real-time in-app notifications
- New messages, task assignments, mentions
- Unread count badge

### User Profiles
- Avatar upload, bio, skills, social links
- Password management
- Forgot / reset password via email

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas, Mongoose |
| Authentication | JWT + Refresh Tokens, Bcrypt |
| AI | Sarvam AI API |
| Realtime | Socket.io |
| Storage | Cloudinary |
| Email | Nodemailer (Gmail SMTP) |
| Deployment | Docker, Docker Compose |

## Architecture

```
MindMeld-SaaS/
├── client/                  # React frontend (Vite + Tailwind)
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   │   ├── common/      # Modal, Avatar, Badge, etc.
│   │   │   ├── layout/      # AppLayout, Sidebar, Header
│   │   │   ├── chat/        # MessageList, MessageInput, ChannelList
│   │   │   ├── ai/          # AIAssistantPanel, AICodeBlock
│   │   │   ├── dashboard/   # StatsCard, TaskCard, WorkspaceCard
│   │   │   └── workspace/   # MemberList, CreateChannelModal
│   │   ├── pages/           # Route-level page components
│   │   ├── context/         # Auth, Chat, Workspace providers
│   │   ├── services/        # API client and service modules
│   │   ├── hooks/           # Custom hooks (useSocket, useDebounce)
│   │   └── styles/          # Tailwind CSS with design system
│   ├── nginx.conf           # nginx reverse proxy config
│   └── Dockerfile
├── server/                  # Express backend (MVC pattern)
│   ├── config/              # DB, Socket.io, Cloudinary, AI
│   ├── controllers/         # Request handlers
│   ├── models/              # Mongoose schemas
│   ├── routes/              # API route definitions
│   ├── services/            # Business logic (AI, Email, Storage)
│   ├── middleware/           # Auth, upload, error handling
│   ├── .env                 # Environment variables
│   └── Dockerfile
├── shared/                  # Shared constants and utilities
├── docs/                    # API and database documentation
└── docker-compose.yml
```

## Getting Started

### Prerequisites
- Node.js 20+
- Docker (recommended for production-like setup)
- MongoDB Atlas account
- Cloudinary account
- Sarvam AI API key (or Gemini key as fallback)
- Gmail account with app password (for email)

### Environment Variables

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
| `SMTP_HOST` | SMTP server (default: `smtp.gmail.com`) |
| `SMTP_PORT` | SMTP port (default: `587`) |
| `SMTP_USER` | Gmail address for sending emails |
| `SMTP_PASS` | Gmail app password |
| `CLIENT_URL` | Frontend URL (default: `http://localhost:3000`) |

### Run with Docker (Recommended)

```bash
# Build and start
docker compose up --build -d

# View logs
docker compose logs server --tail=20
docker compose logs client --tail=20

# Stop
docker compose down
```

### Run Locally (Without Docker)

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

## API Overview

| Base Path | Module |
|-----------|--------|
| `/api/auth` | Register, login, logout, refresh token, forgot/reset password |
| `/api/users` | Profile management, avatar upload |
| `/api/workspaces` | Workspace CRUD, members, invite |
| `/api/channels` | Channel CRUD, messages |
| `/api/ai` | 12 AI endpoints (summarize, code, notes, docs, etc.) |
| `/api/tasks` | Task CRUD, reorder |
| `/api/notifications` | Notifications, unread count |

## Deployment

### Deploy to VPS (DigitalOcean / AWS / Linode)

```bash
# Copy project to server
rsync -avz --exclude 'node_modules' --exclude 'client/dist' . user@your-server:/opt/mindmeld

# SSH and run
ssh user@your-server
cd /opt/mindmeld
docker compose up --build -d
```

### Deploy to Railway / Render / Fly.io

1. Push code to GitHub
2. Connect repo to Railway/Render/Fly
3. Set environment variables in dashboard
4. Deploy — the `Dockerfile` and `docker-compose.yml` handle the rest

### HTTPS (Let's Encrypt)

```bash
certbot --nginx -d yourdomain.com
```

Or use **Caddy** / **Nginx Proxy Manager** as a reverse proxy for auto-SSL.

## API Response Format

```json
{
  "success": true,
  "data": { ... },
  "message": "Optional message"
}
```

## License

MIT

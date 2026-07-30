# Architecture

## Overview
MindMeld follows a **client-server architecture** with a modular monorepo structure.

```
MindMeld-SaaS/
├── client/          # React frontend (Vite + Tailwind)
├── server/          # Express backend (MVC pattern)
├── shared/          # Shared constants and utilities
```

## Frontend Architecture

### Layers
1. **Pages** - Route-level components, each in its own folder
2. **Components** - Reusable UI pieces (common, layout, feature-specific)
3. **Context** - State management via Context API
4. **Services** - API communication layer
5. **Hooks** - Custom React hooks
6. **Utils** - Helper functions

### State Management
- **AuthContext** - Authentication state, user data
- **ChatContext** - Messages, channels, typing indicators
- **WorkspaceContext** - Workspaces, members

## Backend Architecture

### Layers
1. **Routes** - Define endpoints, attach middleware
2. **Controllers** - Request handling, response formatting
3. **Services** - Business logic (AI, email, storage)
4. **Models** - Mongoose schemas
5. **Middleware** - Auth, upload, error handling

### Data Flow
```
Client -> API Request -> Routes -> Middleware -> Controller -> Service -> Model -> MongoDB
```

## Key Design Decisions
- No business logic in routes
- Standardized API responses: { success, data, message }
- JWT with refresh token rotation
- Socket.io for real-time features
- Cloudinary for file storage
- Gemini AI for all AI features
# Real-Time Chat App (MVP)

Next.js frontend + NestJS WebSocket backend. Single public room, username-only entry, in-memory storage.

## Stack

- **Frontend:** Next.js 14, TypeScript, Tailwind CSS, Socket.IO client
- **Backend:** NestJS, WebSocket gateway (Socket.IO), in-memory store

## Quick start

### 1. Backend (port 3001)

```bash
cd server
npm install
npm run start:dev
```

### 2. Frontend (port 3000)

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), enter a username, and chat. Use multiple tabs or browsers to test real-time messaging, typing indicators, and presence.

## MVP scope

- Single public chatroom (#general)
- Enter username (no auth)
- Real-time messaging via WebSocket
- Message list + input
- Works across multiple browser tabs
- In-memory storage (no database)
- Typing indicator and presence (online count)

## Env (optional)

- `client/.env.local`: `NEXT_PUBLIC_WS_URL=http://localhost:3001` (default if omitted)

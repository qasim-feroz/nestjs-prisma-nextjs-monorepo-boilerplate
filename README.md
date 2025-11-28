# Task Manager Monorepo

A monorepo task management application built with NestJS, Next.js, and BullMQ.

## Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker Desktop (for Redis) - [Download here](https://www.docker.com/products/docker-desktop/)

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Start Redis

Redis is required for the worker to process background jobs.

**Option 1: Using Docker (Recommended)**
```bash
npm run redis:up
```

**Option 2: Install Redis Locally**
- Windows: Download from [Redis for Windows](https://github.com/microsoftarchive/redis/releases) or use WSL2
- Mac: `brew install redis` then `redis-server`
- Linux: `sudo apt-get install redis-server` then `sudo systemctl start redis`

### 3. Start Development Servers

```bash
npm run dev
```

This will start:
- **API** (NestJS) on `http://localhost:3001`
- **Web** (Next.js) on `http://localhost:3000`
- **Worker** (BullMQ) - processes background jobs

## Project Structure

```
task-manager/
├── apps/
│   ├── api/          # NestJS backend API
│   ├── web/          # Next.js frontend
│   ├── worker/       # BullMQ worker for background jobs
│   └── admin/        # Admin dashboard (to be configured)
├── packages/
│   ├── lib/          # Shared libraries
│   ├── prisma/       # Prisma schema and database
│   ├── types/        # Shared TypeScript types
│   └── ui/           # Shared UI components
└── infra/            # Infrastructure configurations
```

## Available Scripts

### Root Level
- `npm run dev` - Start all apps in development mode
- `npm run redis:up` - Start Redis using Docker
- `npm run redis:down` - Stop Redis container
- `npm run redis:logs` - View Redis logs

### Individual Apps
- `npm run start:dev --prefix apps/api` - Start API only
- `npm run dev --prefix apps/web` - Start web app only
- `npm run dev --prefix apps/worker` - Start worker only

## Troubleshooting

### Redis Connection Error

If you see `ECONNREFUSED 127.0.0.1:6379`, Redis is not running. 

**Solution**: Start Redis using Docker:
```bash
npm run redis:up
```

Or verify Redis is running locally:
```bash
redis-cli ping
# Should return: PONG
```

### Port Conflicts

- API runs on port `3001`
- Web runs on port `3000`
- Redis runs on port `6379`

Make sure these ports are available or update the configuration files.

## Environment Variables

Create `.env` files in each app directory as needed:

- `apps/api/.env` - API configuration
- `apps/web/.env` - Web app configuration
- `apps/worker/.env` - Worker configuration (optional, uses `REDIS_URL`)

Example:
```
REDIS_URL=redis://127.0.0.1:6379
DATABASE_URL=postgresql://user:password@localhost:5432/taskmanager
```

## License

UNLICENSED


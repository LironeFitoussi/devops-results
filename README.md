# MERN Stack Template with Auth0

A production-ready MERN (MongoDB, Express 5, React 19, Node.js) stack template with Auth0 authentication, Docker Compose development workflow, and atomic design system.

## Features

### Authentication
- **Auth0 Integration** — JWT-based authentication via `express-oauth2-jwt-bearer`
- **Auto User Creation** — Users are created in MongoDB on first login
- **Protected Routes** — Route-level auth with role-based access (`admin`, `user`)
- **Token Management** — Silent token refresh, automatic `Authorization` header injection

### Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | React 19, Vite 7, TypeScript, React Router v7, Redux Toolkit, TanStack Query, Axios, Framer Motion, Tailwind CSS v4, Radix UI |
| **Backend** | Node.js, Express 5, TypeScript, Mongoose, Zod 4, express-oauth2-jwt-bearer |
| **Infrastructure** | Docker Compose with `watch` (live sync), multi-stage Dockerfiles, NGINX production builds |
| **Testing** | Vitest 4, React Testing Library, jsdom |
| **Tooling** | ESLint 9, tsc-alias, Claude Code hooks (auto-lint, auto-test) |

### Design System
- **Tailwind CSS v4** with `class-variance-authority` and `tailwind-merge`
- **Radix UI** primitives (Avatar, Checkbox, Dropdown Menu)
- **Framer Motion** animations
- **Atomic Design** structure: Atoms, Molecules, Organisms
- **Lucide React** and **React Icons** for iconography

See [docs/DESIGN_SYSTEM.md](./docs/DESIGN_SYSTEM.md) for full guidelines.

## Prerequisites

- Node.js v18+
- Docker Desktop (for Docker workflow) or MongoDB (local/Atlas)
- Auth0 account ([auth0.com](https://auth0.com))

## Quick Start

### 1. Clone

```bash
git clone https://github.com/LironeFitoussi/mern-ts-tempalte-2.git
cd mern-ts-tempalte-2
```

### 2. Setup Auth0

1. Create an **Application** (Single Page Application) in Auth0 dashboard
2. Create an **API** (the audience/identifier)
3. In Application settings, add:
   - **Allowed Callback URLs**: `http://localhost:5173`
   - **Allowed Logout URLs**: `http://localhost:5173`
   - **Allowed Web Origins**: `http://localhost:5173`
4. Note your **Domain**, **Client ID**, and **API Audience**

### 3. Boot the Project

```bash
npm run boot
```

This interactive script will:
- Prompt for Docker container names, image names, ports, and network name
- Copy `.env.example` to `.env` in both `Server/` and `Client/`
- Install dependencies for both projects

Then edit the generated `.env` files with your credentials:

**Server/.env**
```
PORT=3000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/your-app-name
CLIENT_URL=http://localhost:5173
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier
```

**Client/.env**
```
VITE_API_URL=http://localhost:3000/api
VITE_AUTH0_DOMAIN=your-tenant.auth0.com
VITE_AUTH0_CLIENT_ID=your-auth0-client-id
VITE_AUTH0_AUDIENCE=https://your-api-identifier
```

### 4. Start Development

**With Docker (recommended):**
```bash
npm run dev
```
Uses `docker compose watch` for live file syncing — code changes reflect immediately without rebuilds.

**Without Docker:**
```bash
# Terminal 1
cd Server && npm run dev

# Terminal 2
cd Client && npm run dev
```

### Access Points
- **Client**: http://localhost:5173
- **Server**: http://localhost:3000
- **API Proxy**: The Vite dev server proxies `/api` requests to the server (no CORS issues in development)

## Docker

The project uses a split Compose architecture:

```
docker-compose.yml          # Root — includes Server and Client compose files
├── Server/compose.yml      # Server service definition
└── Client/compose.yml      # Client service definition
```

Both services use `docker compose watch`:
- **sync** action for `src/` changes (instant, no rebuild)
- **rebuild** action for `package.json` / `package-lock.json` changes

Dockerfiles are multi-stage: `development` (tsx/vite dev server) → `build` (TypeScript compile) → `production` (node/nginx). Named volumes for `node_modules`. Shared `mern-network` bridge network.

MongoDB is external (Atlas or local) — not containerized.

See [docs/DOCKER.md](./docs/DOCKER.md) for detailed Docker documentation.

## Project Structure

```
mern-ts-tempalte-2/
├── Client/                     # React 19 frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/            # shadcn/Radix base components
│   │   │   ├── Atoms/         # Badge, Card, Heading, etc.
│   │   │   ├── Molecules/     # FeatureCard, Hero, MenuItem, etc.
│   │   │   ├── Organism/      # Footer, Sidebar
│   │   │   ├── AppInitializer.tsx
│   │   │   └── ProtectedRoute.tsx
│   │   ├── config/            # Route configuration
│   │   ├── hooks/             # Custom React hooks
│   │   ├── pages/             # Page components
│   │   ├── redux/             # Redux store and slices
│   │   ├── services/          # Axios API services
│   │   ├── test/              # Test setup
│   │   ├── types/             # TypeScript types
│   │   └── main.tsx           # Entry point
│   ├── Dockerfile             # Multi-stage (dev/build/prod with NGINX)
│   ├── compose.yml            # Docker Compose service definition
│   └── .env.example
│
├── Server/                     # Express 5 backend
│   ├── src/
│   │   ├── config/            # Database connection, env config
│   │   ├── controllers/       # Route controllers
│   │   ├── middleware/        # Auth0 JWT middleware
│   │   ├── models/            # Mongoose models
│   │   ├── routes/            # Express routes
│   │   ├── types/             # TypeScript types
│   │   ├── utils/             # AppError, asyncHandler, errorHandler
│   │   ├── zod/               # Zod validation schemas
│   │   └── server.ts          # Entry point
│   ├── Dockerfile             # Multi-stage (dev/build/prod)
│   ├── compose.yml            # Docker Compose service definition
│   └── .env.example
│
├── scripts/
│   ├── boot.js                # Interactive setup script
│   ├── build.js               # Parallel build for Server + Client
│   ├── check-docker.js        # Docker availability checker
│   └── hooks/
│       ├── lint.js            # Post-edit ESLint hook
│       └── test.js            # Post-edit Vitest hook (test files)
│
├── docs/                       # Documentation
│   ├── TEMPLATE_GUIDE.md      # Comprehensive usage guide
│   ├── DESIGN_SYSTEM.md       # Design system guidelines
│   ├── DOCKER.md              # Docker setup guide
│   └── ...
│
├── docker-compose.yml          # Root compose (includes Server + Client)
├── .mcp.json                   # MCP server configuration for Claude Code
├── .claude/settings.json       # Claude Code hooks configuration
└── package.json                # Root scripts
```

## Available Scripts

### Root Level

| Script | Description |
|--------|-------------|
| `npm run boot` | Interactive setup: Docker config, .env files, dependency install |
| `npm run dev` | Start Docker dev environment with `docker compose watch` |
| `npm run dev:detached` | Start Docker dev environment in background |
| `npm run stop` | Stop all Docker containers |
| `npm run reset` | Stop containers and delete all volumes |
| `npm run logs` | Tail logs from all containers |
| `npm run build` | Build Server and Client in parallel |
| `npm run install:all` | Install dependencies for both projects |
| `npm run test` | Run Vitest in Server and Client |
| `npm run lint` | Run ESLint in Server and Client |
| `npm run docker:ps` | Show running container status |
| `npm run docker:stats` | Show container CPU/memory usage |
| `npm run docker:rebuild` | Clean rebuild: stop, remove volumes, rebuild, start |
| `npm run docker:shell:server` | Open shell in server container |
| `npm run docker:shell:client` | Open shell in client container |
| `npm run docker:logs:server` | Tail server logs only |
| `npm run docker:logs:client` | Tail client logs only |

### Server (`cd Server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start with `tsx --watch` (hot reload) |
| `npm run build` | `tsc -b && tsc-alias` |
| `npm start` | Run production build |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` (watch mode) |
| `npm run lint` | `eslint .` |

### Client (`cd Client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Vite dev server |
| `npm run build` | `tsc -b && vite build` |
| `npm run preview` | Preview production build |
| `npm run test` | `vitest run` |
| `npm run test:watch` | `vitest` (watch mode) |
| `npm run lint` | `eslint .` |

## API Endpoints

### Public

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/health` | Server health check |
| `POST` | `/api/users` | Create user |
| `GET` | `/api/users` | List all users |
| `GET` | `/api/users/:id` | Get user by ID |
| `PATCH` | `/api/users/:id` | Update user |
| `DELETE` | `/api/users/:id` | Delete user |

### Protected (Auth0 JWT required)

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/auth/me` | Get current user by Auth0 sub |
| `GET` | `/api/auth/validate` | Validate JWT token |

### Development Only

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/danger/db-health` | Database connection status |

## Client Routes

| Path | Auth Required | Description |
|------|:---:|-------------|
| `/` | No | Home page |
| `/profile` | Yes | View profile |
| `/profile/settings` | Yes | Profile settings |
| `/profile/preferences` | Yes | User preferences |
| `/dashboard` | Yes | Dashboard overview |
| `/dashboard/analytics` | Yes | Analytics |
| `/dashboard/reports` | Yes | Reports |
| `/settings` | Yes | General settings |
| `/settings/security` | Yes | Security settings |
| `/settings/notifications` | Yes | Notification preferences |

Routes are configured in `Client/src/config/routesConfig.tsx` with sidebar visibility, auth requirements, and role filtering.

## Key Architecture Decisions

### Auth Flow
1. Auth0 authenticates user → `getAccessTokenSilently()` returns JWT
2. JWT set on Axios defaults: `Authorization: Bearer {token}`
3. `fetchUser` thunk calls `GET /api/auth/me`
4. If 404 → auto-creates user via `POST /api/users` → re-fetches

### Middleware Stack (Server)
CORS → Rate Limit (10k/15min) → Morgan → connectDB → JSON parser → URL encoded → Routes → Error Handler

### Error Handling
`AppError` class with `asyncHandler` wrapper. Mongoose and Zod errors auto-transform to `AppError` with proper HTTP status codes.

### Path Aliases
Both Server and Client use `@/*` → `src/*`. Server resolves via `tsc-alias` at build time. Client resolves via Vite config.

## Testing

- **Framework**: Vitest 4
- **Server**: Node environment, `@/` path alias
- **Client**: jsdom environment, React Testing Library, setup file at `src/test/setup.ts`
- **Pattern**: `src/**/*.test.ts` (Server), `src/**/*.test.{ts,tsx}` (Client)

```bash
# Run all tests
npm run test

# Watch mode (from Server/ or Client/)
npm run test:watch
```

## Claude Code Integration

This project is configured for use with [Claude Code](https://claude.com/claude-code).

### MCP Servers (`.mcp.json`)

| Server | Purpose |
|--------|---------|
| `playwright` | Browser automation and UI testing |
| `context7` | Up-to-date library documentation by version |
| `mongodb` | Direct MongoDB queries and schema inspection |
| `github` | Repo management, PRs, issues |
| `auth0` | Auth0 tenant management |
| `eslint` | Linting through Claude Code |

**Required shell environment variables** (not in `.env` files):
- `MONGO_URI` — MongoDB connection string
- `GITHUB_TOKEN` — GitHub Personal Access Token with repo scope

### Hooks (`.claude/settings.json`)

| Trigger | Action |
|---------|--------|
| After `Write`/`Edit` on any file | ESLint auto-runs on the changed file |
| After `Write`/`Edit` on `*.test.*` files | Vitest auto-runs in the relevant directory |

### Slash Commands

Claude Code skills are available for common operations: `/add-crud`, `/add-model`, `/add-page`, `/add-route`, `/add-component`, `/add-middleware`, `/add-service`, `/add-redux-slice`, `/add-test`, `/new-feature`, `/add-docker-service`, `/review`, `/debug`, `/push`, and more. Run `/help` in Claude Code for the full list.

## Customization

### Add a New API Endpoint
1. Controller in `Server/src/controllers/`
2. Zod schema in `Server/src/zod/`
3. Route in `Server/src/routes/` (wrap with `asyncHandler`, add `auth0Middleware` if protected)
4. Register in `Server/src/server.ts`: `app.use("/api/thing", thingRoutes)`

### Add a New Page
1. Page component in `Client/src/pages/`
2. Add to `routeConfig` in `Client/src/config/routesConfig.tsx`
3. API service in `Client/src/services/` if needed

### Extend the User Model
Edit `Server/src/models/userModel.ts` and update the Zod schemas in `Server/src/zod/usersZod.ts`.

## Troubleshooting

**Auth0 login redirect not working**
- Check callback URLs in Auth0 dashboard match `http://localhost:5173`
- Ensure `AUTH0_DOMAIN` doesn't have `https://` prefix

**CORS errors**
- Verify `CLIENT_URL` in `Server/.env` matches the frontend origin
- In Docker, the Vite proxy handles `/api` routing — CORS should not be an issue

**Database connection failed**
- Verify `MONGO_URI` in `Server/.env`
- If using Docker, ensure MongoDB is accessible from the container network

**Token validation failed**
- `AUTH0_AUDIENCE` must match in both Server and Client `.env` files
- Check that the Auth0 API is configured correctly in the dashboard

**Docker containers not starting**
- Run `npm run docker:ps` to check status
- Run `npm run docker:logs:server` or `npm run docker:logs:client` for service-specific logs
- Try `npm run docker:rebuild` for a clean start

## License

ISC

## Contributing

Fork, modify, and use for your projects. Issues and suggestions welcome.

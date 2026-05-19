# Docker Setup Guide

This project includes a Docker setup for development using `docker compose watch` for live file syncing.

## Architecture

- **Client**: React + Vite frontend (port 5173)
- **Server**: Node.js + Express backend (port 3000)
- **Database**: MongoDB Atlas (external — not a Docker service)

## Docker Files

- `docker-compose.yml` — Root compose file, uses `include:` to merge Server and Client compose files
- `Server/compose.yml` — Server service definition
- `Client/compose.yml` — Client service definition
- `Server/Dockerfile` — Multi-stage Dockerfile (development, build, production stages)
- `Client/Dockerfile` — Multi-stage Dockerfile (development, build, production stages)

## Quick Start

### Prerequisites

- Docker Desktop (or Docker Engine + Docker Compose V2)
- MongoDB Atlas connection string

### Development Mode

1. **Run the boot script** (first time only):
   ```bash
   npm run boot
   ```
   This prompts for Docker container names, ports, and creates `.env` files from `.env.example`.

2. **Edit environment variables** in `Server/.env` and `Client/.env`:
   - Set `MONGO_URI` to your MongoDB Atlas connection string
   - Configure Auth0 credentials

3. **Start all services with live sync**:
   ```bash
   npm run dev
   ```

4. **View logs**:
   ```bash
   # All services
   npm run logs

   # Specific service
   npm run docker:logs:server
   npm run docker:logs:client
   ```

5. **Access services**:
   - Client: http://localhost:5173 (API requests are proxied automatically)
   - Server: http://localhost:3000

## Reverse Proxy (Vite)

The frontend uses **Vite's built-in reverse proxy** to forward API requests to the backend:

- All `/api/*` requests are automatically proxied to the backend server
- No CORS issues in development
- Simplified API configuration (use relative URLs)

### How it works:

1. Frontend makes requests to `/api/*` (relative URLs)
2. Vite dev server intercepts these requests
3. Requests are forwarded to the backend server (via Docker network or localhost)
4. Responses are returned to the frontend seamlessly

### Configuration:

- **In Docker**: Proxy target is `http://server:3000` (uses Docker service name via `mern-network`)
- **Locally**: Proxy target is `http://localhost:3000`
- **Custom**: Set `VITE_PROXY_TARGET` environment variable

The API service (`Client/src/services/api.ts`) automatically uses relative URLs in development to leverage the proxy, and full URLs in production.

## Hot Reload (Development)

The development setup uses **`docker compose watch`** for live file syncing:

- **`sync` action**: Changes to `src/` directories are instantly synced into the container (no rebuild)
- **`rebuild` action**: Changes to `package.json` or `package-lock.json` trigger a full container rebuild

### How it works:

1. `npm run dev` runs `docker compose watch`
2. File changes in `src/` are detected and synced into the running container
3. `node_modules` are stored in named Docker volumes (not synced from host)
4. Server uses `tsx --watch` for TypeScript recompilation
5. Client uses Vite's built-in HMR

## Volumes

### Named Volumes

- `server_node_modules` — Server dependencies
- `client_node_modules` — Client dependencies

These volumes keep `node_modules` inside Docker for better performance and avoid conflicts with host OS.

## Networks

- `mern-network` — Bridge network for inter-service communication

The client container reaches the server via Docker DNS at `http://server:3000`.

## Common Commands

See [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) for the full reference. Key commands:

```bash
npm run dev              # Start with live sync
npm run dev:detached     # Start in background
npm run stop             # Stop containers
npm run reset            # Stop + delete volumes
npm run docker:rebuild   # Clean rebuild from scratch
npm run docker:ps        # View container status
npm run logs             # Tail all logs
```

### Execute commands in containers
```bash
npm run docker:shell:server   # Server shell
npm run docker:shell:client   # Client shell
```

## Health Checks

- **Server**: `GET /health` endpoint returns `{ success: true, message: "Server is healthy" }`
- **Database**: `GET /danger/db-health` endpoint (dev only) checks MongoDB Atlas connectivity

View container health status:
```bash
npm run docker:ps
```

## Security Best Practices

### Development
- Source code synced via `docker compose watch`
- MongoDB credentials stored in `Server/.env` (not committed to git)

### Production
- Use multi-stage Dockerfile `production` target
- Non-root user in server container
- Resource limits configured
- Security headers in Nginx (client production stage)
- Environment variables for sensitive data

## Troubleshooting

### Port already in use
```bash
# Change ports in Server/.env and Client/.env, then rebuild
npm run docker:rebuild
```

### Container won't start
```bash
# Check logs for errors
npm run logs

# Clean rebuild
npm run docker:rebuild
```

### Hot reload not working
- Ensure you started with `npm run dev` (uses `docker compose watch`)
- `npm run dev:detached` does NOT enable live sync — use `npm run dev` instead
- Only `src/` changes are synced; other file changes trigger rebuild
- Check logs: `npm run docker:logs:server` or `npm run docker:logs:client`

### MongoDB Atlas connection issues
- Verify `MONGO_URI` in `Server/.env`
- Check MongoDB Atlas IP whitelist includes your current IP
- Hit `GET /danger/db-health` to check connectivity
- Check server logs: `npm run docker:logs:server`

### Node modules issues
```bash
# Remove volumes and rebuild
npm run docker:rebuild
```

## Environment Variables

Environment variables are split between `Server/.env` and `Client/.env`. See the main [CLAUDE.md](../CLAUDE.md) for the full list.

Key Docker-relevant variables:
- `PORT` — Express server port (default: 3000)
- `MONGO_URI` — MongoDB Atlas connection string
- `CLIENT_URL` — Frontend URL for CORS
- `VITE_PROXY_TARGET` — Custom proxy target (default: auto-detected)

**Note**: In development, `VITE_API_URL` can be left empty to use the reverse proxy.

## Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Docker Compose Watch](https://docs.docker.com/compose/how-tos/file-watch/)
- [Multi-stage Builds](https://docs.docker.com/build/building/multi-stage/)

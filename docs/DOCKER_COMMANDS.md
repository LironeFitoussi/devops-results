# Docker Commands Quick Reference

Quick reference guide for all Docker-related npm scripts.

## Starting & Stopping

```bash
# Start dev environment with live sync (docker compose watch)
npm run dev

# Start dev environment in background
npm run dev:detached

# Stop all containers
npm run stop

# Stop containers and delete all volumes (clean slate)
npm run reset

# Full rebuild: stop, remove volumes, rebuild images, and start
npm run docker:rebuild
```

## Viewing Logs

```bash
# All services
npm run logs

# Server only
npm run docker:logs:server

# Client only
npm run docker:logs:client
```

## Inspection & Debugging

```bash
# View running containers
npm run docker:ps

# View resource usage (CPU, memory)
npm run docker:stats

# Access server container shell
npm run docker:shell:server

# Access client container shell
npm run docker:shell:client
```

## All Scripts Reference

| Script | Command | Description |
|--------|---------|-------------|
| `npm run dev` | `docker compose watch` | Start with live sync (file changes auto-sync) |
| `npm run dev:detached` | `docker compose up -d --build` | Start in background |
| `npm run stop` | `docker compose down` | Stop all containers |
| `npm run logs` | `docker compose logs -f` | Tail logs from all services |
| `npm run reset` | `docker compose down -v` | Stop and delete volumes |
| `npm run docker:ps` | `docker compose ps` | Show container status |
| `npm run docker:stats` | `docker compose stats --no-stream` | Show resource usage |
| `npm run docker:rebuild` | `down -v && up -d --build` | Clean rebuild from scratch |
| `npm run docker:shell:server` | `docker compose exec server sh` | Shell into server container |
| `npm run docker:shell:client` | `docker compose exec client sh` | Shell into client container |
| `npm run docker:logs:server` | `docker compose logs -f server` | Tail server logs |
| `npm run docker:logs:client` | `docker compose logs -f client` | Tail client logs |

## Common Workflows

### First Time Setup
```bash
# 1. Run boot script (configures Docker names, ports, copies .env files)
npm run boot

# 2. Edit Server/.env and Client/.env with your credentials

# 3. Start development environment
npm run dev
```

### Daily Development
```bash
# Start services with live sync
npm run dev

# View logs in another terminal
npm run logs

# Stop when done
npm run stop
```

### After Dependency Changes
```bash
# If you changed package.json, rebuild from scratch
npm run docker:rebuild
```

### Debugging Issues
```bash
# Check container status
npm run docker:ps

# Check logs for errors
npm run docker:logs:server
npm run docker:logs:client

# Access container shell to inspect
npm run docker:shell:server
```

## Troubleshooting

### Services Won't Start
```bash
# Check logs for errors
npm run logs

# Clean rebuild
npm run docker:rebuild
```

### Port Conflicts
```bash
# Check what's using the port
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Change ports in Server/.env and Client/.env, then rebuild
npm run docker:rebuild
```

### Database Connection Issues
MongoDB runs on Atlas (not in Docker). To diagnose:
```bash
# Check server logs for connection errors
npm run docker:logs:server

# Hit the database health endpoint
curl http://localhost:3000/danger/db-health

# Verify MONGO_URI in Server/.env is correct
# Check MongoDB Atlas IP whitelist includes your IP
```

### Hot Reload Not Working
- Ensure you started with `npm run dev` (not `npm run dev:detached`)
- `npm run dev` uses `docker compose watch` which syncs file changes automatically
- Only changes in `src/` directories trigger sync; `package.json` changes trigger a full rebuild
- Check logs for errors: `npm run docker:logs:server` or `npm run docker:logs:client`

## Notes

- **Development mode** uses `docker compose watch` with sync actions for instant file updates
- **MongoDB** is external (Atlas) — not a Docker service
- **Node modules** are stored in named Docker volumes (not bind-mounted from host)
- **Network**: Services communicate via the `mern-network` bridge network
- **Client** proxies `/api/*` requests to `http://server:3000` via Vite config inside Docker

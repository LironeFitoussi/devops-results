# Testing Docker Setup

Quick guide to test your Docker setup.

## Quick Test

### 1. Verify Docker is Running
```bash
docker --version
docker compose version
```

### 2. Run Boot Script (First Time)
```bash
npm run boot
```
This creates `.env` files from `.env.example` and configures Docker container names/ports.

Edit `Server/.env` and set at minimum:
- `MONGO_URI` — MongoDB Atlas connection string
- Auth0 credentials (if testing auth)

### 3. Start Development Environment
```bash
npm run dev
```

This runs `docker compose watch`, which:
- Builds Docker images for client and server
- Starts all services
- Enables live file syncing for `src/` changes

### 4. Check Container Status
```bash
npm run docker:ps
```

You should see:
- Server container — Running
- Client container — Running

### 5. View Logs
```bash
# All services
npm run logs

# Or specific service
npm run docker:logs:server
npm run docker:logs:client
```

### 6. Test Endpoints

#### Health Check
```bash
# Server health
curl http://localhost:3000/health

# Should return: {"success":true,"message":"Server is healthy"}
```

#### Client (Browser)
Open http://localhost:5173 in your browser

#### API via Proxy (from client)
The frontend automatically proxies `/api/*` requests to the backend.

### 7. Test Hot Reload

#### Test Server Hot Reload
1. Edit `Server/src/server.ts`
2. Add a console.log or change a message
3. Check logs: `npm run docker:logs:server`
4. Changes should reflect immediately (synced via `docker compose watch`)

#### Test Client Hot Reload
1. Edit `Client/src/pages/HomePage.tsx`
2. Change some text
3. Save the file
4. Browser should auto-refresh with changes

### 8. Test Database Connection

MongoDB runs on Atlas (not in Docker). To verify connectivity:
```bash
# Hit the database health endpoint
curl http://localhost:3000/danger/db-health

# Or check server logs for connection status
npm run docker:logs:server
```

If connection fails, check:
- `MONGO_URI` in `Server/.env` is correct
- Your IP is whitelisted on MongoDB Atlas

### 9. Clean Up
```bash
# Stop services
npm run stop

# Stop and remove volumes (clean slate)
npm run reset
```

## Success Indicators

- All containers show "Up" status via `npm run docker:ps`
- Server health check returns success
- Client loads at http://localhost:5173
- No errors in logs
- Hot reload works (code changes reflect)

## Common Issues

### Port Already in Use
```bash
# Check what's using the port
# Windows: netstat -ano | findstr :3000
# Linux/Mac: lsof -i :3000

# Change port in Server/.env or Client/.env, then rebuild
npm run docker:rebuild
```

### Containers Won't Start
```bash
# Check logs
npm run logs

# Rebuild from scratch
npm run docker:rebuild
```

### MongoDB Connection Failed
```bash
# Check server logs for connection errors
npm run docker:logs:server

# Verify MONGO_URI in Server/.env points to your Atlas cluster
# Ensure your IP is whitelisted on MongoDB Atlas
```

### Hot Reload Not Working
- Ensure you started with `npm run dev` (not `npm run dev:detached`)
- `docker compose watch` handles file syncing — only `src/` changes are synced
- Check file permissions
- Check logs for errors

## Next Steps

Once everything is working:
1. Configure Auth0 credentials in `Server/.env` and `Client/.env`
2. Test authentication flow
3. Start building your features!

For more details, see:
- [DOCKER.md](./DOCKER.md) — Full Docker documentation
- [DOCKER_COMMANDS.md](./DOCKER_COMMANDS.md) — All available commands

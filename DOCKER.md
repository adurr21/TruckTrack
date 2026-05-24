# Docker Setup Guide for TruckTrack

This guide provides instructions for building and running TruckTrack in Docker, and hosting the image on GitHub Container Registry (GHCR) for private deployment.

## Prerequisites

- Docker and Docker Compose installed
- GitHub account with repository access
- Supabase project with credentials (URL and Anon Key)

## Security: Environment Variables & Secrets

**⚠️ IMPORTANT: Never commit `.env.local` to git or include secrets in the Docker image.**

### How Secrets Work

- **Docker Image**: Contains NO secrets - it's portable and safe
- **Environment Variables**: Passed at runtime, never stored in image
- **GitHub Secrets**: Used for CI/CD, never exposed in image
- **Your Server**: Keeps `.env.local` locally - this file is NEVER committed to git
- **Browser Runtime Config**: The app now loads Supabase browser config from `/runtime-env.js` at request time, so Portainer or Docker runtime env vars are used without rebuilding the image

### Recommended Workflow

1. **For CI/CD**: Add GitHub Secrets (Settings → Secrets and variables)
2. **For Deployment**: Pass env vars at runtime via docker-compose or docker run
3. **On Your Server**: Keep `.env.local` locally in docker-compose directory

## Local Development with Docker

### 1. Build the Docker Image

```bash
npm run docker:build
```

Or manually:

```bash
docker build -t trucktrack:latest .
```

### 2. Set Up Environment Variables

Create a `.env.local` file in the project root with your Supabase credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your actual Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Make sure `.env.local` is in `.gitignore` and NEVER committed to git.**

### 3. Run with Docker Compose

```bash
docker-compose up
```

Access the application at `http://localhost:3000`

To run in detached mode:

```bash
docker-compose up -d
```

To stop:

```bash
docker-compose down
```

## GitHub Container Registry (GHCR) Setup

### 1. Enable GitHub Actions

Ensure GitHub Actions is enabled in your repository settings.

### 2. Create a Personal Access Token (PAT)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token (classic)"
3. Select scopes: `write:packages` (this also grants `read:packages`)
4. Generate and copy the token
5. Store it securely (you'll need it once)

### 3. Automatic Deployment with GitHub Actions

The workflow is already configured in `.github/workflows/docker-build-push.yml`

**Triggers:**
- Pushes to `main` or `develop` branches
- Git tags matching `v*` pattern (e.g., `v1.0.0`)
- Pull requests to `main` or `develop`

**On pull requests:** Images are built but not pushed
**On merge to main/develop:** Images are pushed to GHCR with tags:
- `latest` (for main branch)
- Branch name (e.g., `develop`, `main`)
- Git SHA for traceability

**On git tags:** Semantic versioning tags are created

### 4. Pull from GHCR on Private Docker Server

**Important: The Docker image contains NO secrets - it's safe to pull and store anywhere.**

```bash
# Log in to GHCR
docker login ghcr.io

# When prompted:
# Username: your-github-username
# Password: your-PAT-token

# Pull the image
docker pull ghcr.io/your-username/your-repo:latest

# The image itself has no secrets - secrets are passed at runtime
```

### 5. Run on Private Server with Secrets

**Option A: Command Line (for testing)**
```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co" \
  -e NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key" \
  ghcr.io/your-username/your-repo:latest
```

These variables are read by the running container and exposed to the browser through `/runtime-env.js`, so you do not need to rebuild the image after setting them.

**Option B: Docker Compose (Recommended for Production)**

Create a `.env.local` file **only on your docker server** (never in git):

```bash
# On your server, create:
# docker-compose.prod.yml and .env.local
```

Create `docker-compose.prod.yml`:
```yaml
version: '3.8'

services:
  trucktrack:
    image: ghcr.io/your-username/your-repo:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    env_file:
      - .env.local  # ⚠️ This file stays on your server, NEVER in git
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

Create `.env.local` on your server:
```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

Then run:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

### 5. Docker Compose for Production

Create a `docker-compose.prod.yml` on your docker server:

```yaml
version: '3.8'

services:
  trucktrack:
    image: ghcr.io/your-username/your-repo:latest
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
      - NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}
    env_file:
      - .env.local
    restart: unless-stopped
    healthcheck:
      test: ["CMD", "wget", "--quiet", "--tries=1", "--spider", "http://localhost:3000"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 10s
```

Then run:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Image Size and Performance

The multi-stage build:
- Keeps the final image lean (~300-400MB)
- Only includes production dependencies
- Uses non-root user for security
- Includes health checks
- Implements proper signal handling with dumb-init

## Troubleshooting

### Container won't start
- Check logs: `docker-compose logs trucktrack`
- Verify environment variables are passed correctly
- Ensure Supabase credentials are valid
- Check that .env.local (if used) is readable

### Environment variables not loading in container
- Ensure `.env.local` is in the same directory as `docker-compose.yml`
- Verify `env_file: - .env.local` is in docker-compose
- Or use `-e` flag when running: `docker run -e VAR=value ...`
- Don't forget variables are case-sensitive
- **Do NOT put env vars in the Dockerfile** - always pass at runtime
- If you use Portainer, add the env vars to the container or stack service itself and fully recreate or restart the container after changes
- Verify the running container is serving runtime config by opening `/runtime-env.js` in the browser or curling it from the container host
- If `/runtime-env.js` shows empty values, the vars are not attached to the running container even if they exist elsewhere in Portainer

### Secrets exposed in logs
- Never echo or log environment variables
- Use `env | grep SUPABASE` to test locally, but not in production
- Check docker logs don't contain sensitive data: `docker logs container-name`

### GHCR Authentication Issues
- PAT token may be expired or revoked
- Generate a new token and update Docker login
- Ensure token has `write:packages` scope (includes `read:packages`)
- Token is needed for both pulling private images and pushing new ones

## CI/CD Pipeline Details

The GitHub Actions workflow:
1. Triggers on push/PR to main/develop or on version tags
2. Sets up Docker Buildx for optimized builds
3. Authenticates with GHCR using GitHub Actions secrets
4. Builds image with metadata (tags, labels)
5. Uses GitHub Actions cache for faster subsequent builds
6. Pushes only on non-PR events

## Security Notes

### Secrets Management
- ✅ **Do this**: Pass env vars at runtime via docker-compose or docker run
- ✅ **Do this**: Keep `.env.local` only on your private server, never in git
- ✅ **Do this**: Use PAT tokens with limited scopes for GHCR access
- ❌ **Don't do this**: Include secrets in the Dockerfile
- ❌ **Don't do this**: Commit `.env.local` or `.env` to git
- ❌ **Don't do this**: Use plaintext passwords in docker-compose.yml

### Environment Variables
- Non-root user runs the container
- Health checks ensure container stability
- Environment variables are passed at runtime, not baked into image
- .dockerignore prevents sensitive files from being included
- Use PAT tokens instead of passwords for authentication

### Best Practices
1. **Image is portable**: The built image has NO secrets and can be shared/stored safely
2. **Secrets at runtime**: Add env vars only when deploying the image
3. **Server-side secrets**: Keep `.env.local` protected on your docker server
4. **GitHub Secrets**: Use for CI/CD builds and testing, never exposed in final image
5. **Principle of Least Privilege**: Use GitHub PAT with only `write:packages` scope

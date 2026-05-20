# Installation and Setup Guide

Complete guide for setting up TruckTrack with the latest Next.js, HeroUI, and Docker support.

## Prerequisites

- Node.js 18+ (Node 20 recommended)
- npm or yarn
- Docker and Docker Compose (for containerized deployment)
- A Supabase account and project

## Initial Setup

### 1. Clone and Install

```bash
git clone <repository-url>
cd TruckTrack
npm install
```

### 2. Configure Supabase

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

To find these values:
1. Go to your Supabase project dashboard
2. Click "Settings" → "API"
3. Copy the "Project URL" and "anon/public" key

### 3. Verify Setup

Check that all environment variables are correctly set:

```bash
npm run dev
```

Navigate to [http://localhost:3000](http://localhost:3000). You should see the TruckTrack homepage.

## Development Workflow

### Common Commands

```bash
# Start development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Check for TypeScript errors
npx tsc --noEmit

# Format code
npm run format  # if available
```

### Project Structure

After the refactoring, the key directories are:

- **`app/`** - Next.js 13+ app directory (pages, layouts, API routes)
  - `(auth-pages)/` - Authentication pages (sign-in, sign-up, forgot-password)
  - `protected/` - Protected routes requiring authentication
  - `auth/callback/` - OAuth callback endpoint
- **`components/`** - Reusable React components
  - `ui/` - HeroUI component wrappers
  - `tutorial/` - Tutorial/onboarding components
- **`utils/`** - Utility functions
  - `supabase/` - Supabase client setup and middleware
- **`public/`** - Static assets
- **`middleware.ts`** - Request middleware for session management

## Key Changes from Previous Setup

### UI Framework: Joy UI → HeroUI

**Why HeroUI?**
- More modern and actively maintained
- Better TypeScript support
- Excellent accessibility features
- Seamless Tailwind CSS integration
- Responsive component library

**Component Changes:**
- All Joy UI components replaced with HeroUI equivalents
- Tailwind CSS configuration updated to include HeroUI plugin
- Components now use `@heroui/react` instead of `@mui/joy`

### Next.js Version

The project now uses the latest Next.js with:
- Latest performance optimizations
- Improved middleware support
- Better type safety
- Enhanced React 19 support

### Middleware

The middleware setup in `middleware.ts` and `utils/supabase/middleware.ts` handles:
- Session refresh for Supabase authentication
- Route protection (redirecting unauthenticated users)
- Cookie management for server-side rendering

This is **not deprecated** - it's a core feature of modern Next.js.

## Docker Setup

For complete Docker and GitHub Container Registry setup, see [DOCKER.md](./DOCKER.md).

### Quick Start with Docker

```bash
# Build image
npm run docker:build

# Run locally
npm run docker:run

# Or use Docker Compose
docker-compose up
```

## Deployment Options

### Option 1: Vercel (Recommended)

1. Push your repository to GitHub
2. Connect it to Vercel at [vercel.com](https://vercel.com)
3. Add environment variables in Vercel settings
4. Deploy automatically on every push

### Option 2: Docker + Self-Hosted Server

See [DOCKER.md](./DOCKER.md) for:
- Building Docker images
- Pushing to GitHub Container Registry
- Running on a private docker server

### Option 3: Traditional Node.js Server

```bash
npm run build
npm start
```

Set environment variables before running:

```bash
export NEXT_PUBLIC_SUPABASE_URL="..."
export NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
npm start
```

## Troubleshooting

### Issue: Environment variables not loading

**Solution:** Make sure `.env.local` is in the root directory and restart `npm run dev`

### Issue: Supabase authentication not working

**Solution:** 
- Verify credentials in `.env.local`
- Check Supabase project settings for allowed redirect URLs
- Ensure Supabase is running and accessible

### Issue: Middleware errors

**Solution:**
- Middleware runs on every request - check server logs
- Ensure `updateSession` is properly configured
- Check middleware matcher pattern matches your routes

### Issue: Styles not applying (HeroUI components)

**Solution:**
- Ensure `HeroUIProvider` wraps your app in `layout.tsx`
- Check Tailwind config includes HeroUI content paths
- Clear `.next` build cache and restart dev server

### Issue: Docker build fails

**Solution:**
- Ensure Node.js version specified in Dockerfile matches your system
- Check that all required env vars are available at build time
- Clear Docker cache: `docker system prune`

## Performance Tips

1. **Use Next.js Image Optimization**
   - Import from `next/image` for automatic optimization

2. **Enable Production Build Caching**
   - Docker workflow includes GitHub Actions cache

3. **Monitor Bundle Size**
   - HeroUI is well tree-shaken by default

4. **Enable Security Headers**
   - Already configured in `next.config.ts`

## CI/CD Pipeline

GitHub Actions automatically:
- Builds Docker image on push/PR to main/develop
- Pushes to GHCR on successful merge
- Tags images with semantic versioning
- Uses caching for faster builds

See `.github/workflows/docker-build-push.yml` for details.

## Updates and Maintenance

### Updating Dependencies

```bash
npm update

# For major version updates
npm outdated  # see what's available
npm install package-name@latest
```

### Database Migrations

All changes should be done through Supabase dashboard or migrations:
1. Go to your Supabase project
2. Use the SQL editor for schema changes
3. Or use Supabase CLI for migration management

## Support & Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [HeroUI Documentation](https://heroui.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## Next Steps

1. Customize components to match your branding
2. Add more features as needed
3. Set up custom domain (if self-hosting)
4. Configure backup strategy for your data
5. Monitor application performance and errors

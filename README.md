# TruckTrack

A Next.js web application I designed to help truck drivers track and manage their trip information efficiently and accurately while on the road.

## Features

- 📱 Responsive design that works on desktop and mobile devices
- 🔐 Secure authentication with Supabase
- 📊 Dashboard to view and manage trip entries
- 📝 Easy trip data entry including:
  - Date
  - Truck number
  - Dollie number
  - Origin and destination
  - Trailer numbers
  - Pay sheet numbers
  - Gross pay
- 📤 Export data to CSV for reporting
- 🌓 Light/Dark mode support
- 🐳 Docker support for easy deployment
- ☁️ GitHub Container Registry integration for private hosting

## Tech Stack

- [Next.js](https://nextjs.org/) - Latest React framework for web applications
- [HeroUI](https://heroui.com/) - Modern UI components library
- [Supabase](https://supabase.com/) - Backend and authentication
- [Tailwind CSS](https://tailwindcss.com/) - Utility-first CSS framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Docker](https://www.docker.com/) - Containerization

## Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Create environment file
cp .env.example .env.local

# Add your Supabase credentials to .env.local
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Docker Deployment

For detailed Docker setup and GitHub Container Registry hosting instructions, see [DOCKER.md](./DOCKER.md).

Quick start with Docker:

```bash
# Build image
npm run docker:build

# Run with Docker Compose
docker-compose up
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── (auth-pages)/      # Authentication pages
│   ├── protected/         # Protected routes
│   └── auth/              # API routes for auth
├── components/            # React components
├── utils/                 # Utility functions
└── public/                # Static assets
```

## Authentication

Authentication is handled by Supabase with middleware-based session management. Protected routes automatically redirect unauthenticated users to the sign-in page.

## Deployment

### Vercel (Recommended for Production)

The app is optimized for deployment on Vercel. Connect your GitHub repository and deploy automatically on push.

### Docker (Self-Hosted)

See [DOCKER.md](./DOCKER.md) for:
- Local Docker setup
- GitHub Container Registry hosting
- Private docker server deployment instructions

## Recent Updates

### Refactored to Latest Tech Stack
- ✅ Migrated from Joy UI to HeroUI for modern UI components
- ✅ Updated to latest Next.js with optimized performance
- ✅ Middleware properly configured for latest Next.js versions
- ✅ Added Docker containerization support
- ✅ GitHub Actions workflow for automatic image builds to GHCR
- ✅ Improved TypeScript configuration
- ✅ Streamlined dependencies

## Environment Variables

Create a `.env.local` file based on `.env.example`:

```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Docker commands
npm run docker:build
npm run docker:run
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT

## Support

Created by [Austin Durr](https://austindurr.com)
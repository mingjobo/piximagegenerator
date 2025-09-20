# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a ShipAny Template One project - a Next.js-based SaaS boilerplate with AI capabilities, authentication, payments, and multi-language support. The project uses TypeScript, React 19, and is built for rapid deployment to Vercel or Cloudflare.

## Common Development Commands

### Development
```bash
pnpm dev                    # Start development server with Turbopack
pnpm build                  # Build for production
pnpm start                  # Start production server
pnpm lint                   # Run Next.js linter
```

### Database Management (Drizzle ORM with PostgreSQL)
```bash
pnpm db:generate            # Generate database migrations
pnpm db:migrate             # Run database migrations
pnpm db:studio              # Open Drizzle Studio for database management
pnpm db:push                # Push schema changes to database
```

### Deployment
```bash
# Vercel deployment (automatic with git push)

# Cloudflare deployment (requires cloudflare branch)
pnpm cf:preview             # Preview on Cloudflare
pnpm cf:deploy              # Deploy to Cloudflare
pnpm cf:upload              # Upload to Cloudflare
```

### Docker
```bash
pnpm docker:build           # Build Docker image
```

## Architecture Overview

### Directory Structure
- **`/src/app`**: Next.js 15 app router with internationalization support
  - `[locale]`: Dynamic locale routing for i18n
  - `(default)`: Public-facing pages
  - `(admin)`: Admin dashboard pages
  - `(console)`: User console pages
  - `(docs)`: Documentation pages
  - `api/`: API routes including auth, payments, and demo endpoints

- **`/src/components`**: Reusable React components
  - `ui/`: shadcn/ui components library
  - `blocks/`: Page-level building blocks (hero, features, pricing, etc.)
  - `console/`: Console-specific components
  - `dashboard/`: Dashboard-specific components

- **`/src/db`**: Database configuration using Drizzle ORM
  - `schema.ts`: Database schema definitions
  - `config.ts`: Drizzle configuration
  - `index.ts`: Database connection

- **`/src/i18n`**: Internationalization
  - `messages/`: Translation files for each locale
  - `pages/`: Page-specific content translations

- **`/src/auth`**: NextAuth.js authentication configuration

- **`/src/lib`**: Utility functions and shared logic

### Key Technologies
- **Framework**: Next.js 15 with App Router and Turbopack
- **UI**: React 19, Tailwind CSS v4, shadcn/ui components
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js v5 (beta) with Google/GitHub providers
- **Payments**: Stripe or Creem integration
- **AI**: Multiple AI providers (OpenAI, DeepSeek, Replicate, OpenRouter)
- **Analytics**: Google Analytics, OpenPanel, or Plausible
- **Internationalization**: next-intl with dynamic locale routing
- **Documentation**: Fumadocs MDX

### Environment Configuration
The project uses environment variables for configuration. Copy `.env.example` to `.env.development` or `.env.local` and configure:
- Database connection (`DATABASE_URL`)
- Authentication (`AUTH_SECRET`, provider credentials)
- Payment providers (Stripe/Creem keys)
- Analytics IDs
- Storage configuration (AWS S3 compatible)

### API Routes Pattern
API routes follow RESTful conventions in `/src/app/api/`:
- Authentication: `/api/auth/[...nextauth]`
- Payments: `/api/pay/notify/[provider]`, `/api/checkout`
- User operations: `/api/get-user-info`, `/api/get-user-credits`
- Demo endpoints: `/api/demo/gen-text`, `/api/demo/gen-image`

### State Management
- Server state: Server Components and Server Actions
- Client state: React hooks and context providers
- User session: NextAuth.js session management
- App context: Custom AppContext provider

### Styling Convention
- Tailwind CSS with custom theme configuration in `src/app/theme.css`
- Component variants using class-variance-authority (CVA)
- Consistent use of cn() utility for className merging
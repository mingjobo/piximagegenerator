# Repository Guidelines

## Project Structure & Module Organization
- `src/app`: Next.js routes, layouts, pages.
- `src/components`: Reusable UI and feature components.
- `src/db`: Drizzle config, schema, and migrations (`src/db/schema.ts`, `src/db/migrations`).
- `src/lib`, `src/models`, `src/services`: Helpers, types, domain logic.
- `public`: Static assets. `content/`: Docs/content sources.
- `scripts/`: One‑off scripts (e.g., seeding). `tools/`: Dev utilities.

## Build, Test, and Development Commands
- `pnpm dev`: Start local dev server with Turbopack.
- `pnpm build`: Production build.
- `pnpm start`: Run built app locally.
- `pnpm lint`: Lint with Next/ESLint.
- Database (Drizzle): `pnpm db:generate`, `pnpm db:migrate`, `pnpm db:studio`, `pnpm db:seed`.
- Cloudflare: `pnpm cf:preview`, `pnpm cf:deploy`, `pnpm cf:upload`.
- Docker: `pnpm docker:build`.

## Coding Style & Naming Conventions
- TypeScript strict mode; prefer explicit types for exports.
- Files: kebab-case (e.g., `user-card.tsx`). Components: PascalCase; functions/vars: camelCase.
- Indentation: 2 spaces; keep imports sorted/grouped.
- UI: Tailwind CSS utilities; prefer existing primitives in `src/components/ui`.
- Linting: run `pnpm lint` before committing.

## Testing Guidelines
- No formal test runner configured. For now: focus on lint‑clean code and manual checks.
- Optional: colocate tests as `*.test.ts(x)` near sources; use Vitest/Playwright if added.
- Quick sanity: `node test-px-emoji.js` exercises the emoji pipeline.

## Commit & Pull Request Guidelines
- Commits: follow Conventional Commits (e.g., `feat: ...`, `fix: ...`, `chore: ...`).
- Scope small, descriptive; reference issues: `fix(auth): handle expired tokens (#123)`.
- PRs: clear description, linked issue, setup steps, environment variables touched, screenshots for UI, and migration notes if `src/db/migrations` changes.

## Security & Configuration Tips
- Never commit secrets. Use `.env.local` (local) and keep `.env.example` updated.
- DB: `DATABASE_URL` must point to Postgres; migrations are filtered to `pixelart` schema (see `src/db/config.ts`).
- Cloudflare: copy `wrangler.toml.example` → `wrangler.toml` and set `[vars]` from `.env.production`.
- Verify breaking changes with `pnpm build && pnpm start` before deploying.

## 语言
- 回复、md文档、注释的语言，都用简体中文。
# Eunoia Deployment Notes (DB & Prisma)

## Local development (current)

- Uses SQLite with Prisma (`provider = "sqlite"`).
- Database file: `dev.db`.
- Commands:
  - `npx prisma db push` — sync schema to local SQLite.
  - `npx prisma studio` — inspect data.

## Future production: Supabase on Vercel

When network allows:

1. Update prisma/schema.prisma datasource:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

2. Make sure DATABASE_URL on Vercel points to the Supabase Postgres connection string and includes sslmode if needed.

3. In the Vercel project settings, set the Build Command to:

```bash
npm run db:push && npm run build
```

This will:
- Connect from Vercel to Supabase using DATABASE_URL.
- Apply the Prisma schema to the Postgres database.
- Build the Next.js app afterward.

4. After this, the same Prisma client code in API routes will talk to Supabase in production.

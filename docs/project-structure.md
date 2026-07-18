# Project Structure

Nexora OS is organised as a feature-first monorepo. Keep page-specific code close to the feature it supports and put shared code only in the shared layers below.

```text
apps/
  api/                     # Express API, grouped by module
  web/                     # Next.js web application
    public/
      brand/               # Nexora logo and brand assets
      dashboard/           # Dashboard-only illustrations
      landing/             # Landing-page images and logos
      mascots/             # Reusable penguin/chat animation assets
      scripts/             # Browser scripts loaded by Next.js
    src/
      app/                 # Routes, layouts and global styles
      components/          # Shared visual building blocks
        brand/
        layout/
        providers/
        ui/
      data/                # Local mock/demo data
      features/            # Self-contained product modules
      hooks/               # Reusable React hooks
      lib/                 # Framework-agnostic helpers and runners
      services/            # API clients and external integrations
packages/
  config/                  # Shared configuration
  types/                   # Shared TypeScript contracts
  ui/                      # Shared package-level UI exports
prisma/                    # Schema, migrations and seed data
services/
  ml-nlp/                  # Python ML/NLP service
docs/                      # Architecture and development documentation
```

## Naming rules

- Use `kebab-case` for folders and files: `database-visualizer-page.tsx`.
- Use a descriptive suffix for React files: `*-page.tsx`, `*-form.tsx`, `*-dialog.tsx`, `*-card.tsx`.
- Keep mock data in `src/data/*.mock.ts`.
- Keep HTTP calls in `src/services/*-client.ts`.
- Keep static assets inside the closest public category, never at the public root unless they are site-level files such as `favicon.ico`.
- Avoid generic names such as `helpers.ts`, `common.ts`, or `utils2.ts`; name a file for its responsibility.

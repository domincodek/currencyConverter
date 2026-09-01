## Description

Unit tests - vitest
E2E - playwright
Code formating - Prettier
Styles - mobile first, scss, css variables, rem

## Setup

```bash
npm install
npm run test:e2e:install
cp .env.example .env
npm run dev
```

## Scripts

| Command                    | What it does                       |
| -------------------------- | ---------------------------------- |
| `npm run dev`              | Dev server                         |
| `npm run build`            | Production build                   |
| `npm test`                 | Unit tests (watch)                 |
| `npm run test:run`         | Unit tests once                    |
| `npm run test:e2e:install` | Download Chromium for Playwright   |
| `npm run test:e2e`         | Playwright E2E (API is mocked)     |
| `npm run format`           | Format with Prettier               |
| `npm run format:check`     | Check Prettier without writing     |

E2E tests do not need a real API key.
# shelfr

A Pinterest-style product research tool for tracking purchases. Save products from any website, organise them into collections, compare options, and track decisions from "considering" to "purchased".

## Features

- **Collections** - Organise products into colour-coded collections
- **Product grid** - Responsive image-first grid with multiple view modes (big, medium, compact, list)
- **Decision pipeline** - Move products through considering > shortlisted > winner > purchased
- **URL scraping** - Paste a product URL to auto-extract title, image, price, and shop
- **Compare mode** - Side-by-side comparison table with "pick winner" action
- **Star ratings & sorting** - Rate products 1-5 stars, sort by rating/price/status
- **Price tracking** - Rescrape products to detect price drops
- **Shops table** - Auto-growing reference list of shops per collection
- **Chrome extension** - Save products directly from any product page
- **Mobile responsive** - Full-screen product drawer, touch-friendly controls

## Tech stack

| Layer         | Technology                                            |
| ------------- | ----------------------------------------------------- |
| Monorepo      | Nx                                                    |
| Frontend      | React 19 + TypeScript + Vite                          |
| Styling       | Tailwind CSS                                          |
| Icons         | Remix Icons                                           |
| Backend       | Supabase (Postgres + Auth + Edge Functions + Storage) |
| Component dev | Storybook                                             |

## Project structure

```
apps/
  web/              # Main SPA
  extension/        # Chrome extension (Manifest V3)
libs/
  ui/               # Shared component library with Storybook stories
  shared/           # Supabase client, types, utilities
supabase/
  migrations/       # SQL schema migrations
  functions/        # Edge functions (scrape-url)
```

## Local development

```bash
npm install
npm start                    # Dev server on localhost:4200
npm run storybook            # Component dev on localhost:6006
npm run build                # Production build
npm run build:extension      # Build Chrome extension to dist/extension/
```

### Environment variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

These are public client keys — data is protected by Row Level Security policies.

## Chrome extension

```bash
npm run build:extension
```

Load `dist/extension/` as an unpacked extension in `chrome://extensions/` (Developer mode).

## Deployment

The web app deploys to GitHub Pages automatically on push to `main` via GitHub Actions.

**Setup:** In repo Settings > Pages, set Source to "GitHub Actions". Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as repository secrets.

## Future Enhancements

- **Automated price tracking** — Supabase cron job for periodic re-scraping + price drop notifications
- **Tags within collections** — Filter by tags like `#fabric`, `#under-$1500`
- **Shop deduplication indicators** — "Also from [Shop]" when multiple products share a retailer
- **Image storage** — Supabase Storage for image resilience (currently URL-only)
- **Export** — Export collection as shareable link or PDF

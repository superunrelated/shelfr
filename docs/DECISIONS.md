# Technical Decisions

| Decision               | Choice                        | Rationale                                                |
|------------------------|-------------------------------|----------------------------------------------------------|
| **Scraping**           | Supabase Edge Function        | Server-side avoids CORS. Can upgrade to Firecrawl/Cheerio later. |
| **Image storage**      | Store URLs only (to start)    | No re-hosting overhead. Add Supabase Storage later for resilience. |
| **Auth**               | Supabase Auth (email/password) | Built-in Supabase Auth. No external OAuth provider needed. |
| **Grid layout**        | CSS Flexbox (flex-wrap)       | Simple flex-wrap grid. No masonry — keeps layout straightforward and dependency-free. |
| **Client state**       | React Context                 | No external state library. Context providers per domain (auth, collection, product, compare). |
| **Monorepo**           | Nx                            | Manages apps (web, extension) and libs (ui, shared). Task orchestration, dependency graph, caching. |
| **Component dev**      | Storybook                     | Isolated component development and documentation. Co-located `.stories.tsx` files in the ui library. |
| **UI primitives**      | Radix UI                      | Accessible, unstyled primitives for dialogs, selects, tabs, tooltips, etc. Styled with Tailwind. No full component framework overhead. |
| **Icons**              | Remix Icons                   | Clean, consistent icon set. Use `@remixicon/react` for tree-shakeable React components. |
| **Routing**            | react-router-dom              | Standard. Only 3 routes needed (home, collection, auth). |
| **Sharing model**      | Per-collection invite          | Simple email-based invite, viewer/editor roles. No public links needed. |
| **Shops persistence**  | Independent of products        | Shops table is an ever-growing reference. Deleting a product never removes its shop. |
| **Status model**       | Per-product, not per-collection| A collection can have multiple winners/purchases (e.g. "Living Room Refresh" with sofa + rug + lamp). |
| **Price tracking v1**  | Manual refresh button          | Start simple. Automated cron-based tracking is a future enhancement. |
| **Mobile drawer**      | Full-screen modal              | Side drawer doesn't work well on small screens. Full-screen gives room for all content. |
| **No AI integration**  | Excluded from v1               | User preference. Keep it focused on the core bookmarking + decision workflow. |
| **No tags**            | Excluded from v1               | Collection names are sufficient to start. Tags add complexity without clear need yet. |
| **Scrape failure**     | Manual entry fallback          | If URL scraping fails, user can manually enter title/price/shop/image. URL is saved for retry. |
| **Product deletion**   | Card deleted, shop stays       | Shops are an ever-growing reference. Deleting a product never removes its shop entry. |
| **Duplicate URLs**     | Warn and prevent               | Same URL in the same collection is blocked with a warning. Same URL across different collections is allowed. |
| **Supabase dev**       | Direct to hosted project       | No local Supabase CLI. Keep it simple — `.env` with project URL + anon key. |
| **Hosting**            | GitHub Pages                   | Free static hosting. SPA routing handled via 404.html redirect trick. |
| **Testing**            | None for v1                    | Move fast. Add Vitest + Playwright later if needed. |

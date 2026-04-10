# Shelfr - Product Research Bookmarking Tool

## Vision

Shelfr is a Pinterest-style, image-first bookmarking tool for researching products you want to buy. It transforms passive product saving into an active decision-tracking workflow.

## Target Users

- People researching big purchases (furniture, electronics, appliances)
- Shared with specific people (partner, friends) for collaborative decisions

## Core Concept

Each **collection** represents a purchase category (e.g. "Living Room Sofa", "Standing Desk"). Within a collection, each **product** moves through a decision pipeline independently:

```
Considering -> Shortlisted -> Winner -> Purchased
```

Multiple products in the same collection can reach "Winner" or "Purchased" — because a collection like "Living Room Refresh" might have a sofa winner, a rug winner, and a lamp winner, all bought separately.

## Tech Stack

| Layer       | Technology                     |
|-------------|--------------------------------|
| Monorepo    | Nx                             |
| Frontend    | React + TypeScript + Vite      |
| Styling     | Tailwind CSS                   |
| Primitives  | Radix UI                       |
| Icons       | Remix Icons                    |
| Backend/DB  | Supabase (Postgres + Auth + Edge Functions + Storage) |
| State       | React Context                  |
| Grid layout | CSS Flexbox (flex-wrap)        |
| Component dev | Storybook                    |
| Extension   | Chrome Extension (Manifest V3) |

## Key Differentiators

- **Decision pipeline** per product, not just a bookmark — actively tracks where you are in the buying process
- **Shops table** per collection — an ever-growing reference list of where to browse, independent of saved products
- **Compare mode** — side-by-side ranked table of 2-4 products with pros/cons
- **Manual price refresh** — check for price drops on demand
- **Mobile-first** — browse saved items on your phone while in-store

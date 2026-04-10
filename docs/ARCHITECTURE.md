# Application Architecture

## Monorepo Structure (Nx)

Nx manages the monorepo with separate libraries for the design system, shared types, and the main app.

```
shelfr/
├── docs/                        # This documentation
├── apps/
│   ├── web/                     # Main Shelfr web app
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── App.tsx
│   │   │   │   └── routes.tsx
│   │   │   ├── pages/
│   │   │   │   ├── Home.tsx         # All collections grid view
│   │   │   │   ├── Collection.tsx   # Products + shops within a collection
│   │   │   │   └── Auth.tsx         # Login / signup
│   │   │   ├── context/
│   │   │   │   ├── AuthContext.tsx
│   │   │   │   ├── CollectionContext.tsx
│   │   │   │   ├── ProductContext.tsx
│   │   │   │   └── CompareContext.tsx
│   │   │   ├── hooks/
│   │   │   │   ├── useProducts.ts   # Supabase queries for products
│   │   │   │   ├── useCollections.ts
│   │   │   │   └── useShops.ts
│   │   │   ├── main.tsx
│   │   │   └── index.css            # Tailwind directives
│   │   ├── index.html
│   │   ├── vite.config.ts
│   │   └── project.json             # Nx project config
│   └── extension/                   # Chrome extension (separate Nx app)
│       ├── src/
│       │   ├── popup.html
│       │   ├── popup.tsx
│       │   └── background.ts
│       ├── manifest.json            # Manifest V3
│       └── project.json
├── libs/
│   ├── ui/                          # Design system component library
│   │   ├── src/
│   │   │   ├── components/
│   │   │   │   ├── Button/
│   │   │   │   │   ├── Button.tsx
│   │   │   │   │   ├── Button.stories.tsx
│   │   │   │   │   └── index.ts
│   │   │   │   ├── Card/
│   │   │   │   ├── Drawer/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Badge/
│   │   │   │   ├── Input/
│   │   │   │   ├── Grid/
│   │   │   │   └── index.ts         # Barrel export
│   │   │   └── index.ts
│   │   ├── .storybook/
│   │   │   ├── main.ts
│   │   │   └── preview.ts
│   │   └── project.json
│   ├── shared/                      # Shared types, utils, Supabase client
│   │   ├── src/
│   │   │   ├── types.ts
│   │   │   ├── supabase.ts
│   │   │   └── utils.ts
│   │   └── project.json
├── supabase/
│   ├── migrations/                  # SQL migration files
│   └── functions/
│       └── scrape-url/              # Edge function for URL metadata extraction
├── nx.json
├── package.json
├── tailwind.config.ts
└── tsconfig.base.json
```

## Nx Workspace Configuration

### Apps
- **web** — Main Shelfr SPA (Vite + React)
- **extension** — Chrome Extension (Vite + React/vanilla TS)

### Libraries
- **ui** — Design system component library with Storybook. All reusable UI components live here. The web app and extension both import from `@shelfr/ui`.
- **shared** — Shared TypeScript types, Supabase client, utility functions. Imported as `@shelfr/shared`.

### Nx Commands
```bash
npx nx serve web              # Dev server
npx nx build web              # Production build
npx nx storybook ui           # Launch Storybook
npx nx build-storybook ui    # Build static Storybook
npx nx build extension        # Build Chrome extension
npx nx graph                  # Visualise dependency graph
```

## Design System (libs/ui)

A component library with Storybook for isolated development and documentation.

### Core Components

Built on Radix UI primitives for accessibility, keyboard navigation, and focus management — styled with Tailwind.

| Component     | Radix Primitive              | Description                                      |
|---------------|------------------------------|--------------------------------------------------|
| `Button`      | —                            | Primary, secondary, ghost variants               |
| `Card`        | —                            | Product card with image, metadata, status badge   |
| `Badge`       | —                            | Status badges (considering, shortlisted, winner, purchased) |
| `Drawer`      | `@radix-ui/react-dialog`    | Slide-in panel (desktop) / full-screen modal (mobile) |
| `Modal`       | `@radix-ui/react-dialog`    | Dialogs (new collection, confirm delete, etc.)   |
| `Input`       | —                            | Text input, textarea, URL input                  |
| `Grid`        | —                            | Responsive flex-wrap grid for product cards       |
| `Select`      | `@radix-ui/react-select`    | Collection picker, role selector                 |
| `DropdownMenu`| `@radix-ui/react-dropdown-menu` | Card actions, user menu                     |
| `Tooltip`     | `@radix-ui/react-tooltip`   | Price drop info, status explanations             |
| `Popover`     | `@radix-ui/react-popover`   | Colour picker, quick actions                     |
| `Toggle`      | `@radix-ui/react-toggle-group` | Status pipeline buttons                      |
| `AlertDialog` | `@radix-ui/react-alert-dialog` | Delete confirmation                          |
| `Tabs`        | `@radix-ui/react-tabs`      | Products / Shops tab switcher                    |
| `CompareTable`| —                            | Side-by-side product comparison                  |
| `ProConList`  | —                            | Editable pros/cons columns                       |

### Storybook

Each component has a `.stories.tsx` file co-located with it. Storybook serves as:
- Visual documentation of the design system
- Isolated development environment for components
- A way to test all component states (loading, empty, error, etc.)

## State Management (React Context)

Context providers handle client-side state. Each context is focused on a single domain.

- **AuthContext**: current user, login/logout, session
- **CollectionContext**: selected collection, sidebar open/closed
- **ProductContext**: selected product (drawer), product CRUD operations
- **CompareContext**: compare mode, selection set, compare table visibility

Providers are composed at the app root:
```tsx
<AuthProvider>
  <CollectionProvider>
    <ProductProvider>
      <CompareProvider>
        <App />
      </CompareProvider>
    </ProductProvider>
  </CollectionProvider>
</AuthProvider>
```

## Data Flow

```
User action (click, paste URL, etc.)
  │
  ├── UI state change → React Context (setState)
  │
  └── Data mutation → Supabase client (from @shelfr/shared)
        │
        ├── Direct: supabase.from('products').insert(...)
        │
        └── Edge Function: supabase.functions.invoke('scrape-url', { body: { url } })
              │
              └── Returns: { title, image_url, price, shop_name, shop_domain }
```

## URL Scraping (Supabase Edge Function)

The `scrape-url` Edge Function handles server-side metadata extraction:

1. Fetches the URL
2. Parses HTML for:
   - `og:image` meta tag
   - `og:title` meta tag
   - `schema.org/Product` JSON-LD for structured price data
   - Fallback: regex for common price patterns (`$X.XX`)
3. Extracts domain for shop name
4. Returns structured metadata to the client

This avoids CORS issues and can be upgraded later to use Firecrawl or Cheerio for better reliability.

## Authentication

- Supabase Auth with email/password
- Session management handled by Supabase client
- Chrome extension reads auth token from `chrome.storage` (synced after web app login)

## Key Libraries

| Library               | Purpose                              |
|-----------------------|--------------------------------------|
| nx                    | Monorepo management, task orchestration |
| react                 | UI framework                         |
| react (Context API)   | Client state management              |
| @radix-ui/*           | Accessible UI primitives (dialog, select, tabs, etc.) |
| @supabase/supabase-js | Database, auth, edge functions       |
| react-router-dom      | Routing (home, collection, auth)     |
| remixicon / @remixicon/react | Icon set                       |
| tailwindcss           | Utility-first CSS                    |
| storybook             | Component development & documentation |

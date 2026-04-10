# Implementation Phases

## Phase 1 — Core Web App

**Goal**: Working app with auth, collections, product grid, drawer, and status flow.

### Tasks

1. **Project scaffold**
   - Nx workspace setup with apps/web and libs/ui, libs/shared
   - Vite + React + TypeScript for the web app
   - Tailwind CSS configuration (shared across workspace)
   - Storybook setup in libs/ui
   - Supabase client initialization in libs/shared
   - Router setup (react-router-dom)

2. **Supabase setup**
   - Create tables: `collections`, `products`, `shops`, `collection_members`
   - Configure Row Level Security policies
   - Set up Supabase Auth (email/password)

3. **Auth pages**
   - Login page (email/password)
   - AuthContext provider for session state
   - Protected route wrapper

4. **Collections (Home page)**
   - Collection grid with 2x2 image mosaic cards
   - "New Collection" modal (name + colour picker)
   - Collection CRUD operations

5. **Product grid**
   - Flex-wrap grid layout (CSS flexbox, no masonry)
   - Product cards built as `@shelfr/ui` components with Storybook stories
   - Responsive columns (2/3/4/5)
   - Winner gold ring highlight

6. **Product drawer**
   - Slide-in panel from right
   - Image, shop, price, status buttons, notes textarea, pros/cons
   - Auto-save to Supabase on change
   - "View on shop site" link

7. **Decision flow**
   - Status buttons in drawer (considering -> shortlisted -> winner -> purchased)
   - Status badges on cards
   - Visual differentiation for winners and purchased items

---

## Phase 2 — URL Ingestion

**Goal**: Add products by pasting URLs with automatic metadata extraction.

### Tasks

1. **Supabase Edge Function: `scrape-url`**
   - Accept a URL, fetch it server-side
   - Parse og:image, og:title, schema.org/Product price
   - Fallback regex for price patterns
   - Return structured metadata

2. **Add product flow**
   - URL input bar at bottom of page
   - Call edge function on submit
   - Create product with scraped data
   - Auto-create shop entry if domain is new to the collection

3. **Loading/error states**
   - Skeleton card while scraping
   - Error handling for invalid URLs or scrape failures
   - Manual edit fallback for title/price if scraping fails

---

## Phase 3 — Compare Mode + Shops + Price Refresh

**Goal**: Comparison workflow, shops reference table, and manual price checking.

### Tasks

1. **Compare mode**
   - Toggle compare mode from top bar
   - Card selection with checkboxes (2-4 products)
   - Comparison table: ranked by price, with thumbnail, pros/cons, status
   - "Pick winner" action from compare view

2. **Shops table**
   - Separate tab per collection
   - List all shops with domain and product count
   - Manual "Add shop" form
   - Auto-add shops when products are added from new domains
   - Shops persist independently of products

3. **Manual price refresh**
   - "Refresh price" button in drawer
   - Calls edge function to re-scrape current price
   - Price drop badge on card
   - "Was $X - saved $Y" display in drawer
   - Update `price_checked_at` timestamp

---

## Phase 4 — Sharing & Collaboration

**Goal**: Share collections with specific people.

### Tasks

1. **Invite system**
   - Invite by email from collection settings
   - Supabase auth invite for new users
   - Role selection: viewer or editor

2. **Shared collection UX**
   - Collaborator avatars on collection cards
   - Activity context in drawer ("Sarah added this - 2 days ago")
   - Permission-based UI (hide edit controls for viewers)

3. **RLS policy updates**
   - Ensure collection_members are respected in all queries
   - Editor vs viewer permission enforcement

---

## Phase 5 — Chrome Extension

**Goal**: Save products directly from any product page.

### Tasks

1. **Extension scaffold**
   - Manifest V3 setup as separate Nx app (apps/extension)
   - Vite build config for extension
   - Popup UI reusing `@shelfr/ui` components where possible

2. **Content scraping**
   - Read active tab DOM for og:image, og:title, price
   - Display preview in popup

3. **Save flow**
   - Collection picker dropdown
   - "Save" button calls Supabase API with stored auth token
   - Success/error feedback

4. **Auth bridge**
   - After web app login, sync session to `chrome.storage`
   - Extension reads stored token for API calls

---

## Phase 6 — Mobile Polish

**Goal**: Ensure excellent mobile experience for in-store browsing.

### Tasks

1. **Mobile drawer**
   - Replace side drawer with full-screen modal on mobile
   - Swipe-to-dismiss gesture

2. **Touch optimisation**
   - Larger tap targets
   - Pull-to-refresh on product grid
   - Smooth transitions and animations

3. **PWA consideration** (optional)
   - Service worker for offline product browsing
   - Add to home screen prompt

---

## Future Enhancements (Post-MVP)

- **Automated price tracking**: Supabase cron job for periodic re-scraping + price drop notifications
- **Tags within collections**: Filter by tags like `#fabric`, `#under-$1500`
- **Shop deduplication indicators**: "Also from [Shop]" when multiple products share a retailer
- **Image storage**: Supabase Storage for image resilience (currently URL-only)
- **Export**: Export collection as shareable link or PDF

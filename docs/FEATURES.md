# Features Specification

## 1. Adding a Product

### Via URL Paste (web app)
- Bottom bar has a URL input field
- User pastes a product URL and hits Enter or clicks "Add"
- A Supabase Edge Function scrapes the page server-side (avoids CORS):
  - `og:image` for the product image
  - Price via `schema.org/Product` structured data or regex patterns (`$29.99`)
  - `og:title` for the product title
  - Domain -> friendly shop name
- **Duplicate detection**: If the URL already exists in the collection, warn the user instead of creating a duplicate
- Product is created with status `considering`
- If the shop domain is new for this collection, a shop entry is auto-created

### Scrape failure fallback
- If the edge function fails to extract metadata, show a manual entry form
- User fills in: title, price, shop name, and can upload/paste an image URL
- The source URL is still saved so scraping can be retried later

### Via Chrome Extension
- Popup appears on any page
- Shows scraped image + title + price from the active tab
- Dropdown to pick a collection
- "Save" button calls Supabase API directly using stored auth token
- Auth: user logs into web app, extension reads Supabase session from `chrome.storage`

## 2. Product Grid (Pinterest-style)

- Responsive flex-wrap grid layout (CSS flexbox)
- Each card shows:
  - Product image (fills card width)
  - Shop name (small, grey)
  - Product title (truncated to 2 lines)
  - Price (bold) + price drop badge if applicable
  - Status badge (top-right corner):
    - Considering: grey
    - Shortlisted: blue
    - Winner: amber with crown
    - Purchased: green with checkmark
- Winner cards have a subtle gold ring/border
- Responsive columns: 2 (mobile) / 3 (sm) / 4 (lg) / 5 (xl)

## 3. Product Drawer

Slides in from the right when a card is clicked (no page navigation).

Contents:
- **Large product image** (top)
- **Shop name** + favicon
- **Product title**
- **Price** + "Refresh price" button + savings indicator
- **Decision status** — clickable pipeline buttons to change status
- **Notes** — textarea, auto-saves to Supabase
- **Pros & Cons** — two columns, add items with `+` buttons
- **Link** — "View on shop site" opens original URL

## 4. Decision Flow

Each product has an independent status: `considering` -> `shortlisted` -> `winner` -> `purchased`

- Status is changed from the drawer via clickable status buttons
- Multiple products in a collection can be winners or purchased
- Purchased items stay visible in the grid with a checkmark overlay (not archived)
- Winners get a gold ring highlight in the grid

## 5. Price Tracking

### Phase 1 (Manual)
- "Refresh price" button in the drawer
- Calls a Supabase Edge Function that re-scrapes the product URL for current price
- If price has dropped, shows a "down $X" badge on the card and "Was $X - saved $Y" in the drawer
- Records `price_checked_at` timestamp

### Phase 2 (Automated - future)
- Supabase cron job periodically re-scrapes saved product URLs
- Price drop notifications (in-app badge at minimum)

## 6. Compare Mode

- "Compare" button in the top bar activates compare mode
- Cards show selection checkboxes — select 2-4 products
- "Compare now" reveals a ranked comparison table:
  - Sorted by price (lowest first)
  - Columns: rank, thumbnail, product name, price (+ drop indicator), shop, status, pros, cons
  - Rank #1 gets a gold highlight
- "Pick winner" action available from compare view to set status directly

## 7. Shops Table

- Separate tab per collection ("Products" | "Shops")
- Shows all shops discovered for this collection
- Columns: shop name, domain, number of products saved
- Shops persist even when products are removed — an ever-growing reference list
- Manual "Add shop" form: name + URL (optional)
- Shops are auto-added when new products come from new domains

## 8. Collections

### Home View
- Grid of collection cards
- Each card shows a 2x2 mosaic of latest product images
- Collection name + product count
- Colour dot indicator

### Management
- "New Collection" button opens a modal (name + colour)
- Collections can be shared (see Sharing)

## 9. Sharing & Collaboration

- Invite by email — recipient gets a Supabase auth invite
- Roles per collection:
  - **Viewer**: can browse and comment
  - **Editor**: can add products, change status, manage shops
- Shared collections show collaborator avatars on the collection card
- Simple activity context: "Sarah added this - 2 days ago"

## 10. Star Rating & Sorting

### Rating
- Each product has a 1-5 star rating (0 = not rated)
- Stars are clickable on product cards (top-left overlay on the image) and in the drawer
- Click the same star again to unrate (back to 0)

### Sorting
- Sort bar below the tabs with three options: Stars, Price, Status
  - **Stars**: highest first, not-rated items sort last
  - **Price**: lowest first
  - **Status**: purchased > winner > shortlisted > considering

### View Modes
- Three view modes toggled from the sort bar:
  - **Big grid**: 1-4 columns, landscape images, larger text
  - **Medium grid**: 2-5 columns, portrait images, compact
  - **List**: horizontal rows with thumbnail, name, status, stars, price

## 11. Product Deletion

- Deleting a product removes the card from the grid
- The shop entry is **never** removed — shops persist as an ever-growing reference list
- Confirmation prompt before deletion

## 11. Mobile-First Design

- Sidebar collapses behind a hamburger menu on mobile
- Grid is 2 columns on small screens
- Drawer becomes a full-screen modal on mobile (instead of side panel)
- Touch-friendly tap targets
- Primary use case: browsing saved items while in-store

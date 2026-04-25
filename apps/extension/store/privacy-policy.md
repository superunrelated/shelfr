# Shelfr Privacy Policy

**Last updated:** April 2026

## What data we collect

When you use the Shelfr Chrome extension:

- **Active tab URL, title, and product data** — read **only when you click "Add to shelf"** (or open the popup on a page). The extension runs a small extractor in the active tab to find the product's title, image(s), price, currency, and shop name from the page's structured data (JSON-LD, Open Graph / Twitter Card meta tags, microdata) and visible markup. Nothing is read in the background or before you click.
- **Collection preference** — your last selected collection is stored locally in Chrome's storage so it's remembered between sessions.
- **Authentication tokens** — your Supabase auth tokens are stored by the extension so you stay signed in.

When you use the Shelfr web app:

- **Email and password** — used for authentication via Supabase Auth.
- **Product data** — titles, prices, images, URLs, notes, and ratings you add to your collections.

## What we don't collect

- We do not track your browsing history
- We do not collect analytics or telemetry
- We do not share any data with third parties
- We do not run ads
- The extension does not phone home; the only network requests are to your own Supabase project

## How product data flows

1. You click the Shelfr extension icon on a product page.
2. The extension reads structured data and visible product markup from that single page (active tab only).
3. When you click "Add to shelf", the page URL plus the extracted data is sent to a Supabase Edge Function on your project. The edge function fetches the page server-side once to rehost the chosen product image into your project's storage bucket (so it stays available later even if the original site removes it).
4. The product row is written to your Supabase database, where the web app shows it immediately via real-time updates.

## Where data is stored

All user data is stored in a Supabase-hosted PostgreSQL database secured with Row Level Security policies. Each user can only access their own data and collections they've been invited to.

Local extension storage (your collection preference and auth tokens) stays on your device and is never transmitted to anyone other than Supabase Auth.

## Data deletion

You can delete individual products, collections, or your entire account at any time. Deleting your account removes all associated data.

## Permissions explained

- **activeTab** — grants the extension a one-time read of the current tab's URL and DOM, only triggered by your click on the extension icon. It does not give background access to your browsing.
- **scripting** — required so the extension can run the product-data extractor inside the active tab when you click. It uses this _only_ on the tab you're already looking at, _only_ in response to your click, and _only_ to read product fields (title, image, price, currency, shop name).
- **storage** — stores your last selected collection ID and Supabase auth tokens locally in Chrome.
- **host permissions for `*.supabase.co`** — needed to talk to the Supabase backend that holds your collections.
- **host permissions + content script for `superunrelated.github.io/shelfr/*` (and `localhost:4200/*` during development)** — a tiny content script that runs only on the Shelfr web app's own origin. Its sole job is to bridge sign-in: when you sign in to the extension, the web app picks up the same session, and vice-versa. It does not run on any other site.

## Contact

For questions about this privacy policy, open an issue at https://github.com/superunrelated/shelfr/issues

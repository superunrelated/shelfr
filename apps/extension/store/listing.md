# Chrome Web Store Listing

## Name

Shelfr - Product Research Bookmarks

## Short description (132 chars max)

Save products from any store, organise into collections, compare options, and track your decisions from browsing to buying.

## Detailed description

Shelfr is a visual bookmarking tool for product research. When you're shopping for furniture, electronics, appliances, or anything that needs careful comparison — Shelfr helps you stay organised.

How it works:

1. Browse any product page and click the Shelfr icon
2. Pick a collection (e.g. "Living Room Sofa", "New Laptop")
3. Review the live preview — title, image, price, and shop are pulled straight from the page you're viewing. If the page has multiple product images, choose the one you want with a single click.
4. Click "Add to shelf" — the product appears instantly in the Shelfr web app

Your saved products are available at https://superunrelated.github.io/shelfr/ where you can:

- Compare products side-by-side in a ranked table
- Rate products with stars and sort by rating, price, or status
- Track each product through a decision pipeline: considering → shortlisted → winner → purchased
- Detect price drops by rescraping product pages
- Share collections with others for collaborative decisions

Features:

- Reads product data directly from the page you're viewing — works even on JavaScript-heavy stores where server-side scrapers fail
- Multi-image preview lets you pick the best photo before saving
- Duplicate detection: if a product is already in the active collection, the extension shows "Already on this shelf" instead of letting you save twice
- Live sync: products you save from the extension appear in the open web app instantly, no refresh needed
- Remembers your last selected collection
- Works on any website
- Clean, minimal interface

Privacy:

- Your data is stored securely in your Supabase account
- No browsing data is collected, logged, or shared
- The extension only inspects a page when you click "Add to shelf" — never in the background
- A small content script runs on the Shelfr web app's own origin (superunrelated.github.io/shelfr and localhost during development) to keep your sign-in synchronised between the extension and the app
- Permissions: activeTab, scripting (read product details from the active tab on click), storage (remember your collection selection)

## Single purpose

Save products from any web page into the user's Shelfr collections for later side-by-side comparison and decision tracking.

## Permission justifications

These match the prompts in the Chrome Web Store developer dashboard. Copy-paste verbatim.

### activeTab justification

Activated only by the user clicking the Shelfr toolbar icon on a product page. The extension uses this one-time access to read the current tab's URL, title, and product details (image, price, currency, shop name) so it can populate the popup preview and save the product. No background access to other tabs is performed or possible.

### scripting justification

Used to inject a small extractor function into the active tab — only on user click, only on the tab the user is already viewing — to read product fields (title, image, price, currency, shop name) from JSON-LD, Open Graph / Twitter Card meta tags, microdata, and visible markup. This is the only way to reliably capture product data on JavaScript-rendered storefronts where server-side scrapers fail. The injected function returns extracted values to the popup; it does not modify the page, write cookies, or persist anything in the page.

### storage justification

Stores the user's last selected collection ID and Supabase authentication tokens in `chrome.storage.local` so the user stays signed in and the popup defaults to their preferred collection between sessions. No browsing data, page contents, or third-party identifiers are stored.

### Host permission justification

- `https://*.supabase.co/*` — the extension calls the user's own Supabase project to read their collection list, save products, and rehost product images to the user's storage bucket.
- `https://superunrelated.github.io/shelfr/*` and `http://localhost:4200/*` (development only) — these are the Shelfr web app's own origins. A tiny content script runs there to bridge authentication: signing in via the extension also signs the user in on the web app and vice-versa. The script does not run on any other site.

### Remote code

No. All JavaScript executed by the extension is bundled in the package. The extension does not load or execute remote code.

## Category

Shopping

## Language

English

## Assets checklist

- [x] store-icon-128.png (128x128)
- [x] promo-large.png (1280x800)
- [x] promo-small.png (440x280)
- [x] screenshot-1280x800-1-add.png — primary "Add to shelf" state
- [x] screenshot-1280x800-2-duplicate.png — duplicate-detection state
- [ ] Optional: regenerate any of the above with `npm run screenshot:store`

## Regenerating screenshots

Screenshots are produced from `screenshot-harness.html` (an HTML replica of the popup overlaid on the `orla.html` mock product page) by `capture.mjs` using Playwright + sharp. Run `npm run screenshot:store` from the repo root after any popup design change. Output is written into this folder as 24-bit PNGs at both 1280×800 and 640×400.

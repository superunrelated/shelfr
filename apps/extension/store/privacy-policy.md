# Shelfr Privacy Policy

**Last updated:** April 2026

## What data we collect

When you use the Shelfr Chrome extension:

- **Current tab URL and title** — read only when you click "Add to shelf". This is used to save the product to your collection.
- **Collection preference** — your last selected collection is stored locally in Chrome's storage so it's remembered between sessions.

When you use the Shelfr web app:

- **Email and password** — used for authentication via Supabase Auth.
- **Product data** — titles, prices, images, URLs, notes, and ratings you add to your collections.

## What we don't collect

- We do not track your browsing history
- We do not collect analytics or telemetry
- We do not share any data with third parties
- We do not run ads

## Where data is stored

All user data is stored in a Supabase-hosted PostgreSQL database secured with Row Level Security policies. Each user can only access their own data and collections they've been invited to.

Local extension storage (your collection preference) stays on your device and is never transmitted.

## Data deletion

You can delete individual products, collections, or your entire account at any time. Deleting your account removes all associated data.

## Permissions explained

- **activeTab** — allows reading the current tab's URL and title when you click the extension icon. No background access.
- **storage** — stores your last selected collection ID locally in Chrome. No sensitive data.

## Contact

For questions about this privacy policy, open an issue at https://github.com/superunrelated/shelfr/issues

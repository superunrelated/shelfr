# Database Schema (Supabase)

## Tables

### `users`

Handled by Supabase Auth (email/password). No custom table needed initially.

### `collections`

| Column          | Type        | Notes                          |
|-----------------|-------------|--------------------------------|
| id              | uuid (PK)   | Default `gen_random_uuid()`    |
| user_id         | uuid (FK)    | References `auth.users(id)`    |
| name            | text         | e.g. "Living Room Sofa"       |
| slug            | text         | URL-friendly name              |
| cover_image_url | text (null)  | Auto-set from latest product   |
| color           | text         | Hex colour for sidebar dot     |
| created_at      | timestamptz  | Default `now()`                |

### `products`

| Column          | Type         | Notes                                |
|-----------------|--------------|--------------------------------------|
| id              | uuid (PK)    | Default `gen_random_uuid()`          |
| user_id         | uuid (FK)    | References `auth.users(id)`          |
| collection_id   | uuid (FK)    | References `collections(id)`         |
| title           | text         | Scraped from `og:title`              |
| price           | numeric      | Current price                        |
| original_price  | numeric      | Price at time of save                |
| currency        | text         | Default `'NZD'`                      |
| shop_name       | text         | Friendly name (e.g. "IKEA")         |
| shop_domain     | text         | e.g. "ikea.com/au"                   |
| source_url      | text         | Original product URL                 |
| image_url       | text         | Scraped from `og:image`              |
| status          | text         | `considering` / `shortlisted` / `winner` / `purchased` |
| notes           | text         | Freeform notes                       |
| pros            | text[]       | Array of pro strings                 |
| cons            | text[]       | Array of con strings                 |
| rating          | smallint     | 0 = not rated, 1-5 stars. Default `0` |
| price_checked_at| timestamptz  | Last time price was refreshed        |
| created_at      | timestamptz  | Default `now()`                      |
| added_by        | uuid (FK)    | Who added this (for shared collections) |

### `shops`

Persists independently of products. Shops are never removed when a product is deleted — this is an ever-growing reference list.

| Column          | Type         | Notes                                |
|-----------------|--------------|--------------------------------------|
| id              | uuid (PK)    | Default `gen_random_uuid()`          |
| collection_id   | uuid (FK)    | References `collections(id)`         |
| name            | text         | e.g. "Harvey Norman"                |
| domain          | text         | e.g. "harveynorman.com.au"          |
| url             | text (null)  | Full URL if provided                 |
| created_at      | timestamptz  | Default `now()`                      |

**Auto-population**: When a product is added, if the shop domain doesn't already exist in the collection's shops table, a new shop entry is created automatically.

### `collection_members` (sharing)

| Column          | Type         | Notes                                |
|-----------------|--------------|--------------------------------------|
| id              | uuid (PK)    | Default `gen_random_uuid()`          |
| collection_id   | uuid (FK)    | References `collections(id)`         |
| user_id         | uuid (FK)    | The invited user                     |
| role            | text         | `viewer` or `editor`                 |
| invited_by      | uuid (FK)    | Who sent the invite                  |
| created_at      | timestamptz  | Default `now()`                      |

## Row Level Security (RLS)

All tables use RLS policies:

- **collections**: Owner has full access. Members can read; editors can update.
- **products**: Access follows parent collection permissions.
- **shops**: Access follows parent collection permissions.
- **collection_members**: Owner of collection can manage. Members can read.

## Indexes

- `products(collection_id, status)` — filter by status within a collection
- `products(collection_id, created_at)` — sort by newest
- `shops(collection_id)` — list shops per collection
- `collection_members(user_id)` — find collections shared with a user

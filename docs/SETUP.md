# Environment & Deployment

## Local Development

Direct connection to hosted Supabase project (no local Supabase CLI needed).

### Environment Variables

Create a `.env` file in the project root:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

These are safe to expose client-side — RLS policies protect the data.

### Running Locally

```bash
npm install
npx nx serve web              # Dev server
npx nx storybook ui           # Storybook for component dev
npx nx build web              # Production build
npx nx graph                  # Visualise dependency graph
```

## Deployment — GitHub Pages

Hosted on GitHub Pages as a static SPA.

### SPA Routing on GitHub Pages

GitHub Pages doesn't support client-side routing out of the box — refreshing on `/collection/sofa` returns a 404. Two things are needed:

1. **404 fallback** — Add a `public/404.html` that redirects to `index.html` with the path preserved as a query param:

```html
<!DOCTYPE html>
<html>
<head>
  <script>
    // Redirect all 404s to index.html with the path preserved
    var path = window.location.pathname + window.location.search + window.location.hash;
    window.location.replace('/' + '?redirect=' + encodeURIComponent(path));
  </script>
</head>
</html>
```

2. **Redirect handler in index.html** — A script in `index.html` (before React mounts) that reads the `?redirect=` param and uses `history.replaceState` to restore the correct URL:

```html
<script>
  (function() {
    var redirect = new URLSearchParams(window.location.search).get('redirect');
    if (redirect) {
      history.replaceState(null, '', decodeURIComponent(redirect));
    }
  })();
</script>
```

### Vite Config for GitHub Pages

Set the `base` path in `vite.config.ts`:

```ts
export default defineConfig({
  base: '/shelfr/',  // matches the repo name: github.com/superunrelated/shelfr
  // ...
})
```

### GitHub Actions Deploy

Use `peaceiris/actions-gh-pages` or the built-in GitHub Pages action:

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      pages: write
      id-token: write
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx nx build web
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      - uses: actions/configure-pages@v4
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist/apps/web
      - uses: actions/deploy-pages@v4
```

### GitHub Repo Secrets

Add these in repo Settings > Secrets and variables > Actions:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

## Testing

No testing in v1. Move fast, add Vitest + Playwright later if needed.

// Captures Chrome Web Store screenshots from screenshot-harness.html.
// Output: 1280x800 and 640x400 PNGs (24-bit, no alpha) in this folder,
// one pair per state listed below.
//
// Usage: npm run screenshot:store
// Requires devDependencies: playwright, sharp

import { chromium } from 'playwright';
import sharp from 'sharp';
import { fileURLToPath, pathToFileURL } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const harness = path.join(here, 'screenshot-harness.html');
const harnessUrl = pathToFileURL(harness).href;

const VIEWPORT = { width: 1280, height: 800 };

// Up to 5 listings allowed by the Chrome Web Store.
const STATES = [
  { id: 'idle', label: '1-add' },
  { id: 'duplicate', label: '2-duplicate' },
];

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: VIEWPORT,
  deviceScaleFactor: 1,
});
const page = await context.newPage();

for (const state of STATES) {
  await page.goto(`${harnessUrl}?state=${state.id}`, {
    waitUntil: 'networkidle',
  });
  await page.waitForTimeout(150);

  const raw = await page.screenshot({
    fullPage: false,
    clip: { x: 0, y: 0, ...VIEWPORT },
    omitBackground: false,
  });

  const out1280 = path.join(here, `screenshot-1280x800-${state.label}.png`);
  const out640 = path.join(here, `screenshot-640x400-${state.label}.png`);

  await sharp(raw)
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9, palette: false })
    .toFile(out1280);

  await sharp(raw)
    .resize(640, 400, { fit: 'fill' })
    .flatten({ background: '#ffffff' })
    .png({ compressionLevel: 9, palette: false })
    .toFile(out640);

  console.log(`✓ ${path.relative(process.cwd(), out1280)}`);
  console.log(`✓ ${path.relative(process.cwd(), out640)}`);
}

await browser.close();

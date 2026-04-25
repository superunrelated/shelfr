// Runs in the page via chrome.scripting.executeScript. Keep this file self-contained:
// the function body is serialised and executed inside the tab, so it cannot close over
// module-level helpers. Everything it needs must live inside `pageExtractor`.

export interface ExtractedProduct {
  title: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  shopName: string | null;
  // Diagnostics — which branch supplied each field, and which branches were even attempted.
  trace: {
    title: string | null;
    image: string | null;
    price: string | null;
    currency: string | null;
    shop: string | null;
    attempted: string[];
    jsonLdCount: number;
    jsonLdErrors: number;
    url: string;
  };
}

export async function extractFromActiveTab(
  tabId: number
): Promise<ExtractedProduct | null> {
  try {
    const [result] = await chrome.scripting.executeScript({
      target: { tabId },
      func: pageExtractor,
    });
    return (result?.result as ExtractedProduct | undefined) ?? null;
  } catch (err) {
    console.warn('[shelfr] executeScript failed', err);
    return null;
  }
}

// Serialised into the page. No imports, no closures over outer scope.
function pageExtractor(): ExtractedProduct {
  const attempted: string[] = [];
  const trace = {
    title: null as string | null,
    image: null as string | null,
    price: null as string | null,
    currency: null as string | null,
    shop: null as string | null,
    attempted,
    jsonLdCount: 0,
    jsonLdErrors: 0,
    url: window.location.href,
  };

  function meta(selector: string): string | null {
    const el = document.querySelector<HTMLMetaElement>(selector);
    const v = el?.content?.trim();
    return v || null;
  }

  function parsePrice(raw: unknown): number | null {
    if (typeof raw === 'number' && isFinite(raw) && raw > 0) return raw;
    if (typeof raw !== 'string') return null;
    const cleaned = raw.replace(/[^\d.,]/g, '').replace(/,(?=\d{3}\b)/g, '');
    const normalised = cleaned.replace(/,/g, '.');
    const n = parseFloat(normalised);
    return isFinite(n) && n > 0 && n < 1_000_000 ? n : null;
  }

  function walkJsonLd(
    node: unknown,
    out: { price?: number; currency?: string; image?: string; name?: string }
  ): void {
    if (!node || typeof node !== 'object') return;
    if (out.price !== undefined && out.currency && out.image && out.name) {
      return;
    }
    if (Array.isArray(node)) {
      for (const item of node) walkJsonLd(item, out);
      return;
    }
    const rec = node as Record<string, unknown>;
    const type = rec['@type'];
    const isProduct =
      type === 'Product' || (Array.isArray(type) && type.includes('Product'));
    const isOffer =
      type === 'Offer' ||
      type === 'AggregateOffer' ||
      (Array.isArray(type) &&
        (type.includes('Offer') || type.includes('AggregateOffer')));

    if (isProduct && typeof rec['name'] === 'string' && !out.name) {
      out.name = rec['name'];
    }
    if (isProduct) {
      const img = rec['image'];
      if (typeof img === 'string' && !out.image) out.image = img;
      else if (Array.isArray(img) && typeof img[0] === 'string' && !out.image) {
        out.image = img[0];
      } else if (
        img &&
        typeof img === 'object' &&
        typeof (img as Record<string, unknown>)['url'] === 'string' &&
        !out.image
      ) {
        out.image = (img as Record<string, unknown>)['url'] as string;
      }
    }
    if (isOffer || isProduct) {
      const p =
        parsePrice(rec['price']) ??
        parsePrice(rec['lowPrice'] as unknown) ??
        null;
      if (p !== null && out.price === undefined) out.price = p;
      const cur = rec['priceCurrency'];
      if (typeof cur === 'string' && !out.currency) out.currency = cur;
    }
    for (const v of Object.values(rec)) {
      if (v && typeof v === 'object') walkJsonLd(v, out);
    }
  }

  // 1) JSON-LD
  attempted.push('json-ld');
  const jsonLd: {
    price?: number;
    currency?: string;
    image?: string;
    name?: string;
  } = {};
  const scripts = document.querySelectorAll<HTMLScriptElement>(
    'script[type="application/ld+json"]'
  );
  trace.jsonLdCount = scripts.length;
  scripts.forEach((s) => {
    try {
      walkJsonLd(JSON.parse(s.textContent ?? ''), jsonLd);
    } catch {
      trace.jsonLdErrors += 1;
    }
  });

  let title: string | null = null;
  let imageUrl: string | null = null;
  let price: number | null = null;
  let currency: string | null = null;
  let shopName: string | null = null;

  if (jsonLd.name) {
    title = jsonLd.name;
    trace.title = 'json-ld';
  }
  if (jsonLd.image) {
    imageUrl = jsonLd.image;
    trace.image = 'json-ld';
  }
  if (typeof jsonLd.price === 'number') {
    price = jsonLd.price;
    trace.price = 'json-ld';
  }
  if (jsonLd.currency) {
    currency = jsonLd.currency;
    trace.currency = 'json-ld';
  }

  // 2) Microdata
  attempted.push('microdata');
  if (!price) {
    const priceEl =
      document.querySelector<HTMLMetaElement>('meta[itemprop="price"]') ??
      document.querySelector<HTMLElement>('[itemprop="price"]');
    const raw =
      priceEl instanceof HTMLMetaElement
        ? priceEl.content
        : ((priceEl as HTMLElement | null)?.getAttribute('content') ??
          (priceEl as HTMLElement | null)?.textContent ??
          null);
    const p = parsePrice(raw);
    if (p !== null) {
      price = p;
      trace.price = 'microdata';
    }
  }
  if (!currency) {
    const curEl =
      document.querySelector<HTMLMetaElement>(
        'meta[itemprop="priceCurrency"]'
      ) ?? document.querySelector<HTMLElement>('[itemprop="priceCurrency"]');
    const cur =
      curEl instanceof HTMLMetaElement
        ? curEl.content
        : ((curEl as HTMLElement | null)?.getAttribute('content') ?? null);
    if (cur) {
      currency = cur;
      trace.currency = 'microdata';
    }
  }
  if (!imageUrl) {
    const imgEl = document.querySelector<HTMLElement>('[itemprop="image"]');
    const src =
      imgEl?.getAttribute('content') ??
      imgEl?.getAttribute('src') ??
      (imgEl instanceof HTMLImageElement ? imgEl.src : null);
    if (src) {
      imageUrl = src;
      trace.image = 'microdata';
    }
  }

  // 3) OG / Twitter / product meta
  attempted.push('og');
  if (!title) {
    const t =
      meta('meta[property="og:title"]') ?? meta('meta[name="twitter:title"]');
    if (t) {
      title = t;
      trace.title = 'og';
    }
  }
  if (!imageUrl) {
    const img =
      meta('meta[property="og:image:secure_url"]') ??
      meta('meta[property="og:image"]') ??
      meta('meta[name="twitter:image"]') ??
      meta('meta[name="twitter:image:src"]');
    if (img) {
      imageUrl = img;
      trace.image = 'og';
    }
  }
  if (!price) {
    const p =
      parsePrice(meta('meta[property="product:price:amount"]')) ??
      parsePrice(meta('meta[property="og:price:amount"]'));
    if (p !== null) {
      price = p;
      trace.price = 'og';
    }
  }
  if (!currency) {
    const cur =
      meta('meta[property="product:price:currency"]') ??
      meta('meta[property="og:price:currency"]');
    if (cur) {
      currency = cur;
      trace.currency = 'og';
    }
  }
  if (!shopName) {
    const site = meta('meta[property="og:site_name"]');
    if (site) {
      shopName = site;
      trace.shop = 'og';
    }
  }

  // 4) Fallbacks
  attempted.push('fallback');
  if (!title) {
    const h1 = document.querySelector('h1')?.textContent?.trim();
    if (h1) {
      title = h1;
      trace.title = 'h1';
    } else if (document.title) {
      title = document.title.trim();
      trace.title = 'document.title';
    }
  }
  if (!shopName) {
    shopName = window.location.hostname.replace(/^www\./, '');
    trace.shop = 'hostname';
  }
  if (!imageUrl) {
    // Largest visible <img> inside a product-ish container. Capped to keep
    // image-gallery pages cheap.
    const MAX_POOL = 200;
    const containers = document.querySelectorAll<HTMLElement>(
      'main, [class*="product" i], [id*="product" i], article'
    );
    let best: { src: string; area: number } | null = null;
    const pool: HTMLImageElement[] = [];
    for (const c of containers) {
      for (const i of c.querySelectorAll('img')) {
        pool.push(i);
        if (pool.length >= MAX_POOL) break;
      }
      if (pool.length >= MAX_POOL) break;
    }
    if (pool.length === 0) {
      for (const i of document.querySelectorAll('img')) {
        pool.push(i);
        if (pool.length >= MAX_POOL) break;
      }
    }
    for (const img of pool) {
      const src = img.currentSrc || img.src;
      if (!src || src.startsWith('data:')) continue;
      if (/sprite|icon|logo|pixel|tracking/i.test(src)) continue;
      const area =
        img.naturalWidth * img.naturalHeight || img.width * img.height;
      if (area > 40_000 && (!best || area > best.area)) {
        best = { src, area };
      }
    }
    if (best) {
      imageUrl = best.src;
      trace.image = 'dom-img';
    }
  }
  if (!price) {
    // Scrape visible text: the first currency-shaped token near the top of the page.
    const textNodes = document.body.innerText.split('\n').slice(0, 400);
    const re = /(?:NZ\$|AU\$|US\$|\$|€|£|¥)\s?([\d,]+(?:\.\d{1,2})?)/;
    for (const line of textNodes) {
      const m = line.match(re);
      if (m) {
        const p = parsePrice(m[1]);
        if (p !== null) {
          price = p;
          trace.price = 'visible-text';
          break;
        }
      }
    }
  }

  // Resolve image to absolute URL.
  if (imageUrl) {
    try {
      imageUrl = new URL(imageUrl, window.location.href).toString();
    } catch {
      /* leave as-is */
    }
  }

  return {
    title,
    imageUrl,
    price,
    currency,
    shopName,
    trace,
  };
}

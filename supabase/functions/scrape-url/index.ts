// Supabase Edge Function: scrape-url
// Fetches a URL and extracts og:title, og:image, price, shop name

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';
import { checkRateLimit } from '../_shared/rate-limit.ts';

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:5173',
  'https://superunrelated.github.io',
];

// Well-known cloud metadata IP that must be blocked for SSRF protection
// eslint-disable-next-line sonarjs/no-hardcoded-ip
const METADATA_IP = '169.254.169.254';

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.startsWith('chrome-extension://');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };
}

function jsonResponse(
  req: Request,
  body: Record<string, unknown>,
  status = 200
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
  });
}

function parseIpv4(host: string): number[] | null {
  const parts = host.split('.').map(Number);
  return parts.length === 4 && parts.every((n) => !isNaN(n)) ? parts : null;
}

function isPrivateIpv4(parts: number[]): string | null {
  if (parts[0] === 127) {
    return 'Localhost URLs are not allowed';
  }
  if (parts[0] === 10) {
    return 'Private IP addresses are not allowed';
  }
  if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
    return 'Private IP addresses are not allowed';
  }
  if (parts[0] === 192 && parts[1] === 168) {
    return 'Private IP addresses are not allowed';
  }
  if (parts[0] === 169 && parts[1] === 254) {
    return 'Link-local addresses are not allowed';
  }
  return null;
}

// SSRF protection: reject URLs that point to internal/private networks
function isUnsafeUrl(urlStr: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(urlStr);
  } catch {
    return 'Invalid URL';
  }
  if (!['http:', 'https:'].includes(parsed.protocol)) {
    return 'Only HTTP/HTTPS URLs are allowed';
  }
  const host = parsed.hostname.toLowerCase();
  if (host === 'localhost' || host === '0.0.0.0') {
    return 'Localhost URLs are not allowed';
  }
  const ipv4 = parseIpv4(host);
  if (ipv4) return isPrivateIpv4(ipv4);
  // Block IPv6 loopback and private ranges
  if (
    host === '::1' ||
    host === '[::1]' ||
    host.startsWith('fe80') ||
    host.startsWith('fc00') ||
    host.startsWith('fd')
  ) {
    return 'Localhost URLs are not allowed';
  }
  // Block alternate IP representations (decimal, octal, hex single-integer)
  if (
    /^\d+$/.test(host) ||
    /^0[xX][0-9a-fA-F]+$/.test(host) ||
    /^0\d+$/.test(host)
  ) {
    return 'Numeric IP addresses are not allowed';
  }
  // Block cloud metadata endpoints
  if (host === METADATA_IP || host === 'metadata.google.internal') {
    return 'Metadata endpoints are not allowed';
  }
  return null;
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i'
    ),
  ];
  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHTMLEntities(match[1]);
  }
  return null;
}

function extractTitle(html: string): string | null {
  const match = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  return match?.[1]?.trim() ? decodeHTMLEntities(match[1].trim()) : null;
}

function parseNumericPrice(val: unknown): number | null {
  if (typeof val === 'number') return val;
  if (typeof val === 'string') {
    const n = parseFloat(val);
    if (!isNaN(n)) return n;
  }
  return null;
}

function extractPrice(html: string): number | null {
  // Try JSON-LD schema.org/Product first
  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      const jsonStr = block.replace(/<\/?script[^>]*>/gi, '');
      try {
        const data = JSON.parse(jsonStr);
        const price = findPrice(data);
        if (price !== null) return price;
      } catch {
        // ignore parse errors
      }
    }
  }

  // Fallback: regex for common price patterns
  const pricePatterns = [
    /\$\s?([\d,]+(?:\.\d{2})?)/,
    /NZ\$\s?([\d,]+(?:\.\d{2})?)/,
    /AU\$\s?([\d,]+(?:\.\d{2})?)/,
    /["']price["']\s*:\s*["']?([\d.]+)["']?/i,
  ];
  for (const pattern of pricePatterns) {
    const match = html.match(pattern);
    if (match?.[1]) {
      const val = parseFloat(match[1].replace(/,/g, ''));
      if (!isNaN(val) && val > 0 && val < 1000000) return val;
    }
  }
  return null;
}

function findPriceInRecord(record: Record<string, unknown>): number | null {
  const price = parseNumericPrice(record['price']);
  if (price !== null) return price;
  if (record['offers']) return findPrice(record['offers']);
  return null;
}

function findPrice(obj: unknown): number | null {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const p = findPrice(item);
      if (p !== null) return p;
    }
    return null;
  }
  const record = obj as Record<string, unknown>;
  if (record['@type'] === 'Product' || record['@type'] === 'Offer') {
    return findPriceInRecord(record);
  }
  const direct = findPriceInRecord(record);
  if (direct !== null) return direct;
  for (const val of Object.values(record)) {
    if (typeof val === 'object' && val !== null) {
      const p = findPrice(val);
      if (p !== null) return p;
    }
  }
  return null;
}

const SKIP_PATTERN = /icon|logo|badge|sprite|pixel|tracking/i;

function isProductImageSrc(src: string): boolean {
  return (
    /product|asset|media|image|upload|cdn/i.test(src) ||
    /w\d{3,}/i.test(src) ||
    /h\d{3,}/i.test(src) ||
    // eslint-disable-next-line sonarjs/slow-regex
    /\d{3,}x\d{3,}/i.test(src)
  );
}

function extractImgSrcs(html: string): string[] {
  const tags = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) ?? [];
  const srcs: string[] = [];
  for (const tag of tags) {
    const m = tag.match(/src=["']([^"']+)["']/i);
    if (m?.[1]) srcs.push(m[1]);
  }
  return srcs;
}

function extractProductImage(html: string): string | null {
  // Try JSON-LD schema.org/Product image
  const jsonLdMatch = html.match(
    /<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi
  );
  if (jsonLdMatch) {
    for (const block of jsonLdMatch) {
      const jsonStr = block.replace(/<\/?script[^>]*>/gi, '');
      try {
        const data = JSON.parse(jsonStr);
        const img = findImage(data);
        if (img) return img;
      } catch {
        /* ignore */
      }
    }
  }

  // Try itemprop="image"
  const itempropMatch =
    html.match(/<img[^>]+itemprop=["']image["'][^>]+src=["']([^"']+)["']/i) ??
    html.match(/<img[^>]+src=["']([^"']+)["'][^>]+itemprop=["']image["']/i);
  if (itempropMatch?.[1]) return itempropMatch[1];

  const srcs = extractImgSrcs(html);
  // Try the largest image in the main content (heuristic: first large image with product-like src)
  for (const src of srcs) {
    if (SKIP_PATTERN.test(src) || /\.(svg|gif)$/i.test(src)) continue;
    if (isProductImageSrc(src)) return src;
  }
  // Last resort: first non-tiny jpg/png/webp
  for (const src of srcs) {
    if (/\.(jpg|jpeg|png|webp)/i.test(src) && !SKIP_PATTERN.test(src)) {
      return src;
    }
  }
  return null;
}

function findImage(obj: unknown): string | null {
  if (!obj || typeof obj !== 'object') return null;
  if (Array.isArray(obj)) {
    for (const item of obj) {
      const img = findImage(item);
      if (img) return img;
    }
    return null;
  }
  const record = obj as Record<string, unknown>;
  if (record['@type'] === 'Product' || record['@type'] === 'ImageObject') {
    if (typeof record['image'] === 'string') return record['image'];
    if (
      Array.isArray(record['image']) &&
      typeof record['image'][0] === 'string'
    ) {
      return record['image'][0];
    }
    if (
      typeof record['url'] === 'string' &&
      record['@type'] === 'ImageObject'
    ) {
      return record['url'];
    }
    if (record['image']) return findImage(record['image']);
  }
  if (typeof record['image'] === 'string') return record['image'];
  if (Array.isArray(record['image'])) return findImage(record['image']);
  return null;
}

function decodeHTMLEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&#x2F;/g, '/');
}

function resolveImageUrl(image: string | null, pageUrl: string): string | null {
  if (!image) return null;
  if (image.startsWith('http')) return image;
  try {
    return new URL(image, pageUrl).toString();
  } catch {
    return image;
  }
}

function getImageCandidates(imgUrl: string, pageUrl: string): string[] {
  const candidates = [imgUrl];
  try {
    const parsed = new URL(imgUrl);
    const pageParsed = new URL(pageUrl);

    if (parsed.hostname !== pageParsed.hostname) {
      const parts = parsed.hostname.split('.');
      for (let i = 1; i < parts.length - 1; i++) {
        const shorter = parts.slice(i).join('.');
        if (shorter.includes('.')) {
          candidates.push(
            `${parsed.protocol}//${shorter}${parsed.pathname}${parsed.search}`
          );
        }
      }
      const pageHost = pageParsed.hostname.replace(/^www\./, '');
      if (!candidates.some((c) => new URL(c).hostname === pageHost)) {
        candidates.push(
          `${parsed.protocol}//${pageHost}${parsed.pathname}${parsed.search}`
        );
      }
    }
  } catch {
    /* ignore */
  }
  return candidates;
}

async function tryFetchImage(
  imgUrl: string,
  referer: string
): Promise<Response | null> {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    const resp = await fetch(imgUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'image/*',
        Referer: referer,
      },
      redirect: 'follow',
      signal: ctrl.signal,
    });
    clearTimeout(t);
    if (resp.ok && resp.headers.get('content-type')?.startsWith('image')) {
      return resp;
    }
    return null;
  } catch (e) {
    console.warn(
      `[image] ${imgUrl} failed: ${e instanceof Error ? e.message : e}`
    );
    return null;
  }
}

const EXT_BY_TYPE: Record<string, string> = {
  png: 'png',
  webp: 'webp',
  gif: 'gif',
  svg: 'svg',
};

function extFromContentType(contentType: string): string {
  for (const [key, ext] of Object.entries(EXT_BY_TYPE)) {
    if (contentType.includes(key)) return ext;
  }
  return 'jpg';
}

async function uploadImageToStorage(
  imgResponse: Response,
  resolvedImageUrl: string
): Promise<string> {
  try {
    const contentType = imgResponse.headers.get('content-type') || 'image/jpeg';
    const ext = extFromContentType(contentType);
    const imageData = await imgResponse.arrayBuffer();
    const fileName = `${crypto.randomUUID()}.${ext}`;

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabase = createClient(supabaseUrl, serviceKey);

    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(fileName, imageData, { contentType, cacheControl: '31536000' });

    if (uploadError) {
      console.error(`[image] upload failed:`, uploadError.message);
      return resolvedImageUrl;
    }
    const { data: publicUrl } = supabase.storage
      .from('product-images')
      .getPublicUrl(fileName);
    return publicUrl.publicUrl;
  } catch (uploadErr) {
    console.error(
      `[image] processing error: ${uploadErr instanceof Error ? uploadErr.message : uploadErr}`
    );
    return resolvedImageUrl;
  }
}

async function storeImage(
  resolvedImageUrl: string | null,
  pageUrl: string
): Promise<string | null> {
  if (!resolvedImageUrl) return null;

  const origin = new URL(pageUrl).origin;
  const candidates = getImageCandidates(resolvedImageUrl, pageUrl);
  let imgResponse: Response | null = null;

  for (const candidate of candidates) {
    imgResponse = await tryFetchImage(candidate, origin + '/');
    if (imgResponse) break;
  }

  if (!imgResponse) {
    console.warn(`[image] all candidates failed, falling back to original URL`);
    return resolvedImageUrl;
  }

  return uploadImageToStorage(imgResponse, resolvedImageUrl);
}

interface ScrapeSources {
  title: string;
  image: string;
  price: string;
  siteName: string;
}

function scrapeMetadata(html: string, url: string) {
  const sources: ScrapeSources = {
    title: 'none',
    image: 'none',
    price: 'none',
    siteName: 'none',
  };

  let title: string | null = extractMeta(html, 'og:title');
  if (title) sources.title = 'og:title';
  if (!title) {
    title = extractMeta(html, 'twitter:title');
    if (title) sources.title = 'twitter:title';
  }
  if (!title) {
    title = extractTitle(html);
    if (title) sources.title = '<title>';
  }

  let image: string | null = extractMeta(html, 'og:image');
  if (image) sources.image = 'og:image';
  if (!image) {
    image = extractMeta(html, 'twitter:image');
    if (image) sources.image = 'twitter:image';
  }
  if (!image) {
    image = extractProductImage(html);
    if (image) sources.image = 'dom-heuristic';
  }

  const price = extractPrice(html);
  if (price !== null) sources.price = 'regex-or-jsonld';

  const siteName = extractMeta(html, 'og:site_name');
  if (siteName) sources.siteName = 'og:site_name';

  const resolvedImageUrl = resolveImageUrl(image, url);
  const domain = new URL(url).hostname.replace(/^www\./, '');

  return { title, resolvedImageUrl, price, siteName, domain, sources };
}

async function fetchPage(url: string): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);
  // Approximate a real Chrome navigation. Many retail sites reject requests
  // whose header signature does not look like a browser (missing sec-ch-ua,
  // wrong Accept-Encoding, no Referer).
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-NZ,en-US;q=0.9,en;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cache-Control': 'max-age=0',
      'Upgrade-Insecure-Requests': '1',
      DNT: '1',
      Referer: 'https://www.google.com/',
      'sec-ch-ua':
        '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
      'sec-ch-ua-mobile': '?0',
      'sec-ch-ua-platform': '"macOS"',
      'sec-fetch-dest': 'document',
      'sec-fetch-mode': 'navigate',
      'sec-fetch-site': 'cross-site',
      'sec-fetch-user': '?1',
    },
    redirect: 'follow',
    signal: controller.signal,
  });
  clearTimeout(timeout);
  return response;
}

interface ScrapeHints {
  imageUrl?: string | null;
  title?: string | null;
  price?: number | null;
  currency?: string | null;
  shopName?: string | null;
}

function sanitiseHints(raw: unknown): ScrapeHints {
  if (!raw || typeof raw !== 'object') return {};
  const r = raw as Record<string, unknown>;
  const out: ScrapeHints = {};
  if (typeof r['imageUrl'] === 'string') out.imageUrl = r['imageUrl'];
  if (typeof r['title'] === 'string') out.title = r['title'];
  if (typeof r['price'] === 'number' && isFinite(r['price'])) {
    out.price = r['price'];
  }
  if (typeof r['currency'] === 'string') out.currency = r['currency'];
  if (typeof r['shopName'] === 'string') out.shopName = r['shopName'];
  return out;
}

function logLine(reqId: string, step: string, data?: unknown) {
  const base = `[scrape-url ${reqId}] ${step}`;
  if (data === undefined) console.log(base);
  else console.log(base, JSON.stringify(data));
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  const reqId = crypto.randomUUID().slice(0, 8);
  const t0 = Date.now();

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      logLine(reqId, 'reject', { reason: 'missing-auth' });
      return jsonResponse(req, { error: 'Missing auth' }, 401);
    }

    // Resolve user for rate limiting
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );
    const {
      data: { user },
    } = await userClient.auth.getUser();
    if (!user) {
      logLine(reqId, 'reject', { reason: 'invalid-auth' });
      return jsonResponse(req, { error: 'Invalid auth' }, 401);
    }

    // 30 scrapes per 10 minutes per user
    const { ok } = await checkRateLimit({
      userId: user.id,
      action: 'scrape',
      windowMinutes: 10,
      maxRequests: 30,
    });
    if (!ok) {
      logLine(reqId, 'reject', { reason: 'rate-limit', userId: user.id });
      return jsonResponse(
        req,
        { error: 'Rate limit exceeded. Try again shortly.' },
        429
      );
    }

    const body = await req.json();
    const { url, hints: rawHints } = body ?? {};
    const hints = sanitiseHints(rawHints);
    if (!url || typeof url !== 'string') {
      logLine(reqId, 'reject', { reason: 'missing-url' });
      return jsonResponse(req, { error: 'URL is required' }, 400);
    }

    const unsafeReason = isUnsafeUrl(url);
    if (unsafeReason) {
      logLine(reqId, 'reject', { reason: 'unsafe-url', url, unsafeReason });
      return jsonResponse(req, { error: unsafeReason }, 400);
    }

    logLine(reqId, 'start', {
      url,
      hints: {
        hasImageUrl: !!hints.imageUrl,
        hasTitle: !!hints.title,
        hasPrice: hints.price !== undefined && hints.price !== null,
        hasCurrency: !!hints.currency,
        hasShopName: !!hints.shopName,
      },
    });

    const domain = new URL(url).hostname.replace(/^www\./, '');

    // Skip HTML scrape entirely when the client provided everything we need.
    const hintsComplete =
      !!hints.imageUrl &&
      !!hints.title &&
      typeof hints.price === 'number' &&
      !!hints.shopName;

    let title: string | null = hints.title ?? null;
    let resolvedImageUrl: string | null = hints.imageUrl ?? null;
    let price: number | null =
      typeof hints.price === 'number' ? hints.price : null;
    let siteName: string | null = hints.shopName ?? null;
    let sources: ScrapeSources | null = null;
    let htmlLen = 0;
    let fetchMs = 0;

    if (hintsComplete) {
      logLine(reqId, 'scrape-skipped', { reason: 'hints-complete' });
    } else {
      const tFetch = Date.now();
      const response = await fetchPage(url);
      fetchMs = Date.now() - tFetch;
      if (!response.ok) {
        const haveAnyHint =
          !!resolvedImageUrl || !!title || price !== null || !!siteName;
        logLine(reqId, 'fetch-fail', {
          status: response.status,
          fetchMs,
          continuingWithHints: haveAnyHint,
        });
        if (!haveAnyHint) {
          return jsonResponse(
            req,
            { error: `Failed to fetch: ${response.status}` },
            502
          );
        }
      } else {
        const html = await response.text();
        htmlLen = html.length;
        const scraped = scrapeMetadata(html, url);
        sources = scraped.sources;
        if (!title) title = scraped.title;
        if (!resolvedImageUrl) resolvedImageUrl = scraped.resolvedImageUrl;
        if (price === null) price = scraped.price;
        if (!siteName) siteName = scraped.siteName;
        logLine(reqId, 'scrape-done', {
          fetchMs,
          htmlLen,
          sources,
          haveTitle: !!title,
          haveImage: !!resolvedImageUrl,
          havePrice: price !== null,
        });
      }
    }

    const tStore = Date.now();
    const storedImageUrl = await storeImage(resolvedImageUrl, url);
    const storeMs = Date.now() - tStore;
    const rehosted =
      !!storedImageUrl &&
      !!resolvedImageUrl &&
      storedImageUrl !== resolvedImageUrl;
    logLine(reqId, 'store-image', {
      storeMs,
      hadImage: !!resolvedImageUrl,
      rehosted,
    });

    const result = {
      title: title ?? null,
      image_url: storedImageUrl ?? resolvedImageUrl ?? null,
      price: price ?? null,
      currency: hints.currency ?? null,
      shop_name: siteName ?? domain,
      shop_domain: domain,
      _debug: { reqId, sources, fetchMs, htmlLen, storeMs, hintsComplete },
    };
    logLine(reqId, 'done', {
      totalMs: Date.now() - t0,
      result: {
        haveTitle: !!result.title,
        haveImage: !!result.image_url,
        havePrice: result.price !== null,
      },
    });
    return jsonResponse(req, result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message.includes('abort');
    logLine(reqId, 'error', { message, isTimeout, totalMs: Date.now() - t0 });
    return jsonResponse(
      req,
      {
        error: isTimeout
          ? 'This site took too long to respond. You can fill in the details manually.'
          : `Could not fetch this page. You can fill in the details manually. (${message})`,
      },
      isTimeout ? 504 : 500
    );
  }
});

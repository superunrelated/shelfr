// Supabase Edge Function: scrape-url
// Fetches a URL and extracts og:title, og:image, price, shop name

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.0';

const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:5173',
  'https://superunrelated.github.io',
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  const allowed =
    ALLOWED_ORIGINS.includes(origin) ||
    origin.startsWith('chrome-extension://');
  return {
    'Access-Control-Allow-Origin': allowed ? origin : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };
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
  // Block localhost
  if (
    host === 'localhost' ||
    host === '127.0.0.1' ||
    host === '::1' ||
    host === '0.0.0.0'
  ) {
    return 'Localhost URLs are not allowed';
  }
  // Block cloud metadata endpoints
  if (host === '169.254.169.254' || host === 'metadata.google.internal') {
    return 'Metadata endpoints are not allowed';
  }
  // Block private IP ranges
  const parts = host.split('.').map(Number);
  if (parts.length === 4 && parts.every((n) => !isNaN(n))) {
    if (parts[0] === 10) return 'Private IP addresses are not allowed';
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) {
      return 'Private IP addresses are not allowed';
    }
    if (parts[0] === 192 && parts[1] === 168) {
      return 'Private IP addresses are not allowed';
    }
  }
  return null;
}

function extractMeta(html: string, property: string): string | null {
  // Match <meta property="og:title" content="..."> or <meta name="..." content="...">
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
  // Check if this object has offers.price or price directly
  if (record['@type'] === 'Product' || record['@type'] === 'Offer') {
    if (typeof record['price'] === 'number') return record['price'];
    if (typeof record['price'] === 'string') {
      const val = parseFloat(record['price']);
      if (!isNaN(val)) return val;
    }
    if (record['offers']) return findPrice(record['offers']);
  }
  if (typeof record['price'] === 'number') return record['price'];
  if (typeof record['price'] === 'string') {
    const val = parseFloat(record['price']);
    if (!isNaN(val)) return val;
  }
  // Recurse into offers
  if (record['offers']) return findPrice(record['offers']);
  // Check array items
  for (const val of Object.values(record)) {
    if (typeof val === 'object' && val !== null) {
      const p = findPrice(val);
      if (p !== null) return p;
    }
  }
  return null;
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

  // Try the largest image in the main content (heuristic: first large image with product-like src)
  const imgTags = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi) ?? [];
  for (const tag of imgTags) {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch?.[1]) continue;
    const src = srcMatch[1];
    // Skip tiny icons, tracking pixels, logos
    if (/icon|logo|badge|sprite|pixel|tracking|1x1|spacer/i.test(src)) continue;
    if (/\.(svg|gif)$/i.test(src)) continue;
    // Prefer images with product-like paths or dimensions
    if (
      /product|asset|media|image|upload|cdn/i.test(src) ||
      /w\d{3,}|h\d{3,}|\d{3,}x\d{3,}/i.test(src)
    ) {
      return src;
    }
  }

  // Last resort: first non-tiny jpg/png/webp
  for (const tag of imgTags) {
    const srcMatch = tag.match(/src=["']([^"']+)["']/i);
    if (!srcMatch?.[1]) continue;
    const src = srcMatch[1];
    if (
      /\.(jpg|jpeg|png|webp)/i.test(src) &&
      !/icon|logo|badge|sprite|pixel|tracking/i.test(src)
    ) {
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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: getCorsHeaders(req) });
  }

  try {
    const { url } = await req.json();
    if (!url || typeof url !== 'string') {
      return new Response(JSON.stringify({ error: 'URL is required' }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // SSRF check
    const unsafeReason = isUnsafeUrl(url);
    if (unsafeReason) {
      return new Response(JSON.stringify({ error: unsafeReason }), {
        status: 400,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      });
    }

    // Fetch the page (8s timeout)
    const pageController = new AbortController();
    const pageTimeout = setTimeout(() => pageController.abort(), 8000);
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      redirect: 'follow',
      signal: pageController.signal,
    });
    clearTimeout(pageTimeout);

    if (!response.ok) {
      return new Response(
        JSON.stringify({ error: `Failed to fetch: ${response.status}` }),
        {
          status: 502,
          headers: {
            ...getCorsHeaders(req),
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const html = await response.text();

    // Extract metadata
    const title =
      extractMeta(html, 'og:title') ??
      extractMeta(html, 'twitter:title') ??
      extractTitle(html);
    const image =
      extractMeta(html, 'og:image') ??
      extractMeta(html, 'twitter:image') ??
      extractProductImage(html);
    const price = extractPrice(html);
    const siteName = extractMeta(html, 'og:site_name');

    console.log(`[scrape] url=${url}`);
    console.log(`[scrape] title=${title}`);
    console.log(`[scrape] og:image raw=${image}`);
    console.log(`[scrape] price=${price}, site_name=${siteName}`);

    // Resolve relative image URLs
    let resolvedImageUrl = image;
    if (image && !image.startsWith('http')) {
      try {
        resolvedImageUrl = new URL(image, url).toString();
      } catch {
        resolvedImageUrl = image;
      }
    }

    console.log(`[scrape] image resolved=${resolvedImageUrl}`);

    const domain = new URL(url).hostname.replace(/^www\./, '');
    const origin = new URL(url).origin;

    // Build candidate image URLs by progressively stripping subdomains
    function getImageCandidates(imgUrl: string, pageUrl: string): string[] {
      const candidates = [imgUrl];
      try {
        const parsed = new URL(imgUrl);
        const pageParsed = new URL(pageUrl);

        if (parsed.hostname !== pageParsed.hostname) {
          // Progressive subdomain stripping on the image host
          // e.g. b2c-api-prod-internal.cc.mitre10.co.nz -> cc.mitre10.co.nz -> mitre10.co.nz
          const parts = parsed.hostname.split('.');
          for (let i = 1; i < parts.length - 1; i++) {
            const shorter = parts.slice(i).join('.');
            if (shorter.includes('.')) {
              candidates.push(
                `${parsed.protocol}//${shorter}${parsed.pathname}${parsed.search}`
              );
            }
          }

          // Also try the page's own domain with the image path
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
        console.log(`[image] trying ${imgUrl}`);
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
        console.log(
          `[image] ${imgUrl} -> status=${resp.status} type=${resp.headers.get('content-type')}`
        );
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

    // Download image and store in Supabase Storage
    let storedImageUrl: string | null = null;
    if (resolvedImageUrl) {
      const candidates = getImageCandidates(resolvedImageUrl, url);
      let imgResponse: Response | null = null;

      for (const candidate of candidates) {
        imgResponse = await tryFetchImage(candidate, origin + '/');
        if (imgResponse) break;
      }

      if (imgResponse) {
        try {
          const contentType =
            imgResponse.headers.get('content-type') || 'image/jpeg';
          const ext = contentType.includes('png')
            ? 'png'
            : contentType.includes('webp')
              ? 'webp'
              : contentType.includes('gif')
                ? 'gif'
                : contentType.includes('svg')
                  ? 'svg'
                  : 'jpg';

          const imageData = await imgResponse.arrayBuffer();
          const fileName = `${crypto.randomUUID()}.${ext}`;

          console.log(
            `[image] downloaded ${imageData.byteLength} bytes, uploading as ${fileName}`
          );

          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, serviceKey);

          const { error: uploadError } = await supabase.storage
            .from('product-images')
            .upload(fileName, imageData, {
              contentType,
              cacheControl: '31536000',
            });

          if (!uploadError) {
            const { data: publicUrl } = supabase.storage
              .from('product-images')
              .getPublicUrl(fileName);
            storedImageUrl = publicUrl.publicUrl;
            console.log(`[image] uploaded ok: ${storedImageUrl}`);
          } else {
            console.error(`[image] upload failed:`, uploadError.message);
            storedImageUrl = resolvedImageUrl;
          }
        } catch (uploadErr) {
          console.error(
            `[image] processing error: ${uploadErr instanceof Error ? uploadErr.message : uploadErr}`
          );
          storedImageUrl = resolvedImageUrl;
        }
      } else {
        console.warn(
          `[image] all candidates failed, falling back to original URL`
        );
        storedImageUrl = resolvedImageUrl;
      }
    }

    const result = {
      title: title ?? null,
      image_url: storedImageUrl ?? resolvedImageUrl ?? null,
      price: price ?? null,
      shop_name: siteName ?? domain,
      shop_domain: domain,
    };
    console.log(`[scrape] done:`, JSON.stringify(result));

    return new Response(JSON.stringify(result), {
      headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    const isTimeout = message.includes('abort');
    return new Response(
      JSON.stringify({
        error: isTimeout
          ? 'This site took too long to respond. You can fill in the details manually.'
          : `Could not fetch this page. You can fill in the details manually. (${message})`,
      }),
      {
        status: isTimeout ? 504 : 500,
        headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' },
      }
    );
  }
});

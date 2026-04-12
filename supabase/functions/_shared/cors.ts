const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:5173',
  'https://superunrelated.github.io',
];

export function getCorsHeaders(req: Request) {
  const origin = req.headers.get('origin') ?? '';
  const referer = req.headers.get('referer') ?? '';

  // Check origin header first, then fall back to referer
  const matched = ALLOWED_ORIGINS.find(
    (o) => origin.startsWith(o) || referer.startsWith(o)
  );

  // Allow chrome extensions
  const isExtension = origin.startsWith('chrome-extension://');

  const allowedOrigin = matched ?? (isExtension ? origin : '*');

  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers':
      'authorization, x-client-info, apikey, content-type',
  };
}

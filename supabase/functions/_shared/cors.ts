const ALLOWED_ORIGINS = [
  'http://localhost:4200',
  'http://localhost:5173',
  'https://superunrelated.github.io',
];

export function getCorsHeaders(req: Request) {
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

/**
 * Strips common tracking/affiliate parameters from URLs.
 * Keeps the URL functional but removes marketing noise.
 */
const TRACKING_PARAMS = new Set([
  // Google / UTM
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'utm_id',
  // Facebook / Meta
  'fbclid', 'fb_action_ids', 'fb_action_types', 'fb_source', 'fb_ref',
  // Google Ads / Analytics
  'gclid', 'gclsrc', 'dclid', 'gbraid', 'wbraid', '_ga', '_gl',
  // Microsoft / Bing
  'msclkid',
  // TikTok
  'ttclid',
  // Twitter / X
  'twclid',
  // Mailchimp
  'mc_cid', 'mc_eid',
  // HubSpot
  'hsa_cam', 'hsa_grp', 'hsa_mt', 'hsa_src', 'hsa_ad', 'hsa_acc', 'hsa_net', 'hsa_ver', 'hsa_la', 'hsa_ol', 'hsa_kw',
  // General affiliate / tracking
  'ref', 'ref_', 'referrer', 'affiliate', 'aff_id', 'aff_sub',
  'click_id', 'clickid', 'campaign_id', 'ad_id', 'adset_id',
  'source', 'medium',
  // Shopify
  'variant', 'srsltid', 'syclid',
  // Pinterest
  'epik',
  // Reddit
  'rdt_cid',
  // Misc
  '_hsenc', '_hsmi', 'oly_anon_id', 'oly_enc_id', 'vero_id',
  'trk', 'trkCampaign', 'sc_campaign', 'sc_channel', 'sc_content',
  'sc_medium', 'sc_outcome', 'sc_geo', 'sc_country',
]);

export function cleanUrl(url: string): string {
  try {
    const parsed = new URL(url);
    const keysToRemove: string[] = [];

    parsed.searchParams.forEach((_value, key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase())) {
        keysToRemove.push(key);
      }
    });

    keysToRemove.forEach((key) => parsed.searchParams.delete(key));

    // Remove empty hash
    if (parsed.hash === '#') parsed.hash = '';

    return parsed.toString();
  } catch {
    // If URL parsing fails, return as-is
    return url;
  }
}

/**
 * Extract a clean domain from a URL.
 */
export function extractDomain(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url.replace(/https?:\/\/(www\.)?/, '').split('/')[0];
  }
}

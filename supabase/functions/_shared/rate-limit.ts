import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

/**
 * Check whether a user has exceeded the allowed request count for an action
 * within the given time window. If under the limit, records the request and
 * returns { ok: true }. Otherwise returns { ok: false }.
 */
export async function checkRateLimit(opts: {
  userId: string;
  action: string;
  windowMinutes: number;
  maxRequests: number;
}): Promise<{ ok: boolean }> {
  const { userId, action, windowMinutes, maxRequests } = opts;

  const admin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const since = new Date(Date.now() - windowMinutes * 60_000).toISOString();

  const { count } = await admin
    .from('rate_limit')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('action', action)
    .gte('created_at', since);

  if ((count ?? 0) >= maxRequests) {
    return { ok: false };
  }

  await admin.from('rate_limit').insert({ user_id: userId, action });

  return { ok: true };
}

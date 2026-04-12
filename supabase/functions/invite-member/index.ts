import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { getCorsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing auth' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { email, collection_id, role = 'viewer' } = await req.json();

    if (!email || !collection_id) {
      return new Response(
        JSON.stringify({ error: 'email and collection_id are required' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    if (!['viewer', 'editor'].includes(role)) {
      return new Response(
        JSON.stringify({ error: 'role must be viewer or editor' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Client authenticated as the inviting user
    const userClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    // Verify the inviting user owns this collection
    const { data: collection, error: colErr } = await userClient
      .from('collections')
      .select('id, user_id, name, slug')
      .eq('id', collection_id)
      .single();

    if (colErr || !collection) {
      return new Response(JSON.stringify({ error: 'Collection not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const {
      data: { user: inviter },
    } = await userClient.auth.getUser();
    if (!inviter || collection.user_id !== inviter.id) {
      return new Response(
        JSON.stringify({
          error: 'Only the collection owner can invite members',
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Admin client for user lookups
    const adminClient = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    // Look up the invited user by email
    const {
      data: { users },
      error: listErr,
    } = await adminClient.auth.admin.listUsers();
    const invitedUser = listErr
      ? null
      : users?.find((u) => u.email?.toLowerCase() === email.toLowerCase());

    let invitedUserId: string;

    if (invitedUser) {
      invitedUserId = invitedUser.id;
    } else {
      // User doesn't exist — send an invite email
      const { data: newUser, error: inviteErr } =
        await adminClient.auth.admin.inviteUserByEmail(email);
      if (inviteErr || !newUser.user) {
        return new Response(
          JSON.stringify({
            error: `Failed to invite: ${inviteErr?.message ?? 'unknown error'}`,
          }),
          {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          }
        );
      }
      invitedUserId = newUser.user.id;
    }

    // Don't allow inviting yourself
    if (invitedUserId === inviter.id) {
      return new Response(JSON.stringify({ error: 'Cannot invite yourself' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upsert the membership (update role if already exists)
    const { data: member, error: memberErr } = await adminClient
      .from('collection_members')
      .upsert(
        {
          collection_id,
          user_id: invitedUserId,
          email: email.toLowerCase(),
          role,
          invited_by: inviter.id,
          invited_by_email: inviter.email,
        },
        { onConflict: 'collection_id,user_id' }
      )
      .select()
      .single();

    if (memberErr) {
      return new Response(JSON.stringify({ error: memberErr.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create in-app notification for the invited user
    await adminClient.from('notifications').insert({
      user_id: invitedUserId,
      type: 'invite',
      title: `You've been invited to "${collection.name}"`,
      body: `${inviter.email} shared a collection with you as ${role}.`,
      link: `/collections/${collection.slug}`,
    });

    return new Response(
      JSON.stringify({
        member,
        email,
        isNewUser: !invitedUser,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

import { supabase } from './supabase';

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type !== 'shelfr:get-session') return;

  supabase.auth.getSession().then(({ data }) => {
    const session = data.session;
    if (!session) {
      sendResponse(null);
      return;
    }
    sendResponse({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
    });
  });

  return true;
});

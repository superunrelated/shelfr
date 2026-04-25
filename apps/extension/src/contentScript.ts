chrome.runtime.sendMessage({ type: 'shelfr:get-session' }, (response) => {
  if (chrome.runtime.lastError || !response) return;
  const { access_token, refresh_token } = response as {
    access_token: string;
    refresh_token: string;
  };
  if (!access_token || !refresh_token) return;
  window.postMessage(
    { type: 'shelfr:auth-bridge', access_token, refresh_token },
    window.location.origin
  );
});

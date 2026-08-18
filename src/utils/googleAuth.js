const GOOGLE_CLIENT_ID = process.env.REACT_APP_GOOGLE_CLIENT_ID;
const GOOGLE_REDIRECT_URI = process.env.REACT_APP_GOOGLE_REDIRECT_URI;
const FROM_PATH_KEY = 'google_oauth_from';

export function getGoogleRedirectUri() {
  return GOOGLE_REDIRECT_URI;
}

export function redirectToGoogle(fromPath) {
  if (fromPath) {
    sessionStorage.setItem(FROM_PATH_KEY, fromPath);
  } else {
    sessionStorage.removeItem(FROM_PATH_KEY);
  }

  const params = new URLSearchParams({
    client_id: GOOGLE_CLIENT_ID,
    redirect_uri: GOOGLE_REDIRECT_URI,
    response_type: 'code',
    scope: 'openid email profile',
    access_type: 'online',
    prompt: 'select_account',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export function consumeGoogleOAuthFromPath() {
  const from = sessionStorage.getItem(FROM_PATH_KEY) || '/';
  sessionStorage.removeItem(FROM_PATH_KEY);
  return from;
}

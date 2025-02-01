const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID; // Access environment variable
const redirectUrl = import.meta.env.VITE_REDIRECT_URI; // Access redirect URI
const authorizationEndpoint = "https://accounts.spotify.com/authorize";
const tokenEndpoint = "https://accounts.spotify.com/api/token";
const scope =
  "user-read-private user-read-email playlist-modify-public playlist-modify-private";

// Token management object for session storage
export const currentToken = {
  get access_token() {
    return localStorage.getItem("access_token") || null;
  },
  get refresh_token() {
    return localStorage.getItem("refresh_token") || null;
  },
  get expires() {
    return localStorage.getItem("expires") || null;
  },

  save(response) {
    const { access_token, refresh_token, expires_in } = response;
    localStorage.setItem("access_token", access_token);
    localStorage.setItem("refresh_token", refresh_token);

    const expiry = Date.now() + expires_in * 1000; // Convert expiration time to milliseconds
    localStorage.setItem("expires", expiry);
  },

  isTokenExpired() {
    const expiry = this.expires;
    if (!expiry) {
      console.error("No expiry information found.");
      return true; // Treat as expired if no expiry is found
    }

    return Date.now() >= parseInt(expiry, 10); // Compare current time with the expiry timestamp
  },
};

export async function redirectToSpotifyAuthorize() {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const randomValues = crypto.getRandomValues(new Uint8Array(64));
  const codeVerifier = Array.from(randomValues)
    .map((x) => possible[x % possible.length])
    .join("");

  const codeVerifierHash = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(codeVerifier)
  );
  const codeChallenge = btoa(
    String.fromCharCode(...new Uint8Array(codeVerifierHash))
  )
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");

  localStorage.setItem("code_verifier", codeVerifier);

  const authUrl = new URL(authorizationEndpoint);
  authUrl.search = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUrl,
    scope: scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  }).toString();

  window.location.href = authUrl.toString(); // Redirect user to Spotify login
}

async function getToken(code) {
  const codeVerifier = localStorage.getItem("code_verifier");
  if (!codeVerifier) {
    console.error(
      "Code verifier missing. Ensure PKCE flow is set up correctly."
    );
    return null;
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "authorization_code",
      code: code,
      redirect_uri: redirectUrl,
      code_verifier: codeVerifier,
    }),
  });

  if (!response.ok) {
    console.error("Token exchange failed.", await response.json());
    return null;
  }

  return await response.json();
}

async function refreshToken() {
  if (!currentToken.refresh_token) {
    console.error("No refresh token found. User needs to log in again.");
    return null;
  }

  const response = await fetch(tokenEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      grant_type: "refresh_token",
      refresh_token: currentToken.refresh_token,
    }),
  });

  if (!response.ok) {
    console.error("Token refresh failed.", await response.json());
    return null;
  }

  return await response.json();
}

window.addEventListener("load", async () => {
  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");

  if (code) {
    // Exchange code for tokens
    const tokenResponse = await getToken(code);
    if (tokenResponse) {
      currentToken.save(tokenResponse);

      // Clear "code" from URL
      const url = new URL(window.location.href);
      url.searchParams.delete("code");
      window.history.replaceState({}, document.title, url.toString());
    }
  }

  // Handle token expiration
  if (currentToken.isTokenExpired()) {
    const tokenResponse = await refreshToken();
    if (tokenResponse) {
      currentToken.save(tokenResponse);
    } else {
      console.error("Failed to refresh token. Redirecting to login...");
      await redirectToSpotifyAuthorize();
    }
  }
});

export async function login() {
  await redirectToSpotifyAuthorize();
}

function logout() {
  localStorage.clear();
  window.location.href = redirectUrl; // Redirect to the app's home page
}

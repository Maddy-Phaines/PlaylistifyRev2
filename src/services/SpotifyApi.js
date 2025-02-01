/* spotifyApi.js
fetchTrack(query, clientId)
fetchAlbum(query, clientId)
fetchShow(query, clientId)
createPlaylist(userId, playlistName, accessToken)
addTracksToPlaylist(playlistId, trackUris, accessToken)
fetchUserProfile(accessToken) */

// Functions to handle Spotify API requests
// Update API Calls to Use getValidAccessToken
// Use getValidAccessToken to ensure a valid token is available before making Spotify API calls
import { currentToken } from "../services/auth";

export async function searchSpotify(query, type, options = {}) {
  const { limit = 10, offset = 0 } = options;
  console.log("Using limit:", limit, "and offset:", offset);
  if (!currentToken.access_token) {
    console.error("Access token is missing. Please log in.");
    return [];
  }

  if (currentToken.isTokenExpired()) {
    console.log("Access token expired. Refreshing...");
    const tokenResponse = await refreshToken();
    currentToken.save(tokenResponse);
  }

  try {
    const response = await fetch(
      `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${currentToken.access_token}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch search results:", await response.json());
      return [];
    }

    const data = await response.json();
    return data[type + "s"].items || []; // Return items for the specified typegit commit -m "Add Spotify authentication and token management logic
  } catch (error) {
    console.error("Error in searchSpotify:", error);
    return [];
  }
}

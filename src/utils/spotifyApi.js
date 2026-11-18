// [SDD-REQ-01, SDD-REQ-02] Spotify Web API Client & Private Playlist Generator

export async function fetchWebApi(endpoint, method = 'GET', body, token) {
  // Write if (!token) {
  if (!token) {
    // Write throw new Error('AUTH_EXPIRED');
    throw new Error('AUTH_EXPIRED');
  }

  // Write let res;
  let res;

  // Write try {
  try {
    // Write const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };
    // Write const payload = body ? JSON.stringify(body) : undefined;
    const payload = body ? JSON.stringify(body) : undefined;
    // Write res = await fetch(`https://api.spotify.com/${endpoint}`, { headers, method, body: payload });
    res = await fetch(`https://api.spotify.com/${endpoint}`, { headers, method, body: payload });
    // Write } catch {
  } catch {
    // Write throw new Error('RATE_LIMITED');
    throw new Error('RATE_LIMITED');
    // Close the try/catch block with }
  }
  // Write if (res.status === 401) {
  if (res.status === 401) {
    // Write throw new Error('AUTH_EXPIRED');
    throw new Error('AUTH_EXPIRED');

  }
  // Step 1o: Write if (res.status === 429 || !res.ok) {
  if (res.status === 429 || !res.ok) {
    // Write throw new Error('RATE_LIMITED');
    throw new Error('RATE_LIMITED');
  }
  // Write return await res.json();
  return await res.json();

}

export async function getTopTracks(token, timeRange = 'long_term', limit = 50) {
  // Write const endpoint = `v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`;
  const endpoint = `v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`;
  // Write const data = await fetchWebApi(endpoint, 'GET', undefined, token);
  const data = await fetchWebApi(endpoint, 'GET', undefined, token);
  // Write return Array.isArray(data?.items) ? data.items : [];
  return Array.isArray(data?.items) ? data.items : [];
}

export async function createPlaylistWithTracks(
  token,
  tracksUri,
  name = 'My top tracks playlist'
) {
  // if (!Array.isArray(tracksUri) || tracksUri.length === 0) {
   if(!Array.isArray(tracksUri) || tracksUri.length === 0) {
   // throw new Error('EMPTY_TRACKS');
    throw new Error('EMPTY_TRACKS');
   }
  // const playlistBody = { name, description: 'Playlist created by the tutorial on developer.spotify.com', public: false };
   const playListBody = { name, description: 'Playlist created by top tracks', public: false };
  // const playlist = await fetchWebApi('v1/me/playlists', 'POST', playlistBody, token);
  const playlist = await fetchWebApi('v1/me/playlist', 'POST', playListBody, token);
  // const urisParam = tracksUri.join(',');
   const urisParam = tracksUri.join(',');
  // await fetchWebApi(`v1/playlists/${playlist.id}/items?uris=${urisParam}`, 'POST', undefined, token);
  await fetchWebApi(`v1/playlists/${playlist.id}/items?uris=${urisParam}`, 'POST', undefined, token);
  // return playlist;
  return playlist;
}

// LIVE HMR CHECK: Run `npx jest __tests__/spotifyApi.test.js --watchAll=false` to verify all 5 API tests turn GREEN!
// NEXT STEP: Once spotifyApi.test.js passes, open src/utils/beatVisualizer.js

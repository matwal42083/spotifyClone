// Spotify Web API client and private playlist generator

/**
 * Sends an authenticated request to the Spotify Web API.
 * Throws AUTH_EXPIRED on 401/missing token, or RATE_LIMITED on 429/network errors.
 */
export async function fetchWebApi(endpoint, method = 'GET', body, token) {
  if (!token) {
    throw new Error('AUTH_EXPIRED');
  }

  let res;

  try {
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };
    const payload = body ? JSON.stringify(body) : undefined;
    res = await fetch(`https://api.spotify.com/${endpoint}`, {
      headers,
      method,
      body: payload,
    });
  } catch {
    throw new Error('RATE_LIMITED');
  }

  if (res.status === 401) {
    throw new Error('AUTH_EXPIRED');
  }

  if (res.status === 429 || !res.ok) {
    throw new Error('RATE_LIMITED');
  }

  return await res.json();
}

/**
 * Fetches the user's top tracks for the selected time range.
 */
export async function getTopTracks(token, timeRange = 'long_term', limit = 50) {
  const endpoint = `v1/me/top/tracks?time_range=${timeRange}&limit=${limit}`;
  const data = await fetchWebApi(endpoint, 'GET', undefined, token);
  return Array.isArray(data?.items) ? data.items : [];
}

/**
 * Creates a new private playlist and populates it with the provided track URIs.
 */
export async function createPlaylistWithTracks(
  token,
  tracksUri,
  name = 'My top tracks playlist'
) {
  if (!Array.isArray(tracksUri) || tracksUri.length === 0) {
    throw new Error('EMPTY_TRACKS');
  }

  const playListBody = {
    name,
    description: 'Playlist created by top tracks',
    public: false,
  };
  const playlist = await fetchWebApi('v1/me/playlist', 'POST', playListBody, token);
  const urisParam = tracksUri.join(',');
  await fetchWebApi(
    `v1/playlists/${playlist.id}/items?uris=${urisParam}`,
    'POST',
    undefined,
    token
  );
  return playlist;
}

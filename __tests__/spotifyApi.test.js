import {
  fetchWebApi,
  getTopTracks,
  createPlaylistWithTracks,
} from '../src/utils/spotifyApi';

describe('Spotify Web API Client [SDD-REQ-01, SDD-REQ-02]', () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  test('getTopTracks fetches up to 50 tracks with Bearer token', async () => {
    const mockItems = [
      {
        id: '1',
        uri: 'spotify:track:2JuasWPUodaUxf5nwNpciQ',
        name: 'Track One',
        artists: [{ name: 'Artist A' }],
      },
    ];
    global.fetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({ items: mockItems }),
    });

    const result = await getTopTracks('valid-token', 'long_term', 50);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.spotify.com/v1/me/top/tracks?time_range=long_term&limit=50',
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({
          Authorization: 'Bearer valid-token',
        }),
      })
    );
    expect(result).toEqual(mockItems);
  });

  test('fetchWebApi throws AUTH_EXPIRED on 401 status', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 401 });
    await expect(getTopTracks('expired-token')).rejects.toThrow('AUTH_EXPIRED');
  });

  test('fetchWebApi throws RATE_LIMITED on 429 or network error', async () => {
    global.fetch.mockResolvedValueOnce({ ok: false, status: 429 });
    await expect(getTopTracks('valid-token')).rejects.toThrow('RATE_LIMITED');
  });

  test('createPlaylistWithTracks throws EMPTY_TRACKS when array is empty', async () => {
    await expect(createPlaylistWithTracks('valid-token', [])).rejects.toThrow(
      'EMPTY_TRACKS'
    );
  });

  test('createPlaylistWithTracks creates private playlist and posts URIs', async () => {
    global.fetch
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ id: 'playlist-123', name: 'My top tracks playlist' }),
      })
      .mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => ({ snapshot_id: 'snap-1' }),
      });

    const uris = ['spotify:track:2JuasWPUodaUxf5nwNpciQ'];
    const created = await createPlaylistWithTracks('valid-token', uris);
    expect(created.id).toBe('playlist-123');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});

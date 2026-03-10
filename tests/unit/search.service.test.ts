import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getSpotifyArtist } from '../../src/services/spotify/search.service';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('../../src/services/spotify/auth.service', () => ({
  getClientCredentialsToken: vi.fn().mockResolvedValue({ access_token: 'fake_token', expires_in: 3600 }),
}));

const fakeArtist = {
  id: '4FpJcNgOvIpSBeJgRg3OfN',
  name: 'Orelsan',
  type: 'artist',
  popularity: 72,
  followers: { href: null, total: 1800000 },
  genres: ['french hip hop'],
  images: [{ url: 'https://i.scdn.co/image/abc', height: 640, width: 640 }],
  uri: 'spotify:artist:4FpJcNgOvIpSBeJgRg3OfN',
  href: 'https://api.spotify.com/v1/artists/4FpJcNgOvIpSBeJgRg3OfN',
  external_urls: { spotify: 'https://open.spotify.com/artist/4FpJcNgOvIpSBeJgRg3OfN' },
};

describe('getSpotifyArtist', () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should return a list of artists for a valid query', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        artists: {
          items: [fakeArtist],
          total: 1,
          limit: 20,
          offset: 0,
          next: null,
          previous: null,
          href: '',
        },
      }),
    });

    const result = await getSpotifyArtist('Orelsan');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Orelsan');
    expect(result.total).toBe(1);
  });

  it('should include the correct offset in the request URL', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ artists: { items: [], total: 60, limit: 20, offset: 20, next: null, previous: null, href: '' } }),
    });

    await getSpotifyArtist('rap', 20);

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('offset=20');
  });

  it('should throw when receiving a 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' });
    await expect(getSpotifyArtist('test')).rejects.toThrow('Spotify API error: 401 Unauthorized');
  });

    it('should throw when receiving a 403 Forbidden', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' });
      await expect(getSpotifyArtist('test')).rejects.toThrow('Spotify API error: 403 Forbidden');
    });

    it('should throw when receiving a 429 Rate Limit', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' });
      await expect(getSpotifyArtist('test')).rejects.toThrow('Spotify API error: 429 Too Many Requests');
    });

    it('should throw when receiving a 500 Internal Server Error', async () => {
      mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });
      await expect(getSpotifyArtist('test')).rejects.toThrow('Spotify API error: 500 Internal Server Error');
    });

    it('should throw when fetch rejects', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));
      await expect(getSpotifyArtist('test')).rejects.toThrow('Network error');
  });
});
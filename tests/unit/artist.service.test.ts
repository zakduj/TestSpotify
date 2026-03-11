import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getalbums } from '../../src/services/spotify/artist.service';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

vi.mock('../../src/services/spotify/auth.service', () => ({
  getClientCredentialsToken: vi.fn().mockResolvedValue({ access_token: 'fake_token', expires_in: 3600 }),
}));

const fakeAlbum = {
  id: 'album1',
  name: 'Civilisation',
  album_type: 'album',
  total_tracks: 14,
  release_date: '2021-09-17',
  images: [{ url: 'https://i.scdn.co/image/abc', height: 640, width: 640 }],
  artists: [{ id: '4FpJcNgOvIpSBeJgRg3OfN', name: 'Orelsan' }],
};

describe('getalbums', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should return albums for a valid artist ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [fakeAlbum], total: 1 }),
    });

    const result = await getalbums('4FpJcNgOvIpSBeJgRg3OfN');

    expect(result.items).toHaveLength(1);
    expect(result.items[0].name).toBe('Civilisation');
    expect(result.total).toBe(1);
  });

  it('should call the correct Spotify endpoint with the artist ID', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    });

    await getalbums('4FpJcNgOvIpSBeJgRg3OfN');

    const [url] = mockFetch.mock.calls[0];
    expect(url).toContain('/artists/4FpJcNgOvIpSBeJgRg3OfN/albums');
  });

  it('should include the Authorization header in the request', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ items: [], total: 0 }),
    });

    await getalbums('4FpJcNgOvIpSBeJgRg3OfN');

    const [, options] = mockFetch.mock.calls[0];
    expect(options.headers.Authorization).toBe('Bearer fake_token');
  });

  it('should throw when receiving a 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' });
    await expect(getalbums('some_id')).rejects.toThrow('Spotify API error: 401 Unauthorized');
  });

  it('should throw when receiving a 404 Not Found (invalid artist ID)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    await expect(getalbums('invalid_id')).rejects.toThrow('Spotify API error: 404 Not Found');
  });

  it('should throw when receiving a 429 Rate Limit', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 429, statusText: 'Too Many Requests' });
    await expect(getalbums('some_id')).rejects.toThrow('Spotify API error: 429 Too Many Requests');
  });

  it('should throw when receiving a 500 Internal Server Error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });
    await expect(getalbums('some_id')).rejects.toThrow('Spotify API error: 500 Internal Server Error');
  });

  it('should throw when fetch rejects (network failure)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(getalbums('some_id')).rejects.toThrow('Network error');
  });
});


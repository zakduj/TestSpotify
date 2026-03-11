import { describe, it, expect, vi, beforeEach } from 'vitest';
import { searchArtists } from '../../src/controllers/search.controller';
import { Request, Response } from 'express';

vi.mock('../../src/services/spotify/search.service', () => ({
  getSpotifyArtist: vi.fn().mockResolvedValue({
    items: [
      {
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
      },
    ],
    total: 1,
    limit: 20,
    offset: 0,
    next: null,
    previous: null,
  }),
}));

describe('searchArtists', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = { query: { q: 'Orelsan' } };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  });

  it('should return artists when the query is valid', async () => {
    await searchArtists(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'Orelsan' }),
        ]),
      })
    );
  });

  it('should pass the offset parameter to the service', async () => {
    const { getSpotifyArtist } = await import('../../src/services/spotify/search.service');
    req.query = { q: 'rap', offset: '20' };

    await searchArtists(req as Request, res as Response);

    expect(getSpotifyArtist).toHaveBeenCalledWith('rap', 20);
  });

  it('should default offset to 0 when not provided', async () => {
    const { getSpotifyArtist } = await import('../../src/services/spotify/search.service');
    req.query = { q: 'jazz' };

    await searchArtists(req as Request, res as Response);

    expect(getSpotifyArtist).toHaveBeenCalledWith('jazz', 0);
  });

  it('should return 400 when the query parameter is missing', async () => {
    req.query = {};

    await searchArtists(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query parameter is required' });
  });

  it('should return 400 when the query parameter is an empty string', async () => {
    req.query = { q: '   ' };

    await searchArtists(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Query parameter is required' });
  });

  it('should return 500 when the service throws an error', async () => {
    const { getSpotifyArtist } = await import('../../src/services/spotify/search.service');
    vi.mocked(getSpotifyArtist).mockRejectedValueOnce(new Error('Spotify API error: 503 Service Unavailable'));

    await searchArtists(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Failed to fetch artists from Spotify' });
  });
});
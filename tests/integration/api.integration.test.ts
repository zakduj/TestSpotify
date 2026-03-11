import { describe, it, expect, vi } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

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
      },
    ],
    total: 1,
    limit: 20,
    offset: 0,
    next: null,
    previous: null,
  }),
}));

vi.mock('../../src/services/spotify/artist.service', () => ({
  getalbums: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'album1',
        name: 'Civilisation',
        album_type: 'album',
        total_tracks: 14,
        release_date: '2021-09-17',
        images: [{ url: 'https://i.scdn.co/image/abc', height: 640, width: 640 }],
        artists: [{ id: '4FpJcNgOvIpSBeJgRg3OfN', name: 'Orelsan' }],
      },
    ],
    total: 1,
  }),
}));

const VALID_COOKIE = 'spotify_token=fake_token_for_tests';

describe('Integration - GET /search', () => {
  it('should return 200 with artists when authenticated and query is provided', async () => {
    const res = await request(app)
      .get('/search?q=Orelsan')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Orelsan');
  });

  it('should return 200 with correct offset parameter', async () => {
    const { getSpotifyArtist } = await import('../../src/services/spotify/search.service');

    const res = await request(app)
      .get('/search?q=rap&offset=20')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(200);
    expect(getSpotifyArtist).toHaveBeenCalledWith('rap', 20);
  });

  it('should return 401 when not authenticated (no cookie)', async () => {
    const res = await request(app).get('/search?q=Orelsan');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'not identified' });
  });

  it('should return 400 when the query parameter is missing', async () => {
    const res = await request(app)
      .get('/search')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Query parameter is required' });
  });

  it('should return 400 when the query parameter is empty', async () => {
    const res = await request(app)
      .get('/search?q=   ')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Query parameter is required' });
  });

  it('should return 500 when the service throws', async () => {
    const { getSpotifyArtist } = await import('../../src/services/spotify/search.service');
    vi.mocked(getSpotifyArtist).mockRejectedValueOnce(new Error('Spotify API error: 503 Service Unavailable'));

    const res = await request(app)
      .get('/search?q=Orelsan')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch artists from Spotify' });
  });
});

describe('Integration - GET /artist/:artistId', () => {
  it('should return 200 with albums when authenticated', async () => {
    const res = await request(app)
      .get('/artist/4FpJcNgOvIpSBeJgRg3OfN')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(200);
    expect(res.body.items).toHaveLength(1);
    expect(res.body.items[0].name).toBe('Civilisation');
  });

  it('should return 401 when not authenticated (no cookie)', async () => {
    const res = await request(app).get('/artist/4FpJcNgOvIpSBeJgRg3OfN');

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'not identified' });
  });

  it('should return 500 when the service throws', async () => {
    const { getalbums } = await import('../../src/services/spotify/artist.service');
    vi.mocked(getalbums).mockRejectedValueOnce(new Error('Spotify API error: 404 Not Found'));

    const res = await request(app)
      .get('/artist/invalid_id')
      .set('Cookie', VALID_COOKIE);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Error fetching albums' });
  });
});

describe('Integration - Unknown route', () => {
  it('should return 404 for an unknown route', async () => {
    const res = await request(app).get('/this-route-does-not-exist');
    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: 'Route non trouvee' });
  });
});
import { describe, it, expect, vi, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../../src/app';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

const fakeArtists = {
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
};

const fakeAlbums = {
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
};

function mockSpotifyToken() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ access_token: 'fake_spotify_token', expires_in: 3600 }),
  });
}

function mockArtistSearch() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => ({ artists: fakeArtists }),
  });
}

function mockAlbums() {
  mockFetch.mockResolvedValueOnce({
    ok: true,
    json: async () => fakeAlbums,
  });
}

let signedCookie: string;

beforeAll(async () => {
  mockSpotifyToken();
  const loginRes = await request(app).post('/auth/login');
  expect(loginRes.status).toBe(200);
  signedCookie = loginRes.headers['set-cookie'][0].split(';')[0];
});

afterAll(() => {
  vi.unstubAllGlobals();
});

describe('Integration - POST /auth/login', () => {
  it('should return 200 and set a signed httpOnly cookie', async () => {
    mockSpotifyToken();
    const res = await request(app).post('/auth/login');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers['set-cookie'][0]).toContain('HttpOnly');
  });

  it('should return 500 when auth service throws', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });

    const res = await request(app).post('/auth/login');

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Impossible to connect to spotify' });
  });
});

describe('Integration - GET /auth/check', () => {
  it('should return 200 when a valid signed cookie is provided', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ artists: { items: [] } }) });
    const res = await request(app)
      .get('/auth/check')
      .set('Cookie', signedCookie);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ authenticated: true });
  });

  it('should return 401 when no cookie is provided', async () => {
    const res = await request(app).get('/auth/check');
    expect(res.status).toBe(401);
  });

  it('should return 401 when a forged cookie is provided', async () => {
    const res = await request(app)
      .get('/auth/check')
      .set('Cookie', 'session_id=i_am_a_hacker');
    expect(res.status).toBe(401);
  });
});

describe('Integration - POST /auth/logout', () => {
  it('should return 200 and clear the cookie', async () => {
    mockSpotifyToken();
    const loginRes = await request(app).post('/auth/login');
    const cookieForLogout = loginRes.headers['set-cookie'][0].split(';')[0];

    const res = await request(app)
      .post('/auth/logout')
      .set('Cookie', cookieForLogout);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ success: true });
    expect(res.headers['set-cookie'][0]).toContain('session_id=;');
  });
});

describe('Integration - GET /search', () => {
  it('should return 200 with artists when authenticated and query is provided', async () => {
    mockArtistSearch();
    const res = await request(app)
      .get('/search?q=Orelsan')
      .set('Cookie', signedCookie);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it('should return 200 with correct offset passed to the service', async () => {
    mockArtistSearch();
    const res = await request(app)
      .get('/search?q=rap&offset=20')
      .set('Cookie', signedCookie);

    expect(res.status).toBe(200);
    const [url] = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
    expect(url).toContain('offset=20');
  });

  it('should return 401 when no cookie is provided', async () => {
    const res = await request(app).get('/search?q=Orelsan');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'not identified' });
  });

  it('should return 401 when a forged cookie is provided', async () => {
    const res = await request(app)
      .get('/search?q=Orelsan')
      .set('Cookie', 'session_id=i_am_a_hacker');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'not identified' });
  });

  it('should return 400 when the query parameter is missing', async () => {
    const res = await request(app)
      .get('/search')
      .set('Cookie', signedCookie);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Query parameter is required' });
  });

  it('should return 400 when the query parameter is empty', async () => {
    const res = await request(app)
      .get('/search?q=   ')
      .set('Cookie', signedCookie);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Query parameter is required' });
  });

  it('should return 500 when Spotify returns an error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' });
    const res = await request(app)
      .get('/search?q=Orelsan')
      .set('Cookie', signedCookie);
    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: 'Failed to fetch artists from Spotify' });
  });
});

describe('Integration - GET /artist/:artistId', () => {
  it('should return 200 with albums when authenticated', async () => {
    mockAlbums();
    const res = await request(app)
      .get('/artist/4FpJcNgOvIpSBeJgRg3OfN')
      .set('Cookie', signedCookie);

    expect(res.status).toBe(200);
    expect(res.body.total).toBe(1);
  });

  it('should return 400 when the artist ID format is invalid', async () => {
    const res = await request(app)
      .get('/artist/invalid_id')
      .set('Cookie', signedCookie);
    expect(res.status).toBe(400);
    expect(res.body).toEqual({ error: 'Invalid artist ID' });
  });

  it('should return 401 when no cookie is provided', async () => {
    const res = await request(app).get('/artist/4FpJcNgOvIpSBeJgRg3OfN');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'not identified' });
  });

  it('should return 401 when a forged cookie is provided', async () => {
    const res = await request(app)
      .get('/artist/4FpJcNgOvIpSBeJgRg3OfN')
      .set('Cookie', 'session_id=i_am_a_hacker');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: 'not identified' });
  });

  it('should return 500 when Spotify returns an error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, statusText: 'Not Found' });
    const res = await request(app)
      .get('/artist/4FpJcNgOvIpSBeJgRg3OfN')
      .set('Cookie', signedCookie);
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
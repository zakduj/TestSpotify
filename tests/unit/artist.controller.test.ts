import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getArtistAlbumsController } from '../../src/controllers/artist.controller';
import { Request, Response } from 'express';

vi.mock('../../src/services/spotify/artist.service', () => ({
  getArtistAlbums: vi.fn().mockResolvedValue({
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

vi.mock('../../src/store/session.store', () => ({
  getSession: vi.fn().mockReturnValue({ accessToken: 'fake_access_token', expiresAt: Date.now() + 3600000 }),
}));

describe('getArtistAlbumsController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;

  beforeEach(() => {
    req = {
      params: { artistId: '4FpJcNgOvIpSBeJgRg3OfN' },
      signedCookies: { session_id: 'fake_session_id' },
    };
    res = {
      json: vi.fn(),
      status: vi.fn().mockReturnThis(),
    };
  });

  it('should return albums when the service succeeds', async () => {
    await getArtistAlbumsController(req as Request, res as Response);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      items: expect.arrayContaining([
        expect.objectContaining({ name: 'Civilisation' }),
      ]),
    }));
  });

  it('should return 500 when artist is not found (404 from service)', async () => {
    const { getArtistAlbums } = await import('../../src/services/spotify/artist.service');
    vi.mocked(getArtistAlbums).mockRejectedValueOnce(new Error('Spotify albums error 404: Artist not found'));

    await getArtistAlbumsController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching albums' });
  });

  it('should return 500 when rate limit is exceeded (429 from service)', async () => {
    const { getArtistAlbums } = await import('../../src/services/spotify/artist.service');
    vi.mocked(getArtistAlbums).mockRejectedValueOnce(new Error('Spotify albums error 429: Rate limit exceeded, try again later'));

    await getArtistAlbumsController(req as Request, res as Response);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error fetching albums' });
  });
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getClientCredentialsToken } from '../../src/services/spotify/auth.service';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

describe('getClientCredentialsToken', () => {

  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('should return an access_token when the request succeeds', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'fake_token_123', expires_in: 3600 }),
    });

    const result = await getClientCredentialsToken();

    expect(result.access_token).toBe('fake_token_123');
    expect(result.expires_in).toBe(3600);
  });

  it('should call the Spotify auth endpoint with grant_type=client_credentials', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ access_token: 'token', expires_in: 3600 }),
    });

    await getClientCredentialsToken();

    const [, options] = mockFetch.mock.calls[0];
    expect(options.body).toBe('grant_type=client_credentials');
    expect(options.method).toBe('POST');
  });

  it('should throw when receiving a 400 Bad Request', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, statusText: 'Bad Request' });
    await expect(getClientCredentialsToken()).rejects.toThrow('Spotify API error: 400 Bad Request');
  });

  it('should throw when receiving a 401 Unauthorized', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 401, statusText: 'Unauthorized' });
    await expect(getClientCredentialsToken()).rejects.toThrow('Spotify API error: 401 Unauthorized');
  });

  it('should throw when receiving a 403 Forbidden', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 403, statusText: 'Forbidden' });
    await expect(getClientCredentialsToken()).rejects.toThrow('Spotify API error: 403 Forbidden');
  });

  it('should throw when receiving a 500 Internal Server Error', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, statusText: 'Internal Server Error' });
    await expect(getClientCredentialsToken()).rejects.toThrow('Spotify API error: 500 Internal Server Error');
  });

  it('should throw when fetch rejects', async () => {
    mockFetch.mockRejectedValueOnce(new Error('Network error'));
    await expect(getClientCredentialsToken()).rejects.toThrow('Network error');
  });
});

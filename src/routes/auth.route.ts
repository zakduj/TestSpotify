import { Request, Response, Router } from 'express';
import { getClientCredentialsToken } from '../services/spotify/auth.service';
import { authMiddleware } from '../middlewares/auth';

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const token = await getClientCredentialsToken();
    res.cookie('spotify_token', token.access_token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: token.expires_in * 1000
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible to connect to spotify' });
  }
});

authRouter.get('/check', authMiddleware, async (req: Request, res: Response) => {
  const token = req.cookies.spotify_token;

  try {
    const spotifyRes = await fetch(`${process.env.SPOTIFY_API_URL}/search?q=test&type=artist&limit=1`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!spotifyRes.ok) {
      res.clearCookie('spotify_token');
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    res.json({ authenticated: true });
  } catch {
    res.status(500).json({ error: 'Verification error' });
  }
});

authRouter.post('/logout', (_req: Request, res: Response) => {
  res.clearCookie('spotify_token');
  res.json({ success: true });
});

export default authRouter;
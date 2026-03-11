import { Request, Response, Router } from 'express';
import { getClientCredentialsToken } from '../services/spotify/auth.service';
import { authMiddleware } from '../middlewares/auth';
import { createSession, deleteSession, getSession } from '../store/session.store';

const authRouter = Router();

authRouter.post('/login', async (req: Request, res: Response) => {
  try {
    const token = await getClientCredentialsToken();
    const sessionId = createSession(token.access_token, token.expires_in);

    res.cookie('session_id', sessionId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      signed: true,
      maxAge: token.expires_in * 1000,
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Impossible to connect to spotify' });
  }
});

authRouter.get('/check', authMiddleware, async (req: Request, res: Response) => {
  const sessionId = req.signedCookies.session_id;
  const session = getSession(sessionId);

  if (!session) {
    res.clearCookie('session_id');
    res.status(401).json({ error: 'Token expired' });
    return;
  }

  try {
    const spotifyRes = await fetch(`${process.env.SPOTIFY_API_URL}/search?q=test&type=artist&limit=1`, {
      headers: { Authorization: `Bearer ${session.accessToken}` },
    });

    if (!spotifyRes.ok) {
      deleteSession(sessionId);
      res.clearCookie('session_id');
      res.status(401).json({ error: 'Token expired' });
      return;
    }

    res.json({ authenticated: true });
  } catch {
    res.status(500).json({ error: 'Verification error' });
  }
});

authRouter.post('/logout', (req: Request, res: Response) => {
  const sessionId = req.signedCookies?.session_id;
  if (sessionId) deleteSession(sessionId);

  res.clearCookie('session_id');
  res.json({ success: true });
});

export default authRouter;
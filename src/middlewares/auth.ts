import { Request, Response, NextFunction } from 'express';
import { getSession } from '../store/session.store';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const sessionId = req.signedCookies?.session_id;

  if (!sessionId || sessionId === false) {
    res.status(401).json({ error: 'not identified' });
    return;
  }

  const session = getSession(sessionId);
  if (!session) {
    res.clearCookie('session_id');
    res.status(401).json({ error: 'Session expired' });
    return;
  }

  next();
}
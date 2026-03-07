import { Request, Response, NextFunction } from 'express';

export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  const token = req.cookies?.spotify_token;

  if (!token) {
    res.status(401).json({ error: 'Non authentifie' });
    return;
  }

  next();
}
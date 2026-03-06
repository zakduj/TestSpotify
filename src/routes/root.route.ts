import { Router, Request, Response } from 'express';

const rootRouter = Router();
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;

rootRouter.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Bienvenue dans Test Spotify',
    version: '1.0.0',
    spotifyConfigured: !!SPOTIFY_CLIENT_ID
  });
});

export default rootRouter;


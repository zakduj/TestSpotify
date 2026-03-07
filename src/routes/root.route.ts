import { Router, Request, Response } from 'express';

const rootRouter = Router();

rootRouter.get('/', (req: Request, res: Response) => {
  res.json({status: 'ok', timestamp: new Date().toISOString()});
});

export default rootRouter;


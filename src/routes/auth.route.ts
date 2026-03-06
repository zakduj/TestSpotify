import { Request, Response, Router } from 'express';

const authRouter = Router();

authRouter.post('/login', (req: Request, res: Response) => {
});

authRouter.get('/callback', async (req: Request, res: Response) => {
});

authRouter.post('/logout', (req: Request, res: Response) => {
});

export default authRouter;
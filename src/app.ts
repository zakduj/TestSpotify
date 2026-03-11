import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import rootRouter from './routes/root.route';
import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import searchRouter from './routes/search.route';
import artistRouter from './routes/artist.route';

dotenv.config();

const app: Express = express();

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(cookieParser());
app.use(express.json());

app.use('/', rootRouter);
app.use('/health', healthRouter);
app.use('/auth', authRouter);
app.use('/search', searchRouter);
app.use('/', artistRouter);

app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route non trouvee' });
});

app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Erreur serveur interne' });
});

export default app;
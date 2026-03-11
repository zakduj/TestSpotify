import dotenv from 'dotenv';
import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import rootRouter from './routes/root.route';

import healthRouter from './routes/health.route';
import authRouter from './routes/auth.route';
import searchRouter from './routes/search.route';
import artistRouter from './routes/artist.route';

dotenv.config();

const app: Express = express();

const COOKIE_SECRET = process.env.COOKIE_SECRET;
if (!COOKIE_SECRET) throw new Error('COOKIE_SECRET is not defined in environment variables');

app.set('trust proxy', 1);

app.use(helmet());

const globalLimiter = rateLimit({
  windowMs: 60_000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please try again later' },
});

const loginLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts, please try again later' },
});

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(cookieParser(COOKIE_SECRET));
app.use(express.json());
app.use(globalLimiter);

app.use('/', rootRouter);
app.use('/health', healthRouter);
app.use('/auth/login', loginLimiter);
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
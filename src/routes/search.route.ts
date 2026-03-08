import { Router } from 'express';
import { authMiddleware } from '../middlewares/auth';
import {searchArtists} from '../controllers/search.controller';

const searchRouter = Router();

searchRouter.get('/', authMiddleware, searchArtists);

export default searchRouter;
import {Router} from "express";
import {authMiddleware} from "../middlewares/auth";
import { getArtistAlbumsController } from "../controllers/artist.controller";

const artistRouter = Router();

artistRouter.get('/artist/:artistId', authMiddleware, getArtistAlbumsController);

export default artistRouter;
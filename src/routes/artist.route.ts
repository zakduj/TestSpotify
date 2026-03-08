import {Router} from "express";
import {authMiddleware} from "../middlewares/auth";
import {getAlbums} from "../controllers/artist.controller";

const artistRouter = Router();

artistRouter.get('/artist/:artistId', authMiddleware, getAlbums);

export default artistRouter;
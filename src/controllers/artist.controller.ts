import {Request, Response} from "express";
import {getalbums} from "../services/spotify/artist.service";

export async function getAlbums(req: Request, res: Response): Promise<void> {
    try {
        const { artistId } = req.params;
        const albums = await getalbums(artistId);
        res.json(albums);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error fetching albums'});
    }
}
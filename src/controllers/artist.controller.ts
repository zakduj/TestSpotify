import {Request, Response} from "express";
import { getArtistAlbums } from "../services/spotify/artist.service";
import {getSession} from "../store/session.store";

export async function getArtistAlbumsController(req: Request, res: Response): Promise<void> {
    const artistId = req.params.artistId as string;

    if (!artistId || !/^[a-zA-Z0-9]{22}$/.test(artistId)) {
        res.status(400).json({ error: 'Invalid artist ID' });
        return;
    }

    const sessionId = req.signedCookies.session_id;
    const session = getSession(sessionId);
    if (!session) {
        res.status(401).json({ error: 'Session expired' });
        return;
    }

    try {
        const albums = await getArtistAlbums(artistId, session.accessToken);
        res.json(albums);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({error: 'Error fetching albums'});
    }
}
import { Request, Response } from 'express';
import {getSpotifyArtist} from '../services/spotify/search.service';

export async function searchArtists(req: Request, res: Response): Promise<void> {
    const query = req.query.q as string;
    const offset = parseInt(req.query.offset as string) || 0;

    if (!query || !query.trim()) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
    }

    try {
        const artists = await getSpotifyArtist(query, offset);
        res.json(artists);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch artists from Spotify' });
    }
}
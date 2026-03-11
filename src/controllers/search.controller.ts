import { Request, Response } from 'express';
import { getSpotifyArtist } from '../services/spotify/search.service';
import { getSession } from '../store/session.store';

export async function searchArtists(req: Request, res: Response): Promise<void> {
    const query = req.query.q as string;

    if (!query || !query.trim()) {
        res.status(400).json({ error: 'Query parameter is required' });
        return;
    }

    if (query.length > 64) {
        res.status(400).json({ error: 'Query parameter is too long' });
        return;
    }

    const sessionId = req.signedCookies.session_id;
    const session = getSession(sessionId);
    if (!session) {
        res.status(401).json({ error: 'Session expired' });
        return;
    }

    const rawOffset = req.query.offset as string;
    const offset = parseInt(rawOffset);
    if (rawOffset !== undefined && (isNaN(offset) || offset < 0)) {
        res.status(400).json({ error: 'Offset must be a positive integer' });
        return;
    }

    const safeOffset = isNaN(offset) ? 0 : offset;
    try {
        const artists = await getSpotifyArtist(query, session.accessToken, safeOffset);
        res.json(artists);
    } catch (e) {
        console.error(e);
        res.status(500).json({ error: 'Failed to fetch artists from Spotify' });
    }
}
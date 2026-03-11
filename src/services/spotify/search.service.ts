interface SpotifyArtist {
    id: string;
    name: string;
    type: string;
    uri: string;
    href: string;
    external_urls: { spotify: string };
    popularity: number;
    followers: { href: null; total: number };
    genres: string[];
    images: { url: string; height: number; width: number }[];
}

interface SpotifyArtistSearchResponse {
    artists: {
        href: string;
        limit: number;
        offset: number;
        total: number;
        next: string | null;
        previous: string | null;
        items: SpotifyArtist[];
    };
}

export async function getSpotifyArtist(query: string, accessToken: string, offset: number = 0) {
    const response = await fetch(`https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=artist&limit=20&offset=${offset}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${accessToken}`
        }
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json() as SpotifyArtistSearchResponse;
    return data.artists;
}
import {getClientCredentialsToken} from "./auth.service";

export async function getalbums(artistId: string) {
    const { access_token } = await getClientCredentialsToken();

    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${access_token}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
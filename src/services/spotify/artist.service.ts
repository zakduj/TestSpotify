export async function getArtistAlbums(artistId: string | string[], accessToken: string) {
    const response = await fetch(`https://api.spotify.com/v1/artists/${artistId}/albums`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!response.ok) {
        throw new Error(`Spotify API error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
}
import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let token = null;
let tokenExpiration = null;

async function getAccessToken() {
  if (token && tokenExpiration && Date.now() < tokenExpiration) {
    return token;
  }

  try {
    const response = await axios.post('https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64')
        }
      }
    );

    token = response.data.access_token;
    tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 300000; // 5 minutes buffer
    return token;
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw new Error('Failed to get Spotify access token');
  }
}

async function makeRequest(endpoint, params = {}) {
  try {
    const accessToken = await getAccessToken();
    console.log('Making Spotify API request:', {
      endpoint,
      params,
      hasToken: !!accessToken
    });

    const response = await axios.get(`${SPOTIFY_API_BASE}${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`
      },
      params
    });

    console.log('Spotify API response status:', response.status);
    return response.data;
  } catch (error) {
    console.error('Spotify API request failed:', {
      endpoint,
      params,
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers
    });

    // If token is invalid, try to refresh it once
    if (error.response?.status === 401) {
      console.log('Token expired, refreshing...');
      token = null;
      tokenExpiration = null;
      try {
        const newToken = await getAccessToken();
        
        // Retry the request with new token
        const retryResponse = await axios.get(`${SPOTIFY_API_BASE}${endpoint}`, {
          headers: {
            'Authorization': `Bearer ${newToken}`
          },
          params
        });
        
        return retryResponse.data;
      } catch (retryError) {
        console.error('Retry failed:', {
          error: retryError.message,
          response: retryError.response?.data,
          status: retryError.response?.status
        });
        throw retryError;
      }
    }

    throw error;
  }
}

export const searchSongs = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const data = await makeRequest('/search', {
      q,
      type: 'track',
      limit,
      market: 'US'
    });

    const tracks = data.tracks.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      duration: track.duration_ms,
      spotifyUrl: track.external_urls.spotify
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error searching songs:', error);
    res.status(500).json({ error: 'Failed to search songs' });
  }
};

export const searchAlbums = async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;
    if (!q) {
      return res.status(400).json({ error: 'Query parameter is required' });
    }

    const data = await makeRequest('/search', {
      q,
      type: 'album',
      limit,
      market: 'US'
    });

    const albums = data.albums.items.map(album => ({
      id: album.id,
      title: album.name,
      artist: album.artists.map(artist => artist.name).join(', '),
      image: album.images[0]?.url,
      releaseDate: album.release_date,
      totalTracks: album.total_tracks,
      spotifyUrl: album.external_urls.spotify
    }));

    res.json(albums);
  } catch (error) {
    console.error('Error searching albums:', error);
    res.status(500).json({ error: 'Failed to search albums' });
  }
};

export const getAlbumTracks = async (req, res) => {
  try {
    console.log("Starting album tracks fetch");
    const { id } = req.params;
    if (!id) {
      return res.status(400).json({ error: 'Album ID is required' });
    }

    console.log('Fetching tracks for album:', id);
    
    // First verify the album exists
    try {
      const albumData = await makeRequest(`/albums/${id}`);
      console.log('Album exists:', {
        name: albumData.name,
        id: albumData.id,
        availableMarkets: albumData.available_markets
      });
    } catch (albumError) {
      console.error('Error verifying album:', {
        error: albumError.message,
        response: albumError.response?.data,
        status: albumError.response?.status
      });
      return res.status(404).json({ 
        error: 'Album not found',
        details: albumError.response?.data || albumError.message
      });
    }

    // Then get the tracks
    const data = await makeRequest(`/albums/${id}/tracks`, {
      limit: 50,
      market: 'PL' // Try Polish market first
    });

    if (!data || !data.items) {
      console.error('Invalid response from Spotify API:', data);
      return res.status(500).json({ error: 'Invalid response from Spotify API' });
    }

    console.log('Successfully fetched tracks:', {
      count: data.items.length,
      albumId: id
    });

    const tracks = data.items.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      duration: track.duration_ms,
      previewUrl: track.preview_url,
      spotifyUrl: track.external_urls.spotify
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error getting album tracks:', {
      error: error.message,
      response: error.response?.data,
      status: error.response?.status,
      headers: error.response?.headers,
      albumId: req.params.id
    });
    
    // Handle specific Spotify API errors
    if (error.response?.status === 404) {
      return res.status(404).json({ 
        error: 'Album not found',
        details: error.response.data
      });
    }
    
    if (error.response?.status === 401) {
      return res.status(401).json({ 
        error: 'Spotify API authentication failed',
        details: error.response.data
      });
    }

    res.status(500).json({ 
      error: 'Failed to get album tracks',
      details: error.message,
      spotifyError: error.response?.data
    });
  }
};

export const getTopTracks = async (req, res) => {
  try {
    const { limit = 20 } = req.query;
    const data = await makeRequest('/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks', {
      limit,
      market: 'US'
    });

    const tracks = data.items.map(item => ({
      id: item.track.id,
      title: item.track.name,
      artist: item.track.artists.map(artist => artist.name).join(', '),
      album: item.track.album.name,
      image: item.track.album.images[0]?.url,
      previewUrl: item.track.preview_url,
      duration: item.track.duration_ms,
      spotifyUrl: item.track.external_urls.spotify
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error getting top tracks:', error);
    res.status(500).json({ error: 'Failed to get top tracks' });
  }
};

export const getRecommendations = async (req, res) => {
  try {
    const { seed_tracks, limit = 20 } = req.query;
    const seeds = seed_tracks || '4cOdK2wGLETKBW3PvgPWqT,6rqhFgbbKwnb9MLmUQDhG6,1z6WtY7c4t0yCX5n3AhDQG';

    const data = await makeRequest('/recommendations', {
      seed_tracks: seeds,
      limit,
      market: 'US'
    });

    const tracks = data.tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist: track.artists.map(artist => artist.name).join(', '),
      album: track.album.name,
      image: track.album.images[0]?.url,
      previewUrl: track.preview_url,
      duration: track.duration_ms,
      spotifyUrl: track.external_urls.spotify
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Error getting recommendations:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
}; 
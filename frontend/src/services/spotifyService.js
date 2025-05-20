import axios from 'axios';

const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';
const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

// Debug logging
console.log('Spotify Credentials:', {
    clientId: CLIENT_ID ? 'Present' : 'Missing',
    clientSecret: CLIENT_SECRET ? 'Present' : 'Missing',
    env: import.meta.env.MODE
});

class SpotifyService {
  constructor() {
    this.token = null;
    this.tokenExpiration = null;
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.token && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.token;
    }

    try {
      console.log('Requesting Spotify access token...');
      const authString = btoa(CLIENT_ID + ':' + CLIENT_SECRET);
      console.log('Auth string generated:', authString ? 'Yes' : 'No');

      const response = await axios.post('https://accounts.spotify.com/api/token', 
        'grant_type=client_credentials',
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + authString
          }
        }
      );

      this.token = response.data.access_token;
      // Set token expiration (subtract 5 minutes for safety)
      this.tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 300000;
      console.log('Successfully obtained access token');
      return this.token;
    } catch (error) {
      console.error('Error getting Spotify access token:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      throw new Error('Failed to get Spotify access token');
    }
  }

  async makeRequest(endpoint, params = {}) {
    try {
      const token = await this.getAccessToken();
      const response = await axios.get(`${SPOTIFY_API_BASE}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        },
        params
      });
      return response.data;
    } catch (error) {
      console.error('Spotify API request failed:', error);
      throw error;
    }
  }

  async searchSongs(query, limit = 10) {
    try {
      const data = await this.makeRequest('/search', {
        q: query,
        type: 'track',
        limit,
        market: 'US'
      });
      return data.tracks.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        duration: track.duration_ms,
        spotifyUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error searching songs:', error);
      throw new Error('Failed to search songs');
    }
  }

  async searchAlbums(query, limit = 10) {
    try {
      const data = await this.makeRequest('/search', {
        q: query,
        type: 'album',
        limit,
        market: 'US'
      });
      return data.albums.items.map(album => ({
        id: album.id,
        title: album.name,
        artist: album.artists.map(artist => artist.name).join(', '),
        image: album.images[0]?.url,
        releaseDate: album.release_date,
        totalTracks: album.total_tracks,
        spotifyUrl: album.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error searching albums:', error);
      throw new Error('Failed to search albums');
    }
  }

  async getAlbumTracks(albumId) {
    try {
      const data = await this.makeRequest(`/albums/${albumId}/tracks`, {
        limit: 50,
        market: 'US'
      });
      return data.items.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        duration: track.duration_ms,
        previewUrl: track.preview_url,
        spotifyUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error getting album tracks:', error);
      throw new Error('Failed to get album tracks');
    }
  }

  async getTopTracks(limit = 20) {
    try {
      const data = await this.makeRequest('/playlists/37i9dQZEVXbMDoHDwVN2tF/tracks', {
        limit,
        market: 'US'
      });
      return data.items.map(item => ({
        id: item.track.id,
        title: item.track.name,
        artist: item.track.artists.map(artist => artist.name).join(', '),
        album: item.track.album.name,
        image: item.track.album.images[0]?.url,
        previewUrl: item.track.preview_url,
        duration: item.track.duration_ms,
        spotifyUrl: item.track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error getting top tracks:', error);
      throw new Error('Failed to get top tracks');
    }
  }

  async getRecommendations(seedTracks = [], limit = 20) {
    try {
      // If no seed tracks provided, use some popular tracks as seeds
      const seeds = seedTracks.length > 0 
        ? seedTracks.slice(0, 5).join(',')
        : '4cOdK2wGLETKBW3PvgPWqT,6rqhFgbbKwnb9MLmUQDhG6,1z6WtY7c4t0yCX5n3AhDQG';
      
      const data = await this.makeRequest('/recommendations', {
        seed_tracks: seeds,
        limit,
        market: 'US'
      });
      
      return data.tracks.map(track => ({
        id: track.id,
        title: track.name,
        artist: track.artists.map(artist => artist.name).join(', '),
        album: track.album.name,
        image: track.album.images[0]?.url,
        previewUrl: track.preview_url,
        duration: track.duration_ms,
        spotifyUrl: track.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw new Error('Failed to get recommendations');
    }
  }
}

export const spotifyService = new SpotifyService(); 
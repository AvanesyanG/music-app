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
    this.YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
    
    // Verify YouTube API key
    if (!this.YOUTUBE_API_KEY) {
        console.error('YouTube API key is missing. Please check your .env file.');
    } else {
        console.log('YouTube API key is present');
    }
  }

  async getAccessToken() {
    // Check if we have a valid token
    if (this.token && this.tokenExpiration && Date.now() < this.tokenExpiration) {
      return this.token;
    }

    try {
      console.log('Requesting Spotify access token...');
      
      // Create the authorization header
      const authHeader = 'Basic ' + btoa(CLIENT_ID + ':' + CLIENT_SECRET);
      
      // Create the request body
      const body = new URLSearchParams();
      body.append('grant_type', 'client_credentials');

      const response = await axios.post('https://accounts.spotify.com/api/token', 
        body.toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': authHeader
          }
        }
      );

      if (response.data && response.data.access_token) {
        this.token = response.data.access_token;
        // Set token expiration (subtract 5 minutes for safety)
        this.tokenExpiration = Date.now() + (response.data.expires_in * 1000) - 300000;
        console.log('Successfully obtained access token');
        return this.token;
      } else {
        throw new Error('Invalid response from Spotify');
      }
    } catch (error) {
      console.error('Error getting Spotify access token:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
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
            limit: 50,
            market: 'US'
        });

        console.log(`Total search results for "${query}": ${data.tracks.items.length}`);

        // Simply map the tracks without YouTube previews
        const tracks = data.tracks.items.map(track => ({
            id: track.id,
            title: track.name,
            artist: track.artists.map(artist => artist.name).join(', '),
            album: track.album.name,
            image: track.album.images[0]?.url,
            previewUrl: track.preview_url,
            duration: track.duration_ms,
            spotifyUrl: track.external_urls.spotify,
            previewSource: track.preview_url ? 'spotify' : 'none'
        }));

        // Log preview availability
        const previewStats = {
            total: tracks.length,
            spotify: tracks.filter(t => t.previewSource === 'spotify').length,
            none: tracks.filter(t => t.previewSource === 'none').length
        };
        console.log('Preview availability:', previewStats);

        return tracks;
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

      // Log the raw album data
      console.log('Raw Spotify album search response:', data.albums.items);

      // Get detailed album data including tracks for each album
      const albumsWithTracks = await Promise.all(
        data.albums.items.map(async (album) => {
          try {
            // Get the tracks
            const tracksData = await this.makeRequest(`/albums/${album.id}/tracks`, {
              limit: 50,
              market: 'US'
            });
            
            console.log(`Album "${album.name}" tracks:`, {
              albumId: album.id,
              totalTracks: tracksData.total,
              tracks: tracksData.items.map(track => ({
                id: track.id,
                name: track.name,
                duration: track.duration_ms,
                preview_url: track.preview_url,
                artists: track.artists.map(a => a.name)
              }))
            });

            // Map the data to a consistent structure
            return {
              id: album.id,
              title: album.name,
              artist: album.artists.map(artist => artist.name).join(', '),
              image: album.images[0]?.url,
              releaseDate: album.release_date,
              totalTracks: tracksData.total,
              spotifyUrl: album.external_urls.spotify,
              tracks: tracksData.items.map(track => ({
                id: track.id,
                title: track.name,
                artist: track.artists.map(artist => artist.name).join(', '),
                duration: track.duration_ms,
                previewUrl: track.preview_url,
                spotifyUrl: track.external_urls.spotify,
                hasPreview: !!track.preview_url
              }))
            };
          } catch (error) {
            console.error(`Error getting data for album ${album.name}:`, {
              error: error.message,
              response: error.response?.data,
              status: error.response?.status
            });
            
            // Return a consistent structure even if there's an error
            return {
              id: album.id,
              title: album.name,
              artist: album.artists.map(artist => artist.name).join(', '),
              image: album.images[0]?.url,
              releaseDate: album.release_date,
              totalTracks: 0,
              spotifyUrl: album.external_urls.spotify,
              tracks: [],
              error: error.message
            };
          }
        })
      );

      // Filter out albums with no tracks
      const validAlbums = albumsWithTracks.filter(album => album.tracks.length > 0);
      console.log('Valid albums with tracks:', validAlbums.length);

      return validAlbums;
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

  async searchArtists(query, limit = 10) {
    try {
      const data = await this.makeRequest('/search', {
        q: query,
        type: 'artist',
        limit,
        market: 'US'
      });
      
      console.log('Raw Spotify artist search response:', data);
      
      return data.artists.items.map(artist => ({
        id: artist.id,
        name: artist.name,
        image: artist.images[0]?.url || null,
        genres: artist.genres,
        popularity: artist.popularity,
        spotifyUrl: artist.external_urls.spotify
      }));
    } catch (error) {
      console.error('Error searching artists:', error);
      throw error;
    }
  }

  async getYouTubePreviewUrl(songTitle, artist) {
    try {
        if (!this.YOUTUBE_API_KEY) {
            console.error('YouTube API key is missing');
            return null;
        }

        const searchQuery = `${songTitle} ${artist} audio`;
        console.log('Searching YouTube for:', searchQuery);
        
        // First, search for the video
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 1,
                q: searchQuery,
                type: 'video',
                key: this.YOUTUBE_API_KEY
            }
        });

        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
            const videoId = searchResponse.data.items[0].id.videoId;
            console.log('Found YouTube video ID:', videoId);
            
            // Then get the video details including duration
            const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'contentDetails',
                    id: videoId,
                    key: this.YOUTUBE_API_KEY
                }
            });

            if (videoResponse.data.items && videoResponse.data.items.length > 0) {
                const duration = videoResponse.data.items[0].contentDetails.duration;
                // Convert ISO 8601 duration to seconds
                const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
                const hours = (match[1] && parseInt(match[1])) || 0;
                const minutes = (match[2] && parseInt(match[2])) || 0;
                const seconds = (match[3] && parseInt(match[3])) || 0;
                const totalSeconds = hours * 3600 + minutes * 60 + seconds;

                console.log('YouTube video duration:', {
                    raw: duration,
                    formatted: `${minutes}:${seconds.toString().padStart(2, '0')}`,
                    totalSeconds
                });

                return {
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    duration: totalSeconds
                };
            }
        }
        console.log('No YouTube video found for:', searchQuery);
        return null;
    } catch (error) {
        console.error('Error fetching YouTube preview:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            apiKey: this.YOUTUBE_API_KEY ? 'Present' : 'Missing'
        });
        return null;
    }
  }
}

export const spotifyService = new SpotifyService(); 
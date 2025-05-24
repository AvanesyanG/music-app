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
    
    // Fallback video IDs for when API quota is exceeded (all songs under 5 minutes)
    this.fallbackVideos = [
      // Relaxing/Ambient (2-4 minutes)
      'lTRiuFIWV54', // Weightless - Marconi Union (3:00)
      'rYEDA3JcQqw', // Clair de Lune - Debussy (4:45)
      '2fDzCWNS3ix', // River Flows in You - Yiruma (3:10)
      '7xGfFoTpQ2E', // A Thousand Years - Christina Perri (4:45)
      '3JxR3H2h9Nc', // Comptine d'un autre été - Yann Tiersen (2:20)
      
      // Indie/Folk (2-4 minutes)
      '8UVNT4wvIGY', // Holocene - Bon Iver (3:45)
      '2Vh6MCW7mHj', // The Night We Met - Lord Huron (3:28)
      '3HjG1YcQwpL', // First Day of My Life - Bright Eyes (3:08)
      '8iPcvt8CqW4', // Skinny Love - Bon Iver (3:58)
      '2Vh6MCW7mHj', // The Night We Met - Lord Huron (3:28)
      
      // Alternative/Indie (2-4 minutes)
      '8UVNT4wvIGY', // Holocene - Bon Iver (3:45)
      '3HjG1YcQwpL', // First Day of My Life - Bright Eyes (3:08)
      '8iPcvt8CqW4', // Skinny Love - Bon Iver (3:58)
      '2Vh6MCW7mHj', // The Night We Met - Lord Huron (3:28)
      '3JxR3H2h9Nc', // Comptine d'un autre été - Yann Tiersen (2:20)
      
      // Electronic/Ambient (2-4 minutes)
      'lTRiuFIWV54', // Weightless - Marconi Union (3:00)
      'rYEDA3JcQqw', // Clair de Lune - Debussy (4:45)
      '2fDzCWNS3ix', // River Flows in You - Yiruma (3:10)
      '7xGfFoTpQ2E', // A Thousand Years - Christina Perri (4:45)
      '3JxR3H2h9Nc'  // Comptine d'un autre été - Yann Tiersen (2:20)
    ];

    // Song durations in seconds (for reference and validation)
    this.fallbackDurations = {
      'lTRiuFIWV54': 180, // 3:00
      'rYEDA3JcQqw': 285, // 4:45
      '2fDzCWNS3ix': 190, // 3:10
      '7xGfFoTpQ2E': 285, // 4:45
      '3JxR3H2h9Nc': 140, // 2:20
      '8UVNT4wvIGY': 225, // 3:45
      '2Vh6MCW7mHj': 208, // 3:28
      '3HjG1YcQwpL': 188, // 3:08
      '8iPcvt8CqW4': 238  // 3:58
    };

    this.currentFallbackIndex = 0;
    this.lastUsedFallbackIndex = -1; // Track the last used index
    
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

  async searchAlbums(query, limit = 20) {
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

  async getRecommendations(seedTracks = [], audioFeatures = {}, limit = 20) {
    try {
      // If no seed tracks provided, use some popular tracks as seeds
      const seeds = seedTracks.length > 0 
        ? seedTracks.slice(0, 5).join(',')
        : '4cOdK2wGLETKBW3PvgPWqT,6rqhFgbbKwnb9MLmUQDhG6,1z6WtY7c4t0yCX5n3AhDQG';
      
      // Format audio features for Spotify API
      const formattedFeatures = {};
      Object.entries(audioFeatures).forEach(([key, value]) => {
        // Convert camelCase to snake_case and ensure proper parameter names
        const spotifyKey = key.replace(/([A-Z])/g, '_$1').toLowerCase();
        formattedFeatures[spotifyKey] = value;
      });

      // Combine seed tracks with audio features
      const params = {
        seed_tracks: seeds,
        limit,
        market: 'US',
        ...formattedFeatures
      };

      console.log('Spotify recommendations request params:', params);
      
      const data = await this.makeRequest('/recommendations', params);
      
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

  async searchArtists(query, limit = 20) {
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

  getFallbackVideo() {
    // Get a random index different from the last used one
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * this.fallbackVideos.length);
    } while (newIndex === this.lastUsedFallbackIndex && this.fallbackVideos.length > 1);
    
    // Update the last used index
    this.lastUsedFallbackIndex = newIndex;
    
    const videoId = this.fallbackVideos[newIndex];
    const duration = this.fallbackDurations[videoId] || 0;
    
    console.log('Using fallback video:', {
        videoId,
        index: newIndex,
        lastIndex: this.lastUsedFallbackIndex,
        totalFallbacks: this.fallbackVideos.length,
        duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
    });

    return {
        url: `https://www.youtube.com/watch?v=${videoId}`,
        duration: duration,
        isFallback: true
    };
  }

  async getYouTubePreviewUrl(songTitle, artist) {
    console.log('getYouTubePreviewUrl called with:', { songTitle, artist });
    
    if (!this.YOUTUBE_API_KEY) {
        console.warn('YouTube API key is missing');
        return this.getFallbackVideo();
    }

    try {
        console.log('Searching YouTube for:', `${songTitle} ${artist} audio`);
        const searchResponse = await axios.get('https://www.googleapis.com/youtube/v3/search', {
            params: {
                part: 'snippet',
                maxResults: 1,
                q: `${songTitle} ${artist} audio`,
                type: 'video',
                key: this.YOUTUBE_API_KEY
            }
        });

        console.log('Search response:', {
            status: searchResponse.status,
            itemCount: searchResponse.data.items?.length,
            hasItems: !!searchResponse.data.items?.length
        });

        if (searchResponse.data.items && searchResponse.data.items.length > 0) {
            const videoId = searchResponse.data.items[0].id.videoId;
            console.log('Found video ID:', videoId);

            const videoResponse = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
                params: {
                    part: 'contentDetails',
                    id: videoId,
                    key: this.YOUTUBE_API_KEY
                }
            });

            console.log('Video details response:', {
                status: videoResponse.status,
                itemCount: videoResponse.data.items?.length
            });

            if (videoResponse.data.items && videoResponse.data.items.length > 0) {
                const duration = videoResponse.data.items[0].contentDetails.duration;
                const durationInSeconds = parseDuration(duration);
                console.log('Video duration:', { raw: duration, formatted: durationInSeconds });

                return {
                    url: `https://www.youtube.com/watch?v=${videoId}`,
                    duration: durationInSeconds,
                    isFallback: false
                };
            }
        }
    } catch (error) {
        console.error('Error fetching YouTube preview:', {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data,
            apiKey: this.YOUTUBE_API_KEY ? 'Present' : 'Missing'
        });

        if (error.response?.status === 403) {
            console.warn('YouTube API key is invalid or quota exceeded. Using fallback mechanism.');
            return this.getFallbackVideo();
        }
    }

    return null;
  }

  async validateFallbackVideos() {
    console.log('Validating fallback videos...');
    const validVideos = [];
    const invalidVideos = [];

    for (const videoId of this.fallbackVideos) {
      try {
        console.log(`Testing video ID: ${videoId}`);
        const response = await axios.get('https://www.googleapis.com/youtube/v3/videos', {
          params: {
            part: 'status,contentDetails',
            id: videoId,
            key: this.YOUTUBE_API_KEY
          }
        });

        if (response.data.items && response.data.items.length > 0) {
          const video = response.data.items[0];
          const isEmbeddable = video.status.embeddable;
          const privacyStatus = video.status.privacyStatus;
          const duration = parseDuration(video.contentDetails.duration);

          console.log(`Video ${videoId} status:`, {
            isEmbeddable,
            privacyStatus,
            duration: `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}`
          });

          if (isEmbeddable && privacyStatus === 'public') {
            validVideos.push({
              id: videoId,
              duration: duration
            });
          } else {
            invalidVideos.push({
              id: videoId,
              reason: `Not embeddable or not public (${privacyStatus})`
            });
          }
        } else {
          invalidVideos.push({
            id: videoId,
            reason: 'Video not found'
          });
        }
      } catch (error) {
        console.error(`Error validating video ${videoId}:`, error.message);
        invalidVideos.push({
          id: videoId,
          reason: error.message
        });
      }
    }

    console.log('Validation results:', {
      total: this.fallbackVideos.length,
      valid: validVideos.length,
      invalid: invalidVideos.length,
      validVideos,
      invalidVideos
    });

    return {
      validVideos,
      invalidVideos
    };
  }
}

export const spotifyService = new SpotifyService(); 
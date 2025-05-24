import axios from 'axios';

const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;
const YOUTUBE_API_BASE = 'https://www.googleapis.com/youtube/v3';

export const searchVideos = async (req, res) => {
    try {
        const { q, maxResults = 5 } = req.query;
        
        if (!q) {
            return res.status(400).json({ error: 'Query parameter is required' });
        }

        // Log environment variables (without exposing the full key)
        console.log('YouTube API Configuration:', {
            hasApiKey: !!YOUTUBE_API_KEY,
            apiKeyLength: YOUTUBE_API_KEY ? YOUTUBE_API_KEY.length : 0,
            apiKeyPrefix: YOUTUBE_API_KEY ? YOUTUBE_API_KEY.substring(0, 5) + '...' : 'none'
        });

        if (!YOUTUBE_API_KEY) {
            console.error('YouTube API key is not configured. Please add YOUTUBE_API_KEY to your .env file');
            return res.status(500).json({ 
                error: 'YouTube API is not configured',
                details: 'Please add YOUTUBE_API_KEY to your .env file'
            });
        }

        console.log('Making YouTube API request:', {
            query: q,
            maxResults,
            endpoint: '/search'
        });

        const response = await axios.get(`${YOUTUBE_API_BASE}/search`, {
            params: {
                part: 'snippet',
                maxResults,
                q,
                type: 'video',
                videoCategoryId: '10', // Music category
                key: YOUTUBE_API_KEY
            }
        });

        console.log('YouTube API response:', {
            status: response.status,
            itemsCount: response.data?.items?.length || 0
        });

        const videos = response.data.items.map(item => ({
            id: item.id.videoId,
            title: item.snippet.title,
            thumbnail: item.snippet.thumbnails.high.url,
            channelTitle: item.snippet.channelTitle,
            publishedAt: item.snippet.publishedAt
        }));

        res.json(videos);
    } catch (error) {
        console.error('Error searching YouTube videos:', {
            error: error.message,
            response: error.response?.data,
            status: error.response?.status,
            query: req.query.q,
            hasApiKey: !!YOUTUBE_API_KEY
        });
        
        // Handle specific YouTube API errors
        if (error.response?.status === 403) {
            return res.status(500).json({ 
                error: 'YouTube API key is invalid or has exceeded quota',
                details: error.response.data
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to search YouTube videos',
            details: error.response?.data || error.message
        });
    }
}; 
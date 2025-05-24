import { spotifyService } from './spotifyService';

class OpenAIService {
    constructor() {
        this.API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
        this.API_URL = 'https://api.openai.com/v1/chat/completions';
        this.lastRequestTime = 0;
        this.requestCount = 0;

        // Initialize word databases for song name generation
        this.wordDatabases = {
            adjectives: {
                happy: ['Sunny', 'Joyful', 'Bright', 'Cheerful', 'Vibrant', 'Energetic', 'Playful', 'Dancing', 'Smiling', 'Radiant'],
                melancholic: ['Whispering', 'Silent', 'Broken', 'Fading', 'Distant', 'Lonely', 'Tender', 'Gentle', 'Soft', 'Quiet'],
                calm: ['Peaceful', 'Serene', 'Tranquil', 'Gentle', 'Soothing', 'Calm', 'Soft', 'Mellow', 'Quiet', 'Still'],
                focused: ['Clear', 'Sharp', 'Focused', 'Precise', 'Steady', 'Strong', 'Solid', 'Firm', 'Stable', 'Centered']
            },
            nouns: {
                happy: ['Sunshine', 'Dance', 'Smile', 'Joy', 'Heart', 'Soul', 'Spirit', 'Light', 'Day', 'Dream'],
                melancholic: ['Shadows', 'Memories', 'Tears', 'Heart', 'Soul', 'Night', 'Moon', 'Stars', 'Wind', 'Rain'],
                calm: ['Waters', 'Breeze', 'Clouds', 'Sky', 'Ocean', 'Forest', 'Garden', 'Meadow', 'Valley', 'Mountain'],
                focused: ['Mind', 'Focus', 'Vision', 'Path', 'Journey', 'Quest', 'Goal', 'Dream', 'Plan', 'Future']
            }
        };
    }

    async getMoodRecommendations(mood) {
        try {
            console.log('🎯 Mood Recommendation Request:', {
                mood: mood.label,
                moodId: mood.id,
                apiKey: this.API_KEY ? 'Present' : 'Missing'
            });

            // Generate song names based on mood
            const generatedSongs = this.generateSongsForMood(mood.id, 20);
            console.log('🎵 Generated songs:', generatedSongs);

            // Process each generated song to get YouTube URLs
            console.log('🎥 Processing YouTube URLs...');
            const processedSongs = await Promise.all(
                generatedSongs.map(async (song) => {
                    try {
                        console.log('🔍 Searching YouTube for:', {
                            title: song.title,
                            artist: song.artist
                        });

                        const youtubeData = await spotifyService.getYouTubePreviewUrl(
                            song.title,
                            song.artist
                        );

                        if (!youtubeData) {
                            console.log('⚠️ No YouTube data found for:', song.title);
                            // Return a fallback song object without YouTube URL
                            return {
                                id: song.id,
                                title: song.title,
                                artist: song.artist,
                                file: null, // No YouTube URL available
                                duration: 0,
                                reason: this.getMoodReason(mood.id, song),
                                previewAvailable: false
                            };
                        }

                        console.log('✅ Found YouTube data:', {
                            title: song.title,
                            duration: youtubeData.duration
                        });

                        return {
                            id: song.id,
                            title: song.title,
                            artist: song.artist,
                            file: youtubeData.url,
                            duration: youtubeData.duration,
                            reason: this.getMoodReason(mood.id, song),
                            previewAvailable: true
                        };
                    } catch (error) {
                        console.error(`❌ Error processing ${song.title}:`, error);
                        // Return a fallback song object on error
                        return {
                            id: song.id,
                            title: song.title,
                            artist: song.artist,
                            file: null,
                            duration: 0,
                            reason: this.getMoodReason(mood.id, song),
                            previewAvailable: false,
                            error: error.message
                        };
                    }
                })
            );

            const validSongs = processedSongs.filter(song => song !== null);
            const songsWithPreview = validSongs.filter(song => song.previewAvailable);
            
            console.log('🎵 Final processed songs:', {
                total: generatedSongs.length,
                valid: validSongs.length,
                withPreview: songsWithPreview.length,
                withoutPreview: validSongs.length - songsWithPreview.length
            });

            return validSongs;
        } catch (error) {
            console.error('❌ Mood Recommendation Error:', {
                message: error.message,
                status: error.response?.status,
                data: error.response?.data,
                stack: error.stack
            });
            throw error;
        }
    }

    generateSongsForMood(moodId, count = 20) {
        const songs = [];
        const adjectives = this.wordDatabases.adjectives[moodId] || this.wordDatabases.adjectives.happy;
        const nouns = this.wordDatabases.nouns[moodId] || this.wordDatabases.nouns.happy;
        const artists = this.getArtistsForMood(moodId);

        for (let i = 0; i < count; i++) {
            const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
            const noun = nouns[Math.floor(Math.random() * nouns.length)];
            const artist = artists[Math.floor(Math.random() * artists.length)];
            
            songs.push({
                id: `generated-${i}`,
                title: `${adjective} ${noun}`,
                artist: artist
            });
        }

        return songs;
    }

    getArtistsForMood(moodId) {
        const artists = {
            happy: [
                'Pharrell Williams',
                'Mark Ronson',
                'Justin Timberlake',
                'Bruno Mars',
                'Katy Perry'
            ],
            melancholic: [
                'Adele',
                'John Legend',
                'A Great Big World',
                'Sam Smith',
                'Lana Del Rey'
            ],
            calm: [
                'Marconi Union',
                'Ludovico Einaudi',
                'Max Richter',
                'Ólafur Arnalds',
                'Brian Eno'
            ],
            focused: [
                'Hans Zimmer',
                'Philip Glass',
                'Steve Reich',
                'Brian Eno',
                'Max Richter'
            ]
        };

        return artists[moodId] || artists.happy;
    }

    getMoodReason(moodId, track) {
        const reasons = {
            happy: "A high-energy, positive track that will lift your spirits",
            melancholic: "A reflective and emotional song that captures the mood",
            calm: "A peaceful and soothing track to help you relax",
            focused: "An instrumental track that helps maintain concentration"
        };

        return reasons[moodId] || "A great track for your current mood";
    }
}

export const openaiService = new OpenAIService(); 
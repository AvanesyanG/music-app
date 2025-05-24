import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openaiService } from '../../services/openaiService';
import { spotifyService } from '../../services/spotifyService';
import { toast } from 'react-toastify';

const MoodSelector = () => {
    const navigate = useNavigate();
    const [selectedMood, setSelectedMood] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showResponse, setShowResponse] = useState(false);
    const [recommendedSongs, setRecommendedSongs] = useState([]);

    // Test if API key is accessible
    useEffect(() => {
        const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
        console.log('OpenAI API Key available:', !!apiKey);
        if (!apiKey) {
            console.error('OpenAI API Key is missing!');
        }
    }, []);

    const moods = [
        { id: 'happy', label: 'Happy & Energetic', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
        { id: 'calm', label: 'Calm & Relaxed', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
        { id: 'focused', label: 'Focused & Productive', color: 'bg-green-500', hover: 'hover:bg-green-600' },
        { id: 'melancholic', label: 'Melancholic & Reflective', color: 'bg-purple-500', hover: 'hover:bg-purple-600' }
    ];

    const handleMoodSelect = async (mood) => {
        setSelectedMood(mood);
        setIsLoading(true);
        
        try {
            // Get AI recommendations
            const recommendations = await openaiService.getMoodRecommendations(mood);
            console.log('AI recommendations:', recommendations);
            
            // Process each recommendation to get YouTube URLs
            const processedSongs = await Promise.all(
                recommendations.map(async (rec) => {
                    try {
                        const youtubeData = await spotifyService.getYouTubePreviewUrl(rec.title, rec.artist);
                        console.log('YouTube data for', rec.title, ':', youtubeData);

                        if (!youtubeData) {
                            console.warn('No YouTube URL found for:', rec.title);
                            return null;
                        }

                        return {
                            id: Math.random().toString(36).substr(2, 9),
                            title: rec.title,
                            artist: rec.artist,
                            file: youtubeData.url,
                            duration: youtubeData.duration,
                            reason: rec.reason,
                            isFallback: youtubeData.isFallback || false
                        };
                    } catch (error) {
                        console.error(`Error processing ${rec.title}:`, error);
                        return null;
                    }
                })
            );

            // Filter out any null results
            const validSongs = processedSongs.filter(song => song !== null);
            console.log('Processed songs with YouTube URLs:', validSongs);
            
            setRecommendedSongs(validSongs);
            setIsLoading(false);
            setShowResponse(true);

            // Update URL with selected mood
            navigate('/mood', { state: { selectedMood: mood } });
        } catch (error) {
            console.error('Error getting mood recommendations:', error);
            toast.error('Failed to get recommendations');
            setIsLoading(false);
        }
    };

    return (
        <div className="w-full h-full flex flex-col relative">
            <div className={`flex-1 flex items-center justify-center ${isLoading ? 'blur-sm' : ''} ${showResponse ? 'scale-0 rotate-180 transition-all duration-500' : ''}`}>
                <div className="max-w-2xl w-full text-center">
                    <h1 className="text-4xl font-bold mb-8 animate-fade-in text-white">
                        How are you feeling today?
                    </h1>
                    <p className="text-lg text-gray-300 mb-12">
                        Let us curate the perfect playlist based on your mood
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {moods.map((mood) => (
                            <button
                                key={mood.id}
                                onClick={() => handleMoodSelect(mood)}
                                className={`
                                    ${mood.color} ${mood.hover}
                                    p-6 rounded-lg transform transition-all duration-300
                                    hover:scale-105 hover:shadow-xl
                                    ${selectedMood?.id === mood.id ? 'ring-4 ring-white' : ''}
                                `}
                            >
                                <h3 className="text-xl font-semibold mb-2">{mood.label}</h3>
                                <p className="text-sm opacity-90">
                                    {selectedMood?.id === mood.id ? 'Generating your playlist...' : 'Click to select'}
                                </p>
                            </button>
                        ))}
                    </div>
                    
                    <p className="mt-12 text-sm text-gray-400">
                        Our AI will analyze your mood and create a personalized music experience
                    </p>
                </div>
            </div>

            {/* AI Loader */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-md rounded-full p-8 border-4 border-white/20">
                        <div className="text-4xl font-bold text-white animate-pulse">AI</div>
                    </div>
                </div>
            )}

            {/* AI Response Container */}
            {showResponse && (
                <div className="absolute inset-0 flex items-center justify-center p-4 z-0 overflow-y-auto">
                    <div className="bg-black/50 backdrop-blur-md rounded-xl p-8 w-full max-w-5xl mx-4 my-[20%] max-h-[80vh]">
                        <div className="text-white">
                            <h2 className="text-2xl font-bold mb-6">Your {selectedMood?.label} Playlist</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto overflow-y-auto">
                                {recommendedSongs.map((song) => (
                                    <div 
                                        key={song.id}
                                        className="bg-white/10 rounded-lg p-6 hover:bg-white/20 transition-all duration-300 flex flex-col max-w-sm mx-auto w-full"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">{song.title}</h3>
                                        <p className="text-gray-300 text-sm mb-2">{song.artist}</p>
                                        <p className="text-gray-400 text-sm italic mb-4 flex-grow">{song.reason}</p>
                                        <div className="flex justify-center">
                                            <button 
                                                className="mt-auto bg-white/20 hover:bg-white/30 px-4 py-2 rounded-full text-sm transition-all duration-300 w-1/2"
                                                onClick={() => {
                                                    // Add to your player context or handle play
                                                    console.log('Play song:', song);
                                                }}
                                            >
                                                Play
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MoodSelector; 
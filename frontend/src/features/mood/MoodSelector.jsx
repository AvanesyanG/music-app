import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { openaiService } from '../../services/openaiService';
import { spotifyService } from '../../services/spotifyService';
import { toast } from 'react-toastify';

const bounceX = {
    '0%': { transform: 'translateX(-10px)' },
    '50%': { transform: 'translateX(10px)' },
    '100%': { transform: 'translateX(-10px)' }
};

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

    useEffect(() => {
        // Add the custom animation to the document
        const style = document.createElement('style');
        style.textContent = `
            @keyframes bounce-x {
                0% { transform: translateX(-10px) rotate(-5deg); }
                50% { transform: translateX(10px) rotate(5deg); }
                100% { transform: translateX(-10px) rotate(-5deg); }
            }
            .animate-bounce-x {
                animation: bounce-x 1s ease-in-out infinite;
                transform-origin: center center;
            }
        `;
        document.head.appendChild(style);

        // Cleanup
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    const moods = [
        { id: 'happy', label: 'Happy & Energetic', color: 'bg-gradient-to-br from-yellow-500 to-yellow-600', hover: 'hover:from-yellow-600 hover:to-yellow-700' },
        { id: 'calm', label: 'Calm & Relaxed', color: 'bg-gradient-to-br from-blue-500 to-blue-600', hover: 'hover:from-blue-600 hover:to-blue-700' },
        { id: 'focused', label: 'Focused & Productive', color: 'bg-gradient-to-br from-green-500 to-green-600', hover: 'hover:from-green-600 hover:to-green-700' },
        { id: 'melancholic', label: 'Melancholic & Reflective', color: 'bg-gradient-to-br from-purple-500 to-purple-600', hover: 'hover:from-purple-600 hover:to-purple-700' }
    ];

    const handleMoodSelect = async (mood) => {
        setSelectedMood(mood);
        setIsLoading(true);
        
        try {
            // Add a minimum loading time of 3 seconds
            const startTime = Date.now();
            
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
            
            // Calculate remaining time to ensure minimum 3 seconds loading
            const elapsedTime = Date.now() - startTime;
            const remainingTime = Math.max(0, 3000 - elapsedTime);
            
            // Wait for remaining time if needed
            if (remainingTime > 0) {
                await new Promise(resolve => setTimeout(resolve, remainingTime));
            }
            
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
        <div className="w-full h-full flex flex-col relative bg-[#121212]">
            <div className={`flex-1 flex items-center justify-center ${isLoading ? 'blur-sm' : ''} ${showResponse ? 'scale-0 rotate-180 transition-all duration-500' : ''}`}>
                <div className="max-w-2xl w-full text-center px-4">
                    <h1 className="text-4xl font-bold mb-4 animate-fade-in text-white">
                        How are you feeling today?
                    </h1>
                    <p className="text-lg text-gray-400 mb-12">
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
                                    ${selectedMood?.id === mood.id ? 'ring-2 ring-[#1DB954]' : ''}
                                    flex flex-col items-center justify-center
                                    text-white font-medium
                                `}
                            >
                                <h3 className="text-xl font-semibold mb-2">{mood.label}</h3>
                                <p className="text-sm opacity-90">
                                    {selectedMood?.id === mood.id ? 'Analyzing your mood...' : 'Click to select'}
                                </p>
                            </button>
                        ))}
                    </div>
                    
                    <p className="mt-12 text-sm text-gray-500">
                        Our AI will analyze your mood and create a personalized music experience
                    </p>
                </div>
            </div>

            {/* AI Loader */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="bg-black/50 backdrop-blur-md rounded-full p-8 border-2 border-[#1DB954]/20">
                        <div className="text-4xl font-bold text-[#1DB954] animate-pulse animate-bounce-x">AI</div>
                        <div className="mt-4 text-sm text-gray-400 text-center">
                            Analyzing your mood and<br/>curating the perfect playlist...
                        </div>
                    </div>
                </div>
            )}

            {/* AI Response Container */}
            {showResponse && (
                <div className="absolute inset-0 flex items-center justify-center p-4 z-0 overflow-y-auto">
                    <div className="bg-[#181818] backdrop-blur-md rounded-xl p-8 w-full max-w-5xl mx-4 my-[20%] max-h-[80vh] border border-[#282828] relative">
                        <button 
                            onClick={() => {
                                setShowResponse(false);
                                setSelectedMood(null);
                                setRecommendedSongs([]);
                            }}
                            className="absolute top-4 left-4 flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-medium">Back to Moods</span>
                        </button>
                        <div className="text-white mt-8">
                            <h2 className="text-2xl font-bold mb-6">Your {selectedMood?.label} Playlist</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto overflow-y-auto">
                                {recommendedSongs.map((song) => (
                                    <div 
                                        key={song.id}
                                        className="bg-[#242424] rounded-lg p-6 hover:bg-[#282828] transition-all duration-300 flex flex-col max-w-sm mx-auto w-full border border-[#282828]"
                                    >
                                        <h3 className="text-lg font-semibold mb-2">{song.title}</h3>
                                        <p className="text-gray-400 text-sm mb-2">{song.artist}</p>
                                        <p className="text-gray-500 text-sm italic mb-4 flex-grow">{song.reason}</p>
                                        <div className="flex justify-center">
                                            <button 
                                                className="mt-auto bg-[#1DB954] hover:bg-[#1ed760] px-4 py-2 rounded-full text-sm transition-all duration-300 w-1/2 text-black font-medium"
                                                onClick={() => {
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
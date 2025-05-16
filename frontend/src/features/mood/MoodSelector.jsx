import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MoodSelector = () => {
    const navigate = useNavigate();
    const [selectedMood, setSelectedMood] = useState(null);

    const moods = [
        { id: 'happy', label: 'Happy & Energetic', color: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
        { id: 'calm', label: 'Calm & Relaxed', color: 'bg-blue-500', hover: 'hover:bg-blue-600' },
        { id: 'focused', label: 'Focused & Productive', color: 'bg-green-500', hover: 'hover:bg-green-600' },
        { id: 'melancholic', label: 'Melancholic & Reflective', color: 'bg-purple-500', hover: 'hover:bg-purple-600' }
    ];

    const handleMoodSelect = (mood) => {
        setSelectedMood(mood);
        // In future: Will trigger AI music recommendation
        // For now, navigate to the music library
        setTimeout(() => {
            navigate('/library');
        }, 1000);
    };

    return (
        <div className="w-full h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
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
        </div>
    );
};

export default MoodSelector; 
import {assets} from '../assets/assets.js';
import {useNavigate, useLocation} from "react-router-dom";
import {useContext, useEffect, useState} from "react";
import {PlayerContext} from "../context/PlayerContext.jsx";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {artistsData, isLoading} = useContext(PlayerContext);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isOpen, setIsOpen] = useState(true);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleArtistClick = (artist) => {
        navigate('/search', { 
            state: { 
                artist: {
                    _id: artist._id,
                    name: artist.name,
                    image: artist.image,
                    spotifyId: artist.spotifyId,
                    userId: artist.userId,
                    genres: artist.genres,
                    popularity: artist.popularity,
                    addedAt: artist.addedAt
                }
            } 
        });
    };

    return (
        <div className={`h-full bg-black flex flex-col transition-all duration-300 ease-in-out ${isOpen ? 'w-[300px]' : 'w-[80px]'}`}>
            {/* Toggle Button */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="absolute -right-3 top-6 p-2 text-white hover:bg-white/10 rounded-l-lg transition-all duration-300 bg-black"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`h-6 w-6 transition-transform duration-300 ${isOpen ? 'rotate-0' : 'rotate-180'}`}
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                    strokeWidth={2}
                >
                    {isOpen ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    )}
                </svg>
            </button>

            {/* Top Navigation Section */}
            <div className="p-6">
                <div className="flex flex-col gap-2">
                    {/* Search */}
                    <div 
                        onClick={() => navigate('/search')}
                        className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            location.pathname === '/search' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <img src={assets.search_icon} alt="Search" className="w-6 h-6" />
                        <p className={`text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Search</p>
                    </div>

                    {/* Mood */}
                    <div 
                        onClick={() => navigate('/mood')}
                        className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            location.pathname === '/mood' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <img src={assets.plays_icon} alt="Mood" className="w-6 h-6" />
                        <p className={`text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Mood</p>
                    </div>

                    {/* Library */}
                    <div 
                        onClick={() => navigate('/')}
                        className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            location.pathname === '/' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <img src={assets.stack_icon} alt="Library" className="w-7 h-7" />
                        <p className={`text-white transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 w-0'}`}>Library</p>
                    </div>
                </div>
            </div>

            {/* Artists Grid Section */}
            <div className="flex-1 overflow-y-auto px-6">
                <div className="sticky top-0 bg-black py-4 z-10">
                    <p className={`pl-1 text-white text-sm font-bold transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}>artists</p>
                </div>
                {isLoading ? (
                    <div className="flex justify-center items-center min-h-[200px]">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                    </div>
                ) : !artistsData || artistsData.length === 0 ? (
                    <div className="text-center text-gray-400 text-sm">
                        No artists added yet
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-x-1 gap-y-4">
                        {artistsData.map((artist) => (
                            <div
                                key={artist._id}
                                onClick={() => handleArtistClick(artist)}
                                className="group cursor-pointer max-w-[65px] mx-auto"
                            >
                                <div className="aspect-square rounded-full overflow-hidden relative">
                                    <img 
                                        src={artist.image} 
                                        alt={artist.name} 
                                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Sidebar; 
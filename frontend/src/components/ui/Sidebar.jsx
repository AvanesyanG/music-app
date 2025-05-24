import { assets } from "../../assets/assets.js";
import { useNavigate, useLocation } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import { PlayerContext } from "../../context/PlayerContext.jsx";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/clerk-react";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { albumsData } = useContext(PlayerContext);
    const [isHovered, setIsHovered] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            const scrollPosition = window.scrollY;
            setIsScrolled(scrollPosition > 0);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleAlbumClick = (album) => {
        navigate(`/album/${album._id}`, { state: { album } });
    };

    return (
        <div className="w-[300px] h-full bg-black flex flex-col">
            {/* Top Section */}
            <div className="p-6">
                <div className="flex flex-col gap-2">
                    <div 
                        onClick={() => navigate('/search')}
                        className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            location.pathname === '/search' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <img src={assets.search_icon} alt="Search" className="w-5 h-5" />
                        <p className="text-white">Search</p>
                    </div>
                    <div 
                        onClick={() => navigate('/mood')}
                        className={`flex items-center gap-4 px-4 py-2 rounded-lg cursor-pointer transition-colors ${
                            location.pathname === '/mood' ? 'bg-white/10' : 'hover:bg-white/5'
                        }`}
                    >
                        <img src={assets.mood_icon} alt="Mood" className="w-5 h-5" />
                        <p className="text-white">Mood</p>
                    </div>
                </div>
            </div>

            {/* Library Section */}
            <div className="flex-1 overflow-y-auto px-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <img src={assets.library_icon} alt="Library" className="w-5 h-5" />
                        <p className="text-white">Your Library</p>
                    </div>
                </div>
                <div className="space-y-4">
                    {albumsData.map((album) => (
                        <div
                            key={album._id}
                            onClick={() => handleAlbumClick(album)}
                            className="flex items-center gap-4 p-2 rounded-lg cursor-pointer hover:bg-white/5 transition-colors"
                        >
                            <img src={album.image} alt={album.name} className="w-12 h-12 rounded-lg" />
                            <div>
                                <p className="text-white text-sm font-medium">{album.name}</p>
                                <p className="text-gray-400 text-xs">{album.by}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Player Section */}
            <div className="p-6">
                <div className="bg-white/10 rounded-lg p-4">
                    <div className="flex items-center gap-4 mb-4">
                        <img src={assets.spotify_logo} alt="Spotify" className="w-12 h-12" />
                        <div>
                            <p className="text-white font-medium">Spotify Player</p>
                            <p className="text-gray-400 text-sm">Web Player</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <SignedOut>
                            <SignInButton>
                                <button className="bg-white text-black px-4 py-2 rounded-full text-sm font-medium hover:bg-gray-200 transition-colors">
                                    Sign In
                                </button>
                            </SignInButton>
                        </SignedOut>
                        <SignedIn>
                            <UserButton
                                appearance={{
                                    elements: {
                                        userButtonAvatarBox: "w-8 h-8",
                                    },
                                }}
                            />
                        </SignedIn>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 
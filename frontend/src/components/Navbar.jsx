import {assets} from "../assets/assets.js";
import {useNavigate, useLocation} from "react-router-dom";
import { useRef, useEffect, useState, useContext } from "react";
import { PlayerContext } from "../context/PlayerContext.jsx";

const Navbar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { albumsData } = useContext(PlayerContext);
    const [backgroundStyle, setBackgroundStyle] = useState({});
    const containerRef = useRef(null);
    const buttonRefs = {
        home: useRef(null),
        search: useRef(null),
        mood: useRef(null)
    };
    
    const isAlbumRoute = location.pathname.includes('/library/album/');
    const albumId = isAlbumRoute ? location.pathname.split("/").pop() : null;
    const currentAlbum = albumId ? albumsData.find(x => x._id === albumId) : null;

    useEffect(() => {
        const updateBackgroundPosition = () => {
            let activeButton;
            switch(location.pathname) {
                case '/':
                    activeButton = buttonRefs.home.current;
                    break;
                case '/search':
                    activeButton = buttonRefs.search.current;
                    break;
                case '/mood':
                    activeButton = buttonRefs.mood.current;
                    break;
                default:
                    activeButton = buttonRefs.home.current;
            }

            if (activeButton && containerRef.current) {
                const containerLeft = containerRef.current.getBoundingClientRect().left;
                const buttonRect = activeButton.getBoundingClientRect();
                const left = buttonRect.left - containerLeft;
                
                setBackgroundStyle({
                    transform: `translateX(${left}px)`,
                    width: `${buttonRect.width}px`
                });
            }
        };

        updateBackgroundPosition();
        window.addEventListener('resize', updateBackgroundPosition);
        return () => window.removeEventListener('resize', updateBackgroundPosition);
    }, [location.pathname]);

    const handlePrevious = () => {
        if (isAlbumRoute) {
            navigate('/');
        }
    };

    return (
        <div className="w-full flex justify-between items-center">
            <div className="flex items-center gap-6">
                <div className="w-8 overflow-hidden transition-all duration-300 ease-in-out" style={{ width: isAlbumRoute ? '2rem' : '0' }}>
                    <button 
                        onClick={handlePrevious}
                        className="w-8 h-8 flex items-center justify-center bg-black hover:bg-gray-800 rounded-full transition-colors"
                    >
                        <img 
                            src={assets.arrow_left} 
                            alt="Previous"
                            className="w-5 h-5"
                        />
                    </button>
                </div>
                <div ref={containerRef} className="flex items-center gap-2 bg-black/20 p-1 rounded-full relative transition-transform duration-300 ease-in-out">
                    <div 
                        className="absolute h-[calc(100%-8px)] bg-white rounded-full transition-transform duration-300 ease-out"
                        style={backgroundStyle}
                    />
                    <p 
                        ref={buttonRefs.home}
                        onClick={() => navigate('/')} 
                        className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors relative z-10 min-w-[100px] text-center overflow-hidden ${
                            (location.pathname === '/' || isAlbumRoute) ? 'text-black' : 'text-white hover:text-gray-200'
                        }`}
                    >
                        <span 
                            className="inline-block w-full transition-all duration-300 ease-in-out"
                            style={{
                                opacity: isAlbumRoute && currentAlbum ? 0 : 1,
                                transform: isAlbumRoute && currentAlbum ? 'translateY(-100%)' : 'translateY(0)',
                                position: 'absolute',
                                left: 0,
                                right: 0
                            }}
                        >
                            Home
                        </span>
                        <span 
                            className="inline-block w-full transition-all duration-300 ease-in-out"
                            style={{
                                opacity: isAlbumRoute && currentAlbum ? 1 : 0,
                                transform: isAlbumRoute && currentAlbum ? 'translateY(0)' : 'translateY(100%)',
                            }}
                        >
                            {currentAlbum?.name || 'Home'}
                        </span>
                    </p>
                    <p 
                        ref={buttonRefs.search}
                        onClick={() => navigate('/search')} 
                        className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors relative z-10 min-w-[100px] text-center ${
                            location.pathname === '/search' ? 'text-black' : 'text-white hover:text-gray-200'
                        }`}
                    >
                        Search
                    </p>
                    <p 
                        ref={buttonRefs.mood}
                        onClick={() => navigate('/mood')} 
                        className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors relative z-10 min-w-[100px] text-center ${
                            location.pathname === '/mood' ? 'text-black' : 'text-white hover:text-gray-200'
                        }`}
                    >
                        Mood
                    </p>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <p className="bg-white text-black text-[15px] px-4 py-1.5 rounded-full hidden md:block cursor-pointer hover:bg-gray-200 transition-colors">
                    Explore Premium
                </p>
                <p className="bg-black text-white py-1.5 px-4 rounded-full text-[15px] cursor-pointer hover:bg-gray-900 transition-colors">
                    Install App
                </p>
                <div className="bg-purple-500 text-black w-8 h-8 rounded-full flex items-center justify-center cursor-pointer hover:bg-purple-600 transition-colors">
                    G
                </div>
            </div>
        </div>
    );
};

export default Navbar;

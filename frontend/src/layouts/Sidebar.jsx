import {assets} from '../assets/assets.js';
import {useNavigate, useLocation} from "react-router-dom";
import {useContext, useState} from "react";
import {PlayerContext} from "../context/PlayerContext.jsx";

const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const {albumsData} = useContext(PlayerContext);
    const [isOpen, setIsOpen] = useState(true);
    
    // Get current album's background color if on album route
    const isAlbumRoute = location.pathname.includes('/library/album/');
    const albumId = isAlbumRoute ? location.pathname.split("/").pop() : null;
    const currentAlbum = albumId ? albumsData.find(x => x._id === albumId) : null;
    const baseColor = currentAlbum?.bgColor || '#1E293B';
    
    // Function to darken hex color
    const darkenColor = (hex) => {
        // Remove the # if present
        hex = hex.replace('#', '');
        
        // Convert to RGB
        let r = parseInt(hex.substring(0, 2), 16);
        let g = parseInt(hex.substring(2, 4), 16);
        let b = parseInt(hex.substring(4, 6), 16);
        
        // Darken by reducing each component by 40%
        r = Math.floor(r * 0.6);
        g = Math.floor(g * 0.6);
        b = Math.floor(b * 0.6);
        
        // Convert back to hex
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    };

    const gradientStart = darkenColor(baseColor);
    
    return (
        <div className="relative hidden lg-sidebar:flex">
            <div 
                className={`h-full transition-all duration-300 ease-in-out ${
                    isOpen ? 'w-[300px]' : 'w-0'
                } flex flex-col gap-2 text-white overflow-hidden relative`}
            >
                <div className="bg-black h-[15%] rounded flex flex-col justify-around min-w-[300px] m-2">
                    <div onClick={()=>navigate('/')} className="flex items-center gap-3 pl-8 cursor-pointer hover:bg-white/10 py-2 transition-colors">
                        <img className="w-6" src={assets.home_icon} alt=""/>
                        <p className="font-bold">Home</p>
                    </div>
                    <div onClick={()=>navigate('/search')} className="flex items-center gap-3 pl-8 cursor-pointer hover:bg-white/10 py-2 transition-colors">
                        <img className="w-6" src={assets.search_icon} alt=""/>
                        <p className="font-bold">Search</p>
                    </div>
                    <div onClick={()=>navigate('/mood')} className="flex items-center gap-3 pl-8 cursor-pointer hover:bg-white/10 py-2 transition-colors">
                        <img className="w-6" src={assets.plays_icon} alt=""/>
                        <p className="font-bold">Mood Player</p>
                    </div>
                </div>
                <div className="bg-black h-[85%] rounded min-w-[300px] m-2 relative">
                    <div className="p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <img className="w-8" src={assets.stack_icon} alt=""/>
                            <p className="font-semibold">Your Library</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <img className="w-5" src={assets.plus_icon} alt=""/>
                        </div>
                    </div>
                    <div className="p-4 m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4 border-l border-b border-white/30"
                         style={{
                             background: `linear-gradient(to right, ${gradientStart} 0%, black 100%)`
                         }}>
                        <h1 className="text-white">Explore Premium</h1>
                        <p className="font-light text-white">Get more out of your music</p>
                        <button className="px-4 py-1.5 bg-black text-[15px] text-white rounded-full mt-4 hover:bg-opacity-90">Get Premium</button>
                    </div>
                    <div className="p-4 m-2 rounded font-semibold flex flex-col items-start justify-start gap-1 pl-4 mt-4 border-l border-b border-white/30"
                         style={{
                             background: `linear-gradient(to right, ${gradientStart} 0%, black 100%)`
                         }}>
                        <h1 className="text-white">Install App</h1>
                        <p className="font-light text-white">Listen to music on your desktop</p>
                        <button className="px-4 py-1.5 bg-black text-[15px] text-white rounded-full mt-4 hover:bg-opacity-90">Download</button>
                    </div>
                </div>
            </div>
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-[10%] mb-4 z-[9999] p-2 pr-[30px] rounded-full bg-black hover:bg-opacity-80 transition-all duration-300 ease-in-out hidden lg-sidebar:block ${
                    isOpen ? 'translate-x-[288px]' : 'translate-x-2'
                }`}
            >
                <img 
                    className={`w-6 transition-transform duration-300 ease-in-out ${isOpen ? 'rotate-180' : ''}`}
                    src={assets.arrow_icon} 
                    alt="Toggle sidebar"
                />
            </button>
        </div>
    );
};

export default Sidebar; 
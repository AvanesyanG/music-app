import { useContext } from "react";
import { PlayerContext } from "../context/PlayerContext.jsx";
import { useLocation } from "react-router-dom";
import Sidebar from "./Sidebar.jsx";
import Player from "./Player.jsx";

const MainLayout = ({ children }) => {
    const { audioRef, track, songsData, isLoading, setPlayStatus } = useContext(PlayerContext);
    const location = useLocation();
    const isAuthPage = location.pathname.startsWith('/auth');
    
    // If we're on an auth page, render without Sidebar and Player
    if (isAuthPage) {
        return children;
    }
    
    // Show loading state
    if (isLoading) {
        return (
            <div className="h-screen bg-black flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-400 border-t-green-500 rounded-full animate-spin"></div>
            </div>
        );
    }
    
    return (
        <div className="h-screen bg-black flex flex-col">
            <div className="flex-1 flex overflow-hidden">
                <div className="flex h-full w-full">
                    <Sidebar />
                    <main className="flex-1 overflow-hidden relative min-w-0 w-full">
                        {children}
                    </main>
                </div>
            </div>
            {songsData.length > 0 && <Player />}
           
        </div>
    );
};

export default MainLayout; 
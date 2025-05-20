import { PlayerContext } from "../../context/PlayerContext.jsx";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from '@clerk/clerk-react';

const SongItem = ({ song, showPreview = false, showSpotifyLink = false }) => {
    const { playWithId, getSongsData } = useContext(PlayerContext);
    const { getToken } = useAuth();
    const url = "http://localhost:4000";

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent triggering the play function
        try {
            const token = await getToken();
            const response = await axios.delete(`${url}/api/song/remove/${song.id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.message) {
                toast.success(response.data.message);
                getSongsData(); // Refresh the songs list
            } else {
                toast.error("Failed to delete song");
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error("Error deleting song");
        }
    };

    const handlePlay = () => {
        if (song.previewUrl) {
            // If it's a Spotify song with preview, play the preview
            const audio = new Audio(song.previewUrl);
            audio.play();
        } else {
            // If it's a local song, use the player context
            playWithId(song.id);
        }
    };

    return (
        <div onClick={handlePlay} className="min-w-[200px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] relative group">
            <div className="relative">
                <img className="w-full h-[150px] object-cover rounded" src={song.image} alt={song.title}/>
                {!song.previewUrl && (
                    <button
                        onClick={handleDelete}
                        className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-75 text-white rounded-full 
                                 flex items-center justify-center opacity-0 group-hover:opacity-100 
                                 transition-opacity hover:bg-opacity-100"
                    >
                        ✕
                    </button>
                )}
            </div>
            <p className="font-bold mt-1 mb-0.5 text-sm truncate">{song.title}</p>
            <p className="text-slate-200 text-xs truncate">{song.artist}</p>
            {showSpotifyLink && song.spotifyUrl && (
                <a 
                    href={song.spotifyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1 block"
                    onClick={(e) => e.stopPropagation()}
                >
                    Open in Spotify
                </a>
            )}
        </div>
    );
};

export default SongItem;
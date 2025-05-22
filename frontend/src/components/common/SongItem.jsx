import { PlayerContext } from "../../context/PlayerContext.jsx";
import { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useAuth } from '@clerk/clerk-react';

const SongItem = ({ song, showPreview = false, showSpotifyLink = false }) => {
    const { playWithId, songsData, setSongsData } = useContext(PlayerContext);
    const { getToken } = useAuth();
    const url = "http://localhost:4000";
    const [loading, setLoading] = useState(false);

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
                setSongsData(prevSongs => prevSongs.filter(s => s._id !== song.id));
            } else {
                toast.error("Failed to delete song");
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error("Error deleting song");
        }
    };

    const handlePlay = () => {
        console.log('Song clicked:', song);
        if (song._id || song.id) {
            // If it's a song from our library, use playWithId
            playWithId(song._id || song.id);
        } else if (
            song.previewUrl &&
            !song.previewUrl.includes('youtube.com/watch') &&
            !song.previewUrl.includes('youtube.com/embed')
        ) {
            // Only play if it's a direct audio file
            console.log('Playing direct audio preview:', song.previewUrl);
            const audio = new Audio(song.previewUrl);
            audio.play();
        } else {
            console.warn('Cannot play this song: not a valid audio file or library song.');
        }
    };

    const handleAddSong = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            const token = await getToken();
            const songData = {
                name: song.title,
                artist: song.artist,
                desc: song.artist,
                image: song.image,
                album: "none",
                spotifyId: song.id,
                spotifyUrl: song.spotifyUrl,
                previewUrl: song.previewUrl,
                file: song.previewUrl || song.spotifyUrl
            };

            const response = await axios.post(`${url}/api/song/add-spotify`, songData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.data.success) {
                toast.success("Song added successfully!");
                if (response.data.song) {
                    setSongsData(prevSongs => [...prevSongs, response.data.song]);
                }
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            console.error('Error adding song:', error);
            toast.error(error.response?.data?.error || "Error occurred");
        }
        setLoading(false);
    };

    const isSongAdded = () => {
        return songsData.some(s => s.spotifyId === song.id);
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
            {showSpotifyLink && (
                <button 
                    onClick={handleAddSong}
                    disabled={isSongAdded() || loading}
                    className={`text-xs px-3 py-1 rounded-full mt-2 transition-colors ${
                        isSongAdded()
                            ? 'bg-gray-600 cursor-not-allowed text-white'
                            : 'bg-[#1DB954] hover:bg-[#1ed760] text-white'
                    }`}
                >
                    {loading ? "Adding..." : isSongAdded() ? "Added" : "Add Song"}
                </button>
            )}
        </div>
    );
};

export default SongItem;
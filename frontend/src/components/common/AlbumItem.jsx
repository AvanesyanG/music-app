import { useContext, useState } from "react";
import { PlayerContext } from "../../context/PlayerContext.jsx";
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";

const AlbumItem = ({ album, showSpotifyLink = false }) => {
    const navigate = useNavigate();
    const { albumsData, setAlbumsData, songsData, setSongsData } = useContext(PlayerContext);
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const url = "http://localhost:4000";

    const isAlbumAdded = () => {
        return albumsData.some(a => a.spotifyId === album.id);
    };

    const handleClick = () => {
        if (album.id) {
            navigate(`/album/${album.id}`);
        }
    };

    const handleAddAlbum = async (e) => {
        e.preventDefault();
        e.stopPropagation();
        setLoading(true);
        try {
            const token = await getToken();
            
            // First, add the album
            const albumData = {
                name: album.title,
                artist: album.artist,
                desc: album.artist,
                bgColor: "#1DB954",
                image: album.image,
                spotifyId: album.id,
                spotifyUrl: album.spotifyUrl
            };

            const albumResponse = await axios.post(`${url}/api/album/add-spotify`, albumData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (albumResponse.data.success) {
                // Get album tracks from Spotify
                const tracksResponse = await axios.get(`${url}/api/spotify/album-tracks/${album.id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });

                if (tracksResponse.data.tracks) {
                    // Add each song from the album
                    for (const track of tracksResponse.data.tracks) {
                        const songData = {
                            name: track.name,
                            artist: track.artists.map(a => a.name).join(', '),
                            desc: track.artists.map(a => a.name).join(', '),
                            image: album.image,
                            album: albumResponse.data.album._id,
                            spotifyId: track.id,
                            spotifyUrl: track.external_urls.spotify,
                            previewUrl: track.preview_url,
                            file: track.preview_url || track.external_urls.spotify,
                            duration: track.duration_ms
                        };

                        await axios.post(`${url}/api/song/add-spotify`, songData, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    }
                }

                toast.success("Album and its songs added successfully!");
                if (albumResponse.data.album) {
                    setAlbumsData(prevAlbums => [...prevAlbums, albumResponse.data.album]);
                }
            } else {
                toast.error("Failed to add album");
            }
        } catch (error) {
            console.error('Error adding album:', error);
            toast.error(error.response?.data?.error || "Error occurred");
        }
        setLoading(false);
    };

    return (
        <div onClick={handleClick} className="min-w-[200px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
            <img 
                className="w-full h-[150px] object-cover rounded" 
                src={album.image} 
                alt={album.title}
            />
            <p className="font-bold mt-1 mb-0.5 text-sm truncate">{album.title}</p>
            <p className="text-slate-200 text-xs truncate">{album.artist}</p>
            {showSpotifyLink && (
                <button 
                    onClick={handleAddAlbum}
                    disabled={isAlbumAdded() || loading}
                    className={`text-xs px-3 py-1 rounded-full mt-2 transition-colors ${
                        isAlbumAdded()
                            ? 'bg-gray-600 cursor-not-allowed text-white'
                            : 'bg-[#1DB954] hover:bg-[#1ed760] text-white'
                    }`}
                >
                    {loading ? "Adding..." : isAlbumAdded() ? "Added" : "Add Album"}
                </button>
            )}
        </div>
    );
};

export default AlbumItem;
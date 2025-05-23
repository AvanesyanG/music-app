import { useContext, useState } from "react";
import { PlayerContext } from "../../context/PlayerContext.jsx";
import { useAuth } from '@clerk/clerk-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import { spotifyService } from "../../services/spotifyService";

const AlbumItem = ({ album, showSpotifyLink = false }) => {
    const navigate = useNavigate();
    const { albumsData, setAlbumsData } = useContext(PlayerContext);
    const { getToken } = useAuth();
    const [loading, setLoading] = useState(false);
    const url = "http://localhost:4000";

    const isAlbumAdded = () => {
        return albumsData?.some(a => a.spotifyId === album.id) || false;
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
            if (!token) {
                toast.error("Authentication token not available");
                setLoading(false);
                return;
            }
            
            // First verify we can get the tracks
            let tracksResponse;
            try {
                console.log('Fetching tracks for album:', {
                    id: album.id,
                    title: album.title,
                    url: `${url}/api/spotify/album/${album.id}/tracks`
                });
                
                tracksResponse = await axios.get(`${url}/api/spotify/album/${album.id}/tracks`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                });
                
                console.log('Tracks response:', {
                    status: tracksResponse.status,
                    data: tracksResponse.data,
                    tracksCount: tracksResponse.data?.length
                });
                
                if (!tracksResponse.data || tracksResponse.data.length === 0) {
                    toast.error("This album has no available tracks");
                    setLoading(false);
                    return;
                }
            } catch (error) {
                console.error('Error verifying album tracks:', {
                    error: error.message,
                    response: error.response?.data,
                    status: error.response?.status,
                    headers: error.response?.headers
                });
                
                const errorMessage = error.response?.data?.error || 
                                   error.response?.data?.details || 
                                   "Could not verify album tracks. Please try again later.";
                toast.error(errorMessage);
                setLoading(false);
                return;
            }

            // Then add the album
            const albumData = {
                name: album.title,
                artist: album.artist,
                desc: album.artist,
                bgColor: "#1DB954",
                image: album.image,
                spotifyId: album.id,
                spotifyUrl: album.spotifyUrl
            };

            console.log('Adding album:', albumData);
            const albumResponse = await axios.post(`${url}/api/album/add-spotify`, albumData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (albumResponse.data.success) {
                console.log('Album added successfully, adding tracks...');
                // Add each song from the album
                for (const track of tracksResponse.data) {
                    // Get YouTube URL for the track
                    let youtubeUrl = null;
                    try {
                        console.log('Searching YouTube for:', { title: track.title, artist: track.artist });
                        youtubeUrl = await spotifyService.getYouTubePreviewUrl(track.title, track.artist);
                        
                        if (youtubeUrl) {
                            console.log('Found YouTube URL:', youtubeUrl);
                        } else {
                            console.log('No YouTube results found for:', { title: track.title, artist: track.artist });
                        }
                    } catch (youtubeError) {
                        console.error('Error getting YouTube URL:', {
                            track: track.title,
                            error: youtubeError.message
                        });
                    }

                    const songData = {
                        name: track.title,
                        artist: track.artist,
                        desc: track.artist,
                        image: album.image,
                        album: albumResponse.data.album._id,
                        spotifyId: track.id,
                        spotifyUrl: track.spotifyUrl,
                        previewUrl: track.previewUrl,
                        file: youtubeUrl || track.previewUrl || track.spotifyUrl,
                        duration: track.duration
                    };

                    console.log('Adding track:', {
                        title: track.title,
                        id: track.id,
                        hasPreview: !!track.previewUrl,
                        hasYoutube: !!youtubeUrl,
                        finalSource: youtubeUrl ? 'youtube' : (track.previewUrl ? 'spotify_preview' : 'spotify_url')
                    });
                    
                    try {
                        await axios.post(`${url}/api/song/add-spotify`, songData, {
                            headers: {
                                Authorization: `Bearer ${token}`,
                                'Content-Type': 'application/json'
                            }
                        });
                    } catch (trackError) {
                        console.error('Error adding track:', {
                            track: track.title,
                            error: trackError.message,
                            response: trackError.response?.data
                        });
                        // Continue with other tracks even if one fails
                    }
                }

                toast.success("Album and its songs added successfully!");
                if (albumResponse.data.album && typeof setAlbumsData === 'function') {
                    setAlbumsData(prevAlbums => [...(prevAlbums || []), albumResponse.data.album]);
                }
            } else {
                toast.error(albumResponse.data.message || "Failed to add album");
            }
        } catch (error) {
            console.error('Error adding album:', {
                error: error.message,
                response: error.response?.data,
                status: error.response?.status,
                headers: error.response?.headers
            });
            const errorMessage = error.response?.data?.error || 
                               error.response?.data?.details || 
                               error.message || 
                               "Error occurred while adding album";
            toast.error(errorMessage);
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
            {album.tracks && album.tracks.length > 0 && (
                <p className="text-slate-400 text-xs mt-1">
                    {album.tracks.length} tracks • {album.totalTracks} total
                </p>
            )}
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
            {album.tracks && album.tracks.length > 0 && (
                <div className="mt-2 text-xs text-slate-400">
                    <p className="font-medium mb-1">Preview tracks:</p>
                    <div className="space-y-1 max-h-[100px] overflow-y-auto">
                        {album.tracks.slice(0, 3).map(track => (
                            <div key={track.id} className="flex items-center gap-2">
                                <span className="truncate">{track.title}</span>
                                {track.previewUrl && (
                                    <span className="text-[#1DB954]">•</span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AlbumItem;
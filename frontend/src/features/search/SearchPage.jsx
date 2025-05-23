import { useState, useEffect, useCallback, useContext } from 'react';
import { assets } from '../../assets/assets';
import { spotifyService } from '../../services/spotifyService';
import SongItem from '../../components/common/SongItem';
import AlbumItem from '../../components/common/AlbumItem';
import debounce from 'lodash/debounce';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useAuth } from '@clerk/clerk-react';
import { PlayerContext } from '../../context/PlayerContext.jsx';

const SearchPage = () => {
    const { getToken } = useAuth();
    const { songsData, setSongsData } = useContext(PlayerContext);
    const url = 'http://localhost:4000';
    const [searchQuery, setSearchQuery] = useState('');
    const [searchType, setSearchType] = useState('all');
    const [searchResults, setSearchResults] = useState({
        songs: [],
        artists: [],
        albums: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [userArtists, setUserArtists] = useState([]);
    const [isLoadingArtists, setIsLoadingArtists] = useState(false);
    const [albumData, setAlbumData] = useState([]);
    const [selectedAlbum, setSelectedAlbum] = useState("none");

    const fetchUserArtists = async () => {
        if (isLoadingArtists) return;
        
        try {
            setIsLoadingArtists(true);
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            const response = await fetch(`${url}/api/artists`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.status === 404) {
                setUserArtists([]);
                return;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch artists');
            }

            const data = await response.json();
            setUserArtists(data.artists || []);
        } catch (error) {
            console.error('Error fetching user artists:', error);
            setUserArtists([]);
        } finally {
            setIsLoadingArtists(false);
        }
    };

    const performSearch = useCallback(async (query, type) => {
        if (!query.trim()) {
            setSearchResults({ songs: [], artists: [], albums: [] });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            
            let results = { songs: [], artists: [], albums: [] };
            
            if ( type === 'songs') {
                results.songs = await spotifyService.searchSongs(query);
            }
            
            if ( type === 'artists') {
                results.artists = await spotifyService.searchArtists(query);
                fetchUserArtists().catch(() => setUserArtists([]));
            }
            
            if ( type === 'albums') {
                results.albums = await spotifyService.searchAlbums(query);
            }
            
            setSearchResults(results);
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    const debouncedSearch = useCallback(
        debounce((query, type) => performSearch(query, type), 500),
        [performSearch]
    );

    useEffect(() => {
        debouncedSearch(searchQuery, searchType);
        return () => debouncedSearch.cancel();
    }, [searchQuery, searchType, debouncedSearch]);

    const loadAlbumData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${url}/api/album/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (response.data.success) {
                setAlbumData(response.data.albums);
            } else {
                toast.error('Unable to load albums data');
            }
        } catch (error) {
            toast.error('Error occurred');
        }
    };

    useEffect(() => {
        loadAlbumData();
        fetchUserArtists();
    }, []);
    // Here's where we add songs to our library
    const handleAddSong = async (song) => {
        try {
            const token = await getToken();
            
            // Get YouTube data first
            let youtubeData = null;
            if (!song.previewUrl) {
                console.log('Getting YouTube data for:', { title: song.title, artist: song.artist });
                youtubeData = await spotifyService.getYouTubePreviewUrl(song.title, song.artist);
                console.log('YouTube data:', youtubeData);
                }

            const songData = {
                name: song.title,
                artist: song.artist,
                desc: song.artist,
                image: song.image,
                album: "none",
                spotifyId: song.id,
                spotifyUrl: song.spotifyUrl,
                previewUrl: youtubeData?.url || song.previewUrl,
                file: youtubeData?.url || song.previewUrl || song.spotifyUrl, // Use the URL string directly
                duration: youtubeData?.duration || Math.floor(song.duration_ms / 1000)
            };

            console.log('Adding song with data:', songData);

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
    };

    const isSongAdded = (spotifyId) => {
        return songsData.some(song => song.spotifyId === spotifyId);
    };

    return (
        <div className="h-full flex flex-col text-white">
            <div className="sticky top-0 z-20 bg-black/30 backdrop-blur-sm pt-4 pb-6">
                <div className="flex flex-col gap-4 px-4">
                    <div className="flex items-center gap-4">
                        <div className="flex-1 relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="What do you want to listen to?"
                                className="w-full bg-[#242424] px-12 py-3 rounded-full text-white placeholder:text-gray-400 focus:outline-none"
                            />
                            <img 
                                src={assets.search_icon} 
                                alt="search"
                                className="absolute left-4 top-1/2 -translate-y-1/2 w-5 opacity-60" 
                            />
                        </div>
                    </div>
                    
                    <div className="flex flex-col gap-2">
                        <h2 className="text-xl font-bold">Search</h2>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setSearchType('songs')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    searchType === 'songs' 
                                        ? 'bg-white text-black' 
                                        : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                                }`}
                            >
                                Songs
                            </button>
                            <button
                                onClick={() => setSearchType('albums')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    searchType === 'albums' 
                                        ? 'bg-white text-black' 
                                        : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                                }`}
                            >
                                Albums
                            </button>
                            <button
                                onClick={() => setSearchType('artists')}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                    searchType === 'artists' 
                                        ? 'bg-white text-black' 
                                        : 'bg-[#242424] text-white hover:bg-[#2a2a2a]'
                                }`}
                            >
                                Artists
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex-1 overflow-auto px-4 pt-4">
                {!searchQuery ? (
                    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex-none w-[300px] bg-gradient-to-br from-purple-700 to-purple-900 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl">Total Songs</h3>
                                <div className="bg-white/10 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold mb-2">{songsData.length}</p>
                            <p className="text-sm text-gray-300">Songs in your library</p>
                        </div>

                        <div className="flex-none w-[300px] bg-gradient-to-br from-blue-700 to-blue-900 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl">Total Albums</h3>
                                <div className="bg-white/10 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold mb-2">{albumData.length}</p>
                            <p className="text-sm text-gray-300">Albums in your collection</p>
                        </div>

                        <div className="flex-none w-[300px] bg-gradient-to-br from-green-700 to-green-900 p-6 rounded-lg">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="font-bold text-xl">Total Artists</h3>
                                <div className="bg-white/10 p-2 rounded-full">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                </div>
                            </div>
                            <p className="text-4xl font-bold mb-2">{userArtists.length}</p>
                            <p className="text-sm text-gray-300">Artists you follow</p>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {loading ? (
                            <div className="flex justify-center items-center min-h-[200px]">
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                            </div>
                        ) : error ? (
                            <div className="text-center text-red-500 p-4">
                                {error}
                            </div>
                        ) : (
                            <>
                                {(searchType === 'all' || searchType === 'songs') && searchResults.songs.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-bold mb-4">Songs</h2>
                                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                            {searchResults.songs.map(song => (
                                                <div key={song.id} className="min-w-[200px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] relative group">
                                                    <div className="relative">
                                                        <img className="w-full h-[150px] object-cover rounded" src={song.image} alt={song.title}/>
                                                    </div>
                                                    <p className="font-bold mt-1 mb-0.5 text-sm truncate">{song.title}</p>
                                                    <p className="text-slate-200 text-xs truncate">{song.artist}</p>
                                                    <div className="flex flex-col gap-2 mt-2">
                                                        <select 
                                                            onChange={(e) => setSelectedAlbum(e.target.value)} 
                                                            value={selectedAlbum}
                                                            className="bg-[#3E3E3E] text-white outline-none border border-gray-600 p-1 rounded-md w-full focus:border-gray-400 transition-colors text-xs"
                                                        >
                                                            <option value="none">No Album</option>
                                                            {albumData.map((item, index) => (
                                                                <option key={index} value={item.name}>{item.name}</option>
                                                            ))}
                                                        </select>
                                                        <button 
                                                            onClick={() => handleAddSong(song)}
                                                            disabled={isSongAdded(song.id)}
                                                            className={`text-xs px-3 py-1 rounded-full transition-colors ${
                                                                isSongAdded(song.id)
                                                                    ? 'bg-gray-600 cursor-not-allowed text-white'
                                                                    : 'bg-[#1DB954] hover:bg-[#1ed760] text-white'
                                                            }`}
                                                        >
                                                            {isSongAdded(song.id) ? "Added" : "Add Song"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {(searchType === 'all' || searchType === 'artists') && searchResults.artists.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-bold mb-4">Artists</h2>
                                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {searchResults.artists.map(artist => (
                                                <div 
                                                    key={artist.id}
                                                    className="bg-[#242424] p-4 rounded-lg hover:bg-[#2a2a2a] transition-colors"
                                                >
                                                    <div className="aspect-square rounded-full overflow-hidden mb-4">
                                                        <img 
                                                            src={artist.image} 
                                                            alt={artist.name}
                                                            className="w-full h-full object-cover"
                                                        />
                                                    </div>
                                                    <h3 className="font-bold truncate">{artist.name}</h3>
                                                    <p className="text-sm text-gray-400 mb-4">Artist</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {(searchType === 'all' || searchType === 'albums') && searchResults.albums.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-bold mb-4">Albums</h2>
                                        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                                            {searchResults.albums.map(album => (
                                                <AlbumItem 
                                                    key={album.id} 
                                                    album={album}
                                                    showSpotifyLink={true}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {!loading && 
                                 searchResults.songs.length === 0 && 
                                 searchResults.artists.length === 0 && 
                                 searchResults.albums.length === 0 && (
                                    <div className="text-center text-gray-400 p-8">
                                        No results found for "{searchQuery}"
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage;
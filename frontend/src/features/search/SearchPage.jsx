import { useState, useEffect, useCallback } from 'react';
import { assets } from '../../assets/assets';
import { spotifyService } from '../../services/spotifyService';
import SongItem from '../../components/common/SongItem';
import AlbumItem from '../../components/common/AlbumItem';
import debounce from 'lodash/debounce';

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState({
        songs: [],
        albums: []
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const performSearch = useCallback(async (query) => {
        if (!query.trim()) {
            setSearchResults({ songs: [], albums: [] });
            return;
        }

        try {
            setLoading(true);
            setError(null);
            const [songs, albums] = await Promise.all([
                spotifyService.searchSongs(query),
                spotifyService.searchAlbums(query)
            ]);
            setSearchResults({ songs, albums });
        } catch (err) {
            console.error('Search error:', err);
            setError('Failed to perform search. Please try again.');
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounce the search to avoid too many API calls
    const debouncedSearch = useCallback(
        debounce((query) => performSearch(query), 500),
        [performSearch]
    );

    useEffect(() => {
        debouncedSearch(searchQuery);
        return () => debouncedSearch.cancel();
    }, [searchQuery, debouncedSearch]);

    return (
        <div className="h-full flex flex-col text-white">
            <div className="sticky top-0 z-20 bg-black/30 backdrop-blur-sm pt-4 pb-6">
                <div className="flex items-center gap-4 px-4">
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
            </div>

            <div className="flex-1 overflow-auto px-4 pt-4">
                {!searchQuery ? (
                    // Browse Categories
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        <div className="bg-gradient-to-br from-purple-700 to-purple-900 p-4 rounded-lg cursor-pointer hover:bg-gradient-to-br hover:from-purple-600 hover:to-purple-800 transition-all">
                            <h3 className="font-bold text-2xl">Made For You</h3>
                            <p className="mt-4 text-sm text-gray-300">Your personal playlists based on your taste</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-700 to-blue-900 p-4 rounded-lg cursor-pointer hover:bg-gradient-to-br hover:from-blue-600 hover:to-blue-800 transition-all">
                            <h3 className="font-bold text-2xl">Charts</h3>
                            <p className="mt-4 text-sm text-gray-300">Top songs in your region</p>
                        </div>
                        <div className="bg-gradient-to-br from-green-700 to-green-900 p-4 rounded-lg cursor-pointer hover:bg-gradient-to-br hover:from-green-600 hover:to-green-800 transition-all">
                            <h3 className="font-bold text-2xl">New Releases</h3>
                            <p className="mt-4 text-sm text-gray-300">Latest hits and albums</p>
                        </div>
                        <div className="bg-gradient-to-br from-red-700 to-red-900 p-4 rounded-lg cursor-pointer hover:bg-gradient-to-br hover:from-red-600 hover:to-red-800 transition-all">
                            <h3 className="font-bold text-2xl">Discover</h3>
                            <p className="mt-4 text-sm text-gray-300">Find new artists and songs</p>
                        </div>
                    </div>
                ) : (
                    // Search Results
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
                                {/* Songs Section */}
                                {searchResults.songs.length > 0 && (
                                    <section>
                                        <h2 className="text-2xl font-bold mb-4">Songs</h2>
                                        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                                            {searchResults.songs.map(song => (
                                                <SongItem 
                                                    key={song.id} 
                                                    song={song}
                                                    showPreview={true}
                                                    showSpotifyLink={true}
                                                />
                                            ))}
                                        </div>
                                    </section>
                                )}

                                {/* Albums Section */}
                                {searchResults.albums.length > 0 && (
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

                                {/* No Results */}
                                {!loading && searchResults.songs.length === 0 && searchResults.albums.length === 0 && (
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
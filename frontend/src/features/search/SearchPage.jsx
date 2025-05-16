import { useState } from 'react';
import { assets } from '../../assets/assets';

const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState('');

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
                    <div className="space-y-6">
                        {/* Top Result */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Top Result</h2>
                            <div className="bg-[#181818] hover:bg-[#282828] transition-all p-5 rounded-lg max-w-[300px]">
                                <img src={assets.img1} alt="Top result" className="w-24 h-24 rounded-lg shadow-xl" />
                                <h3 className="mt-4 text-xl font-bold">Song Title</h3>
                                <p className="text-sm text-gray-400 mt-1">Artist Name</p>
                                <button className="mt-4 bg-green-500 hover:bg-green-400 rounded-full p-3">
                                    <img src={assets.play_icon} alt="play" className="w-6 h-6" />
                                </button>
                            </div>
                        </section>

                        {/* Songs */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Songs</h2>
                            <div className="grid gap-2">
                                {[1,2,3].map((_, i) => (
                                    <div key={i} className="flex items-center gap-4 p-2 rounded-md hover:bg-[#ffffff1a] cursor-pointer">
                                        <img src={assets.img1} alt="song" className="w-12 h-12 rounded" />
                                        <div>
                                            <p className="font-semibold">Song Name</p>
                                            <p className="text-sm text-gray-400">Artist Name</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Artists */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Artists</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[1,2,3,4,5].map((_, i) => (
                                    <div key={i} className="p-4 bg-[#181818] hover:bg-[#282828] transition-all rounded-lg text-center cursor-pointer">
                                        <img src={assets.img1} alt="artist" className="w-full aspect-square rounded-full object-cover mb-4" />
                                        <p className="font-semibold">Artist Name</p>
                                        <p className="text-sm text-gray-400">Artist</p>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Albums */}
                        <section>
                            <h2 className="text-2xl font-bold mb-4">Albums</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {[1,2,3,4,5].map((_, i) => (
                                    <div key={i} className="p-4 bg-[#181818] hover:bg-[#282828] transition-all rounded-lg cursor-pointer">
                                        <img src={assets.img1} alt="album" className="w-full aspect-square rounded-lg object-cover mb-4" />
                                        <p className="font-semibold">Album Name</p>
                                        <p className="text-sm text-gray-400">Album • 2024</p>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SearchPage; 
import { useContext, useState } from 'react';
import { PlayerContext } from '../../context/PlayerContext.jsx';

const ArtistItem = ({ artist }) => {
    return (
        <div 
            className="p-4 rounded-lg bg-[#181818] hover:bg-[#282828] transition-colors cursor-pointer"
        >
            <div className="aspect-square rounded-full overflow-hidden mb-3">
                <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <p className="font-bold text-sm truncate text-center">{artist.name}</p>
            <p className="text-slate-400 text-xs truncate text-center">
                Added {new Date(artist.addedAt).toLocaleDateString()}
            </p>
        </div>
    );
};

const DisplayArtists = () => {
    const { artistsData, isLoading } = useContext(PlayerContext);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // Reduced number of items per page for better visibility
    const totalPages = Math.ceil((artistsData?.length || 0) / itemsPerPage);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-[200px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (!artistsData || artistsData.length === 0) {
        return (
            <div className="text-center text-gray-400 p-4">
                No artists added yet. Search for artists to add them to your list.
            </div>
        );
    }

    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentArtists = artistsData.slice(startIndex, endIndex);

    return (
        <div className="h-full flex flex-col">
            {/* Artists Grid - Fixed height */}
            <div className="flex-1 p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {currentArtists.map(artist => (
                        <ArtistItem key={artist._id} artist={artist} />
                    ))}
                </div>
            </div>

            {/* Pagination - Fixed height */}
            <div className="h-24 flex flex-col items-center justify-center bg-[#181818] border-t border-[#282828]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="px-6 py-2 rounded-full bg-[#282828] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#383838] transition-colors flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Previous
                    </button>
                    
                    <div className="flex items-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                                    currentPage === page
                                        ? 'bg-white text-black'
                                        : 'bg-[#282828] text-white hover:bg-[#383838]'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="px-6 py-2 rounded-full bg-[#282828] text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#383838] transition-colors flex items-center gap-2"
                    >
                        Next
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                </div>
                
                <p className="text-sm text-gray-400 mt-2">
                    Page {currentPage} of {totalPages} • Showing {startIndex + 1}-{Math.min(endIndex, artistsData.length)} of {artistsData.length} artists
                </p>
            </div>
        </div>
    );
};

export default DisplayArtists; 
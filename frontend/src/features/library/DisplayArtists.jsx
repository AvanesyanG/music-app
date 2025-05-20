import { useContext } from 'react';
import { PlayerContext } from '../../context/PlayerContext.jsx';

const ArtistItem = ({ artist }) => {
    return (
        <div 
            className="min-w-[150px] max-w-[200px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]"
        >
            <div className="aspect-square rounded-full overflow-hidden mb-2">
                <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-full h-full object-cover"
                />
            </div>
            <p className="font-bold mt-1 mb-0.5 text-sm truncate">{artist.name}</p>
            <p className="text-slate-200 text-xs truncate">
                Added {new Date(artist.addedAt).toLocaleDateString()}
            </p>
        </div>
    );
};

const DisplayArtists = () => {
    const { artistsData, isLoading } = useContext(PlayerContext);

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

    return (
        <div className="flex gap-2 overflow-x-auto pb-4">
            {artistsData.map(artist => (
                <ArtistItem key={artist._id} artist={artist} />
            ))}
        </div>
    );
};

export default DisplayArtists; 
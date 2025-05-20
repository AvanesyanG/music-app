import AlbumItem from "../../components/common/AlbumItem.jsx";
import SongItem from "../../components/common/SongItem.jsx";
import {useContext, useState, useRef} from "react";
import {PlayerContext} from "../../context/PlayerContext.jsx";
import AddAlbumDropdown from "./dropdowns/AddAlbumDropdown.jsx";
import AddSongDropdown from "./dropdowns/AddSongDropdown.jsx";
import DisplayArtists from "./DisplayArtists.jsx";

const DisplayHome = () => {
    const {songsData,albumsData} = useContext(PlayerContext);
    const [isAlbumDropdownOpen, setIsAlbumDropdownOpen] = useState(false);
    const [isSongDropdownOpen, setIsSongDropdownOpen] = useState(false);
    const albumButtonRef = useRef(null);

    return (
        <>
            <div className="mb-4">
                <div className="my-4 pl-3.5 flex items-center gap-2">
                    <h1 className="font-bold text-xl">Albums</h1>
                    <button 
                        ref={albumButtonRef}
                        onClick={() => setIsAlbumDropdownOpen(true)}
                        className="w-6 h-6 flex items-center justify-center bg-black hover:bg-gray-800 rounded-full transition-colors text-xl relative"
                    >
                        +
                    </button>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-4">
                    {albumsData.map((item, index) => (
                        <AlbumItem 
                            key={index} 
                            album={{
                                id: item._id,
                                title: item.name,
                                artist: item.desc,
                                image: item.image
                            }}
                        />
                    ))}
                </div>
            </div>
            
            <div className="mb-4">
                <div className="my-4 pl-3.5 flex items-center gap-2">
                    <h1 className="font-bold text-xl">Songs</h1>
                    <button 
                        onClick={() => setIsSongDropdownOpen(true)}
                        className="w-6 h-6 flex items-center justify-center bg-black hover:bg-gray-800 rounded-full transition-colors text-xl relative"
                    >
                        +
                    </button>
                </div>
                {songsData && songsData.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-4">
                        {songsData.map((item, index) => (
                            <SongItem 
                                key={index} 
                                song={{
                                    id: item._id,
                                    title: item.name,
                                    artist: item.desc,
                                    image: item.image
                                }}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Artists Section */}
            <div className="mb-4">
                <div className="my-4 pl-3.5">
                    <h1 className="font-bold text-xl">Artists</h1>
                </div>
                <DisplayArtists />
            </div>

            <AddAlbumDropdown 
                isOpen={isAlbumDropdownOpen} 
                onClose={() => setIsAlbumDropdownOpen(false)}
                anchorRef={albumButtonRef}
            />
            <AddSongDropdown 
                isOpen={isSongDropdownOpen} 
                onClose={() => setIsSongDropdownOpen(false)}
                anchorRef={albumButtonRef}
            />
        </>
    );
};

export default DisplayHome;
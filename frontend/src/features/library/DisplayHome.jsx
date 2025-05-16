import AlbumItem from "../../components/common/AlbumItem.jsx";
import SongItem from "../../components/common/SongItem.jsx";
import {useContext} from "react";
import {PlayerContext} from "../../context/PlayerContext.jsx";

const DisplayHome = () => {
    const {songsData,albumsData} = useContext(PlayerContext);
    return (
        <>
            <div className="mb-4">
                <h1 className="my-4 font-bold text-xl pl-3.5">Albums</h1>
                <div className="flex gap-2 overflow-x-auto pb-4">
                    {albumsData.map((item, index) => (
                        <AlbumItem 
                            key={index} 
                            name={item.name} 
                            description={item.desc} 
                            id={item._id}
                            image={item.image}
                        />
                    ))}
                </div>
            </div>
            {songsData && songsData.length > 0 && (
                <div className="mb-4">
                    <h1 className="my-4 font-bold text-xl pl-3.5">Songs</h1>
                    <div className="flex gap-2 overflow-x-auto pb-4">
                        {songsData.map((item, index) => (
                            <SongItem 
                                key={index} 
                                name={item.name} 
                                description={item.desc} 
                                id={item._id} 
                                image={item.image}
                            />
                        ))}
                    </div>
                </div>
            )}
        </>
    );
};

export default DisplayHome;
import {Route, Routes, useLocation} from "react-router-dom";
import DisplayHome from "./DisplayHome.jsx";
import DisplayAlbum from "./DisplayAlbum.jsx";
import {useContext} from "react";
import {PlayerContext} from "../context/PlayerContext.jsx";

const Display = () => {
    const {albumsData} = useContext(PlayerContext);
    const location = useLocation();
    const isAlbum = location.pathname.includes("album");
    const albumId = isAlbum ? location.pathname.split("/").pop() : '';

    return (
        <div className="h-full flex flex-col text-white">
            <div className="flex-1 overflow-auto">
                {albumsData && albumsData.length > 0 ? (
                    <Routes>
                        <Route path="/" element={<DisplayHome />} />
                        <Route path="/library" element={<DisplayHome />} />
                        <Route path="album/:id" element={<DisplayAlbum album={albumsData.find((x)=>(x._id == albumId))} />} />
                        <Route path="/library/album/:id" element={<DisplayAlbum album={albumsData.find((x)=>(x._id == albumId))} />} />
                        <Route path="*" element={<DisplayHome />} />
                    </Routes>
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="w-16 h-16 border-4 border-gray-400 border-t-green-800 rounded-full animate-spin"></div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Display;
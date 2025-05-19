import { PlayerContext } from "../../context/PlayerContext.jsx";
import { useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";

const SongItem = ({ name, image, desc, id }) => {
    const { playWithId, getSongsData } = useContext(PlayerContext);
    const url = "http://localhost:4000";

    const handleDelete = async (e) => {
        e.stopPropagation(); // Prevent triggering the play function
        try {
            const response = await axios.delete(`${url}/api/song/remove/${id}`);
            if (response.data.message) { // Changed from response.data.success to response.data.message
                toast.success(response.data.message);
                getSongsData(); // Refresh the songs list
            } else {
                toast.error("Failed to delete song");
            }
        } catch (error) {
            console.error('Delete error:', error);
            toast.error("Error deleting song");
        }
    };

    return (
        <div onClick={() => playWithId(id)} className="min-w-[200px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26] relative group">
            <div className="relative">
                <img className="w-full h-[150px] object-cover rounded" src={image} alt=""/>
                <button
                    onClick={handleDelete}
                    className="absolute top-2 right-2 w-6 h-6 bg-black bg-opacity-75 text-white rounded-full 
                             flex items-center justify-center opacity-0 group-hover:opacity-100 
                             transition-opacity hover:bg-opacity-100"
                >
                    ✕
                </button>
            </div>
            <p className="font-bold mt-1 mb-0.5 text-sm truncate">{name}</p>
            <p className="text-slate-200 text-xs truncate">{desc}</p>
        </div>
    );
};

export default SongItem;
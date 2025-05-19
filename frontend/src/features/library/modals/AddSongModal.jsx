import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../../assets/assets";
import ClickOutsideWrapper from "../../../components/ui/ClickOutsideWrapper.jsx";


const AddSongModal = ({ isOpen, onClose }) => {
    const url = "http://localhost:4000";

    const [image, setImage] = useState(false);
    const [song, setSong] = useState(false);
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [album, setAlbum] = useState("none");
    const [loading, setLoading] = useState(false);
    const [albumData, setAlbumData] = useState([]);

    useEffect(() => {
        loadAlbumData();
    }, []);

    const loadAlbumData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            if (response.data.success) {
                setAlbumData(response.data.albums);
            } else {
                toast.error('Unable to load albums data');
            }
        } catch (error) {
            toast.error('Error occurred');
        }
    };

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("file", song);
            formData.append("name", name);
            formData.append("desc", desc);
            formData.append("album", album);

            const response = await axios.post(`${url}/api/song/add`, formData);
            if (response.data.success) {
                toast.success("Song added");
                resetForm();
                onClose();
            } else {
                toast.error("Something went wrong");
            }
        } catch (error) {
            toast.error("Error occurred");
        }
        setLoading(false);
    };

    const resetForm = () => {
        setName("");
        setDesc("");
        setImage(false);
        setSong(false);
        setAlbum("none");
    };

    if (!isOpen) return null;

    return (
        <ClickOutsideWrapper onClickOutside={onClose}>
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Song</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                {/* Original form content */}
                <form onSubmit={onSubmitHandler} className="flex flex-col items-start gap-2 text-gray-600">
                    <div className="flex gap-8">
                <div className="flex flex-col gap-0.5">
                    <p>Upload song</p>
                    <input onChange={(e)=>setSong(e.target.files[0])} type="file" id="song" name="file" accept='audio/*' hidden/>
                    <label htmlFor="song">
                        <img src={song ? assets.upload_added :assets.upload_song} className='w-24 cursor-pointer' alt=""/>
                    </label>
                </div>
                <div className="flex flex-col gap-0.5">
                    <p>Upload Image</p>
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" name="image" accept='image/*' hidden/>
                    <label htmlFor="image">
                        <img src={image? URL.createObjectURL(image) :assets.upload_area} className='w-24 cursor-pointer' alt=""/>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-0.5">
                <p>Song Name</p>
                <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]" placeholder="type Here" required/>
            </div>

            <div className="flex flex-col gap-0.5">
                <p>Song Description</p>
                <input onChange={(e)=>setDesc(e.target.value)} value={desc} type="text" className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]" placeholder="type Here" required/>
            </div>

            <div className="flex flex-col gap-0.5">
                <p>Album</p>
                <select onChange={(e)=>setAlbum(e.target.value)} defaultValue={album} className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[150px]">
                    <option value="none">None</option>
                    {albumData.map((item,index)=>(<option  key={index} value={item.name}>{item.name}</option>))}
                </select>
            </div>

            <button type="submit" className="text-base bg-black text-white py-2.5 px-14 cursor-pointer">ADD</button>
                </form>
            </div>
        </div>
        </ClickOutsideWrapper>
    );
};

export default AddSongModal;
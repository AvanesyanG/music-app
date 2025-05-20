import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../../assets/assets";
import ClickOutsideWrapper from "../../../components/ui/ClickOutsideWrapper";
import { useAuth } from '@clerk/clerk-react';

const AddSongDropdown = ({ isOpen, onClose, anchorRef }) => {
    const { getToken } = useAuth();
    const url = "http://localhost:4000";
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

    const [image, setImage] = useState(false);
    const [song, setSong] = useState(false);
    const [name, setName] = useState("");
    const [artist, setArtist] = useState("");
    const [desc, setDesc] = useState("");
    const [album, setAlbum] = useState("none");
    const [loading, setLoading] = useState(false);
    const [albumData, setAlbumData] = useState([]);

    useEffect(() => {
        loadAlbumData();
    }, []);

    useEffect(() => {
        if (isOpen && anchorRef?.current) {
            const rect = anchorRef.current.getBoundingClientRect();
            const windowWidth = window.innerWidth;
            
            // Calculate position based on screen size
            if (windowWidth <= 640) { // mobile
                setDropdownPosition({
                    top: rect.bottom + window.scrollY + 8,
                    right: 16 // 16px from right edge on mobile
                });
            } else {
                setDropdownPosition({
                    top: rect.top + window.scrollY,
                    right: 24 // 24px from right edge on desktop
                });
            }
        }
    }, [isOpen, anchorRef]);
    

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

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append("image", image);
            formData.append("file", song);
            formData.append("name", name);
            formData.append("artist", artist);
            formData.append("desc", desc);
            formData.append("album", album);

            const response = await axios.post(`${url}/api/song/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
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
        setArtist("");
        setDesc("");
        setImage(false);
        setSong(false);
        setAlbum("none");
    };

    if (!isOpen) return null;

    return (
        <ClickOutsideWrapper onClickOutside={onClose}>
            <div 
                className="fixed z-[9999]"
                style={{
                    top: `${dropdownPosition.top}px`,
                    right: `${dropdownPosition.right}px`,
                }}
            >
                <div className="bg-[#282828] p-2 sm:p-4 rounded-lg shadow-xl w-[600px] max-w-[calc(100vw-32px)] sm:max-w-[calc(100vw-280px)] mx-auto">
                    <div className="flex justify-between items-center mb-2 sm:mb-4">
                        <h2 className="text-base sm:text-lg font-bold text-white">Add New Song</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
                        <div className="flex flex-row sm:flex-row gap-2 sm:gap-4">
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <p className="text-gray-300 text-sm sm:text-base">Upload Song</p>
                                <input 
                                    onChange={(e) => setSong(e.target.files[0])} 
                                    type="file" 
                                    id="song" 
                                    accept="audio/*" 
                                    hidden 
                                />
                                <label htmlFor="song" className="block">
                                    <img 
                                        className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                                        src={song ? assets.upload_added : assets.upload_song} 
                                        alt="Upload Song" 
                                    />
                                </label>
                            </div>
                            <div className="flex flex-col gap-1 sm:gap-2">
                                <p className="text-gray-300 text-sm sm:text-base">Upload Image</p>
                                <input 
                                    onChange={(e) => setImage(e.target.files[0])} 
                                    type="file" 
                                    id="image" 
                                    accept="image/*" 
                                    hidden 
                                />
                                <label htmlFor="image" className="block">
                                    <img 
                                        className="w-16 h-16 sm:w-24 sm:h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity" 
                                        src={image ? URL.createObjectURL(image) : assets.upload_area} 
                                        alt="Upload Image" 
                                    />
                                </label>
                            </div>
                        </div>
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-300 text-sm sm:text-base">Song Name</p>
                                    <input 
                                        onChange={(e) => setName(e.target.value)} 
                                        value={name} 
                                        className="bg-[#3E3E3E] text-white outline-none border border-gray-600 p-1.5 sm:p-2 rounded-md w-full focus:border-gray-400 transition-colors text-sm sm:text-base" 
                                        type="text" 
                                        placeholder="Type here" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-300 text-sm sm:text-base">Artist</p>
                                    <input 
                                        onChange={(e) => setArtist(e.target.value)} 
                                        value={artist} 
                                        className="bg-[#3E3E3E] text-white outline-none border border-gray-600 p-1.5 sm:p-2 rounded-md w-full focus:border-gray-400 transition-colors text-sm sm:text-base" 
                                        type="text" 
                                        placeholder="Type here" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-300 text-sm sm:text-base">Song Description</p>
                                    <input 
                                        onChange={(e) => setDesc(e.target.value)} 
                                        value={desc} 
                                        className="bg-[#3E3E3E] text-white outline-none border border-gray-600 p-1.5 sm:p-2 rounded-md w-full focus:border-gray-400 transition-colors text-sm sm:text-base" 
                                        type="text" 
                                        placeholder="Type here" 
                                    />
                                </div>
                            </div>
                            <div className="flex flex-col justify-between gap-2 sm:gap-3 w-24">
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-300 text-sm sm:text-base">Album</p>
                                    <select 
                                        onChange={(e) => setAlbum(e.target.value)} 
                                        value={album}
                                        className="bg-[#3E3E3E] text-white outline-none border border-gray-600 p-1.5 sm:p-2 rounded-md w-full focus:border-gray-400 transition-colors text-sm"
                                    >
                                        <option value="none">None</option>
                                        {albumData.map((item, index) => (
                                            <option key={index} value={item.name}>{item.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <button 
                                    type="submit" 
                                    className="text-white bg-black py-1.5 sm:py-2 px-4 rounded-full font-medium hover:bg-gray-900 transition-colors w-full text-sm sm:text-base"
                                    disabled={loading}
                                >
                                    {loading ? "Adding..." : "Add"}
                                </button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </ClickOutsideWrapper>
    );
};

export default AddSongDropdown;

import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../../assets/assets";
import ClickOutsideWrapper from "../../../components/ui/ClickOutsideWrapper";
import { useAuth } from '@clerk/clerk-react';

const AddAlbumDropdown = ({ isOpen, onClose, anchorRef }) => {
    const { getToken } = useAuth();
    const url = "http://localhost:4000";
    const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

    const [image, setImage] = useState(false);
    const [color, setColor] = useState("#000000");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);

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

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const token = await getToken();
            const formData = new FormData();
            formData.append("image", image);
            formData.append("name", name);
            formData.append("desc", desc);
            formData.append("bgColor", color);
            
            const response = await axios.post(`${url}/api/album/add`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            if (response.data.success) {
                toast.success("Album added");
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
        setDesc('');
        setName('');
        setImage(false);
        setColor("#000000");
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
                        <h2 className="text-base sm:text-lg font-bold text-white">Add New Album</h2>
                        <button 
                            onClick={onClose}
                            className="text-gray-400 hover:text-white text-lg transition-colors"
                        >
                            ✕
                        </button>
                    </div>
                    <form onSubmit={onSubmitHandler} className="flex flex-col sm:flex-row gap-2 sm:gap-4">
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
                        <div className="flex-1 flex flex-col sm:flex-row gap-2 sm:gap-4">
                            <div className="flex flex-col gap-2 sm:gap-3 flex-1">
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-300 text-sm sm:text-base">Album Name</p>
                                    <input 
                                        onChange={(e) => setName(e.target.value)} 
                                        value={name} 
                                        className="bg-[#3E3E3E] text-white outline-none border border-gray-600 p-1.5 sm:p-2 rounded-md w-full focus:border-gray-400 transition-colors text-sm sm:text-base" 
                                        type="text" 
                                        placeholder="Type here" 
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <p className="text-gray-300 text-sm sm:text-base">Album Description</p>
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
                                    <p className="text-gray-300 text-sm sm:text-base">Color</p>
                                    <input 
                                        onChange={(e) => setColor(e.target.value)} 
                                        value={color} 
                                        type="color"
                                        className="w-full h-7 sm:h-8 rounded cursor-pointer bg-[#3E3E3E] border border-gray-600 p-1" 
                                    />
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

export default AddAlbumDropdown;

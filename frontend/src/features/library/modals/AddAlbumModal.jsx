import { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../../../assets/assets";
import ClickOutsideWrapper from "../../../components/ui/ClickOutsideWrapper.jsx";

const AddAlbumModal = ({ isOpen, onClose }) => {
    const url = "http://localhost:4000";

    const [image, setImage] = useState(false);
    const [color, setColor] = useState("#000000");
    const [name, setName] = useState("");
    const [desc, setDesc] = useState("");
    const [loading, setLoading] = useState(false);

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image", image);
            formData.append("name", name);
            formData.append("desc", desc);
            formData.append("bgColor", color);
            
            const response = await axios.post(`${url}/api/album/add`, formData);
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
        <div className=" fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Add New Album</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        ✕
                    </button>
                </div>
                <form  onSubmit={onSubmitHandler} className="flex flex-col items-start gap-2 text-gray-600">
                    <div className='flex flex-col gap-4'>
                <p>Upload Image </p>
                <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" accept="image/*" hidden/>
                <label htmlFor="image">
                    <img className='w-24 cursor-pointer' src={image? URL.createObjectURL(image) :assets.upload_area} alt=""/>
                </label>
            </div>
            <div className='flex flex-col gap-0.5'>
                <p>Album name</p>
                <input onChange={(e)=>setName(e.target.value)} value={name} className='bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]' type="text" placeholder='Type here'/>
            </div>
            <div className='flex flex-col gap-0.5'>
                <p>Album description</p>
                <input onChange={(e)=>setDesc(e.target.value)} value={desc}   className='bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]' type="text" placeholder='Type here'/>
            </div>
            <div className='flex flex-col gap-0.5'>
                <p>Background color</p>
                <input onChange={(e)=> setColor(e.target.value)} value={color} type="color"/>
            </div>
            <button className='text-base bg-black text-white py-2.5 px-14 cursor-pointer' type='submit'>ADD</button>
                </form>
            </div>
        </div>
        </ClickOutsideWrapper>
    );
};

export default AddAlbumModal;
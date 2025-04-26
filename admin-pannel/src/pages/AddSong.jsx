import {assets} from "../assets/assets.js";
import {useState} from "react";
import axios from "axios";
import {url} from "../App.jsx";
import {toast} from "react-toastify";

const AddSong = () => {
    const [image,setImage] = useState(false);
    const [song,setSong] = useState(false);
    const [name,setName] = useState("");
    const [desc,setDesc] = useState("");
    const [album,setAlbum] = useState("none");
    const [loading,setLoading] = useState(false);
    // const [albumData,setAlbumData] = useState([])a

    const onSubmitHandler = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const formData = new FormData();
            formData.append("image",image);
            formData.append("file",song);
            formData.append("name",name);
            formData.append("desc",desc);
            formData.append("album",album);

            console.log("Uploading with values:");
            console.log("Name:", name);
            console.log("Desc:", desc);
            console.log("Album:", album);
            console.log("Image:", image);
            console.log("Song:", song);



            const response = await axios.post(`${url}/api/song/add`,formData);
            if(response.data.success) {
                toast.success("Song added");
                setName("")
                setDesc("")
                setImage(false)
                setSong(false)
                setAlbum("none")
            }
            else {
                toast.error("Something went wrong");
            }

        } catch (error) {
            toast.error("Error occured");
        }
        setLoading(false);
    }

    return loading ?(
        <div className="grid place-items-center min-h-[80vh]">
            <div className="w-16 h-16 place-self-center border-4 border-gray-400 border-t-green-800 rounded-full animate-spin">

            </div>
        </div>
    ) : (
        <form onSubmit={onSubmitHandler} className="flex flex-col items-start gap-5 text-gray-600">
            <div className="flex gap-8">
                <div className="flex flex-col gap-4">
                    <p>Upload song</p>
                    <input onChange={(e)=>setSong(e.target.files[0])} type="file" id="song" name="file" accept='audio/*' hidden/>
                    <label htmlFor="song">
                        <img src={song ? assets.upload_added :assets.upload_song} className='w-24 cursor-pointer' alt=""/>
                    </label>
                </div>
                <div className="flex flex-col gap-4">
                    <p>Upload Image</p>
                    <input onChange={(e)=>setImage(e.target.files[0])} type="file" id="image" name="image" accept='image/*' hidden/>
                    <label htmlFor="image">
                        <img src={image? URL.createObjectURL(image) :assets.upload_area} className='w-24 cursor-pointer' alt=""/>
                    </label>
                </div>
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Song Name</p>
                <input onChange={(e)=>setName(e.target.value)} value={name} type="text" className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]" placeholder="type Here" required/>
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Song Description</p>
                <input onChange={(e)=>setDesc(e.target.value)} value={desc} type="text" className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[max(40vw,250px)]" placeholder="type Here" required/>
            </div>

            <div className="flex flex-col gap-2.5">
                <p>Album</p>
                <select onChange={(e)=>setAlbum(e.target.value)} defaultValue={album} className="bg-transparent outline-green-600 border-2 border-gray-400 p-2.5 w-[150px]">
                    <option value="none">None</option>
                </select>
            </div>

            <button type="submit" className="text-base bg-black text-white py-2.5 px-14 cursor-pointer">ADD</button>
        </form>
    );
};

export default AddSong;
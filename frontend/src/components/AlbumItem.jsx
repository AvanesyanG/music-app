import {useNavigate} from "react-router-dom";

const AlbumItem = ({image,name,desc,id}) => {
    const navigate = useNavigate();
    return (
        <div onClick={()=>navigate(`/library/album/${id}`)} className="min-w-[150px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
            <img className="w-full h-[150px] object-cover rounded" src={image} alt=""/>
            <p className="font-bold mt-1 mb-0.5 text-sm truncate">{name}</p>
            <p className="text-slate-200 text-xs truncate">{desc}</p>
        </div>
    );
};

export default AlbumItem;
import {useNavigate} from "react-router-dom";

const AlbumItem = ({ album, showSpotifyLink = false }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        if (album.id) {
            navigate(`/album/${album.id}`);
        }
    };

    return (
        <div onClick={handleClick} className="min-w-[200px] p-2 px-3 rounded cursor-pointer hover:bg-[#ffffff26]">
            <img 
                className="w-full h-[150px] object-cover rounded" 
                src={album.image} 
                alt={album.title}
            />
            <p className="font-bold mt-1 mb-0.5 text-sm truncate">{album.title}</p>
            <p className="text-slate-200 text-xs truncate">{album.artist}</p>
            {showSpotifyLink && album.spotifyUrl && (
                <a 
                    href={album.spotifyUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs text-blue-400 hover:text-blue-300 mt-1 block"
                    onClick={(e) => e.stopPropagation()}
                >
                    Open in Spotify
                </a>
            )}
        </div>
    );
};

export default AlbumItem;
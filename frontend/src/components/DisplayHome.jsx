import Navbar from "./Navbar.jsx";
import {albumsData} from "../assets/assets.js"
import AlbumItem from "./AlbumItem.jsx";
import {songsData} from "../assets/assets.js";
import SongItem from "./SongItem.jsx";


const DisplayHome = () => {
    return (
        <>
            <Navbar/>
            <div className="mb-4">
                <h1 className="my-5 font-bold text-2xl">Featured Charts</h1>
                <div className="flex overflow-auto ">
                    {albumsData.map((item, index) => (
                        <AlbumItem key={index} name={item.name} description={item.desc} id={item.id}
                                   image={item.image}/>))}

                </div>
            </div>
            <div className="mb-4">
                <h1 className="my-5 font-bold text-2xl">Today's biggest hits</h1>
                <div className="flex overflow-auto ">
                    {songsData.map((item, index) => (
                        <SongItem key={index} name={item.name} description={item.desc} id={item.id} image={item.image}/>))}

                </div>
            </div>


        </>
    );
};

export default DisplayHome;
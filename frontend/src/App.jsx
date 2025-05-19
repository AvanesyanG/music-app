import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import MainLayout from "./layouts/MainLayout.jsx";
import Display from "./features/library/Display.jsx";
import Login from "./features/auth/Login.jsx";
import MoodSelector from "./features/mood/MoodSelector.jsx";
import { useEffect, useState, useContext } from "react";
import { PlayerContext } from "./context/PlayerContext.jsx";
import SearchPage from "./features/search/SearchPage.jsx";
import PageTransition from "./components/ui/PageTransition.jsx";
import Navbar from "./components/ui/Navbar.jsx";

const App = () => {
    // Set back to true until we implement real auth
    const isAuthenticated = true;
    const location = useLocation();
    const { albumsData } = useContext(PlayerContext);
    const [background, setBackground] = useState("bg-[#1E293B]");
    const [currentAlbum, setCurrentAlbum] = useState(null);

    useEffect(() => {
        if (location.pathname === "/") {
            setBackground("bg-[#1E293B]");
            setCurrentAlbum(null);
        } else if (location.pathname.includes("/album/")) {
            const albumId = location.pathname.split("/").pop();
            const album = albumsData.find(x => x._id === albumId);
            if (album?.bgColor) {
                setBackground(`bg-[${album.bgColor}]`);
            } else {
                setBackground("bg-[#1E293B]");
            }
            setCurrentAlbum(album);
        } else {
            setBackground("bg-[#1E293B]");
            setCurrentAlbum(null);
        }
    }, [location.pathname, albumsData]);

    return (
        <MainLayout>
            <div className="w-full h-full relative">
                <div 
                    className={`w-full h-full ${background} transition-all duration-500`}
                    style={{ 
                        background: currentAlbum?.bgColor 
                            ? `linear-gradient(to bottom, 
                                black 0%,
                                ${currentAlbum.bgColor}40 20%, 
                                ${currentAlbum.bgColor}60 40%,
                                ${currentAlbum.bgColor}60 60%,
                                ${currentAlbum.bgColor}40 80%,
                                black 100%
                            )`
                            : `linear-gradient(to bottom, 
                                black 0%,
                                #1E293B40 20%, 
                                #1E293B60 40%,
                                #1E293B60 60%,
                                #1E293B40 80%,
                                black 100%
                            )`
                    }}
                >
                    <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
                        <Navbar />
                    </div>
                    <PageTransition>
                        <div className="w-full h-full">
                            <div className="w-full h-full p-6 pt-[72px]">
                                <Routes>
                                    <Route path="/auth/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" replace />} />
                                    <Route path="/mood" element={isAuthenticated ? <MoodSelector /> : <Navigate to="/auth/login" replace />} />
                                    <Route path="/search" element={isAuthenticated ? <SearchPage /> : <Navigate to="/auth/login" replace />} />
                                    <Route path="/*" element={isAuthenticated ? <Display /> : <Navigate to="/auth/login" replace />} />
                                </Routes>
                            </div>
                        </div>
                    </PageTransition>
                </div>
            </div>
        </MainLayout>
    );
};

export default App;
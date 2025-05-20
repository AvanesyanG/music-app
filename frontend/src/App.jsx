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
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useAuth, useUser } from '@clerk/clerk-react';
import SsoCallback from './features/auth/SsoCallback.jsx';
import axios from 'axios';

const App = () => {
    const { isLoaded, isSignedIn, getToken } = useAuth();
    const { user } = useUser();
    const location = useLocation();
    const playerContext = useContext(PlayerContext);
    const albumsData = playerContext?.albumsData || [];
    const [background, setBackground] = useState("bg-[#1E293B]");
    const [currentAlbum, setCurrentAlbum] = useState(null);

    // Handle auth callback when user signs in
    useEffect(() => {
        const handleAuthCallback = async () => {
            if (isSignedIn && user) {
                try {
                    console.log('Preparing auth callback for user:', {
                        id: user.id,
                        email: user.primaryEmailAddress?.emailAddress
                    });

                    const token = await getToken();
                    if (!token) {
                        console.error('No token available');
                        return;
                    }

                    const response = await axios.post('http://localhost:4000/api/auth/callback', {
                        id: user.id,
                        emailAddress: user.primaryEmailAddress?.emailAddress
                    }, {
                        headers: {
                            Authorization: `Bearer ${token}`
                        }
                    });

                    // Log success based on status code
                    if (response.status === 201) {
                        console.log('New user created:', response.data);
                    } else if (response.status === 200) {
                        console.log('Existing user found:', response.data);
                    }
                } catch (error) {
                    // Don't treat 409 as an error - it means the user exists
                    if (error.response?.status === 409) {
                        console.log('User already exists:', error.response.data);
                        return;
                    }

                    console.error('Auth callback failed:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status,
                        user: {
                            id: user.id,
                            email: user.primaryEmailAddress?.emailAddress
                        }
                    });
                }
            }
        };

        if (isLoaded && isSignedIn) {
            handleAuthCallback();
        }
    }, [isLoaded, isSignedIn, user, getToken]);

    useEffect(() => {
        if (location.pathname === "/") {
            setBackground("bg-[#1E293B]");
            setCurrentAlbum(null);
        } else if (location.pathname.includes("/album/")) {
            const albumId = location.pathname.split("/").pop();
            const album = albumsData.find(x => x._id === albumId);
            setBackground(album?.bgColor ? `bg-[${album.bgColor}]` : "bg-[#1E293B]");
            setCurrentAlbum(album);
        } else {
            setBackground("bg-[#1E293B]");
            setCurrentAlbum(null);
        }
    }, [location.pathname, albumsData]);

    if (!isLoaded) {
        return (
            <div className="w-full h-screen flex items-center justify-center bg-gray-900">
                <div className="text-white text-lg">Loading authentication...</div>
            </div>
        );
    }

    return (
        <MainLayout>
            <ToastContainer />
            <div className=" w-full h-full relative">
                <div className={`w-full h-full ${background} transition-all duration-500`}
                    style={{ 
                        background: currentAlbum?.bgColor 
                            ? `linear-gradient(to bottom, black 0%, ${currentAlbum.bgColor}40 20%, ${currentAlbum.bgColor}60 40%, ${currentAlbum.bgColor}60 60%, ${currentAlbum.bgColor}40 80%, black 100%)`
                            : `linear-gradient(to bottom, black 0%, #1E293B40 20%, #1E293B60 40%, #1E293B60 60%, #1E293B40 80%, black 100%)`
                    }}>
                    {/* Only show Navbar when user is signed in and not on auth page */}
                    {isSignedIn && !location.pathname.startsWith('/auth') && (
                        <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
                            <Navbar />
                        </div>
                    )}
                    <PageTransition>
                        <div className="w-full h-full">
                            <div className={`w-full h-full  ${isSignedIn && !location.pathname.startsWith('/auth') ? 'pt-[72px]' : ''}`}>
                            <Routes>
                                <Route path="/auth" element={!isSignedIn ? <Login /> : <Navigate to="/" replace />} />
                                <Route path="/sso-callback" element={<SsoCallback />} />
                                <Route path="/mood" element={isSignedIn ? <MoodSelector /> : <Navigate to="/auth" replace />} />
                                <Route path="/search" element={isSignedIn ? <SearchPage /> : <Navigate to="/auth" replace />} />
                                <Route path="/*" element={isSignedIn ? <Display /> : <Navigate to="/auth" replace />} />
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
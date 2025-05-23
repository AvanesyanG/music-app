import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const audioRef = useRef(null);
    const volumeRef = useRef(null);
    const seekBg = useRef(null);
    const seekBar = useRef();
    const url = 'http://localhost:4000'

    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [songsData, setSongsData] = useState([])
    const [albumsData, setAlbumsData] = useState([])
    const [artistsData, setArtistsData] = useState([])
    const [track, setTrack] = useState(null);
    const [playStatus, setPlayStatus] = useState(false);
    const [time, setTime] = useState({
        currentTime: {
            second: 0,
            minute: 0
        },
        totalTime: {
            second: 0,
            minute: 0
        }
    });

    // Reset time when track changes
    useEffect(() => {
        setTime({
            currentTime: { second: 0, minute: 0 },
            totalTime: { second: 0, minute: 0 }
        });
    }, [track]);

    const toggleMute = () => {
        console.log('🔊 Toggle mute called:', { currentVolume: volume });
        if (volume > 0) {
            console.log('🔇 Muting - setting volume to 0');
            setVolume(0);
        } else {
            console.log('🔊 Unmuting - setting volume to 1');
            setVolume(1); // Unmute (restore to max volume)
        }
    };

    const setAudioVolume = (vol) => {
        console.log('🔊 setAudioVolume called:', { 
            requestedVolume: vol,
            currentVolume: volume,
            isYouTube: track?.file?.includes('youtube.com/watch')
        });
        vol = Math.max(0, Math.min(1, vol)); // Ensure volume is between 0 and 1
        setVolume(vol);
    };

    const play = () => {
        console.log('Play called:', {
            hasTrack: !!track,
            trackName: track?.name,
            isYouTube: track?.file?.includes('youtube.com/watch'),
            currentPlayStatus: playStatus
        });

        if (track) {
            if (track.file && track.file.includes('youtube.com/watch')) {
                console.log('Playing YouTube video');
                setPlayStatus(true);
            } else {
                console.log('Playing regular audio');
                audioRef.current.play();
            setPlayStatus(true);
            }
        }
    };

    const pause = () => {
        console.log('Pause called:', {
            hasTrack: !!track,
            trackName: track?.name,
            isYouTube: track?.file?.includes('youtube.com/watch'),
            currentPlayStatus: playStatus
        });

        if (track) {
            if (track.file && track.file.includes('youtube.com/watch')) {
                console.log('Pausing YouTube video');
                setPlayStatus(false);
            } else {
                console.log('Pausing regular audio');
                audioRef.current.pause();
            setPlayStatus(false);
            }
        }
    };

    const playWithId = async (id) => {
        console.log('playWithId called:', { id });
        
        const selectedTrack = songsData.find(item => id === item._id || id === item.id);
        console.log("Found track data:", {
            name: selectedTrack?.name,
            file: selectedTrack?.file,
            previewUrl: selectedTrack?.previewUrl,
            spotifyUrl: selectedTrack?.spotifyUrl,
            spotifyId: selectedTrack?.spotifyId,
            isYouTube: selectedTrack?.file?.includes('youtube.com/watch'),
            duration: selectedTrack?.duration,
            artist: selectedTrack?.artist,
            album: selectedTrack?.album,
            image: selectedTrack?.image,
            desc: selectedTrack?.desc,
            // Log all available properties
            allProperties: Object.keys(selectedTrack || {})
        });

        if (selectedTrack) {
            console.log('Setting track and preparing to play');
            // Store current play status before changing track
            const wasPlaying = playStatus;
            
            // Reset play status before changing track
            setPlayStatus(false);
            
            // Add a small delay before setting the new track
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Set the new track
            await setTrack(selectedTrack);
            
            // Add another small delay to ensure track is set and DOM is updated
            await new Promise(resolve => setTimeout(resolve, 100));
            
            if (wasPlaying) {
            if (selectedTrack.file && selectedTrack.file.includes('youtube.com/watch')) {
                console.log("Playing YouTube video:", selectedTrack.file);
                setPlayStatus(true);
            } else {
                console.log("Playing regular audio file:", selectedTrack.file);
                try {
                        if (audioRef.current) {
                    await audioRef.current.play();
                    setPlayStatus(true);
                        } else {
                            console.log("Audio element not ready yet");
                            setPlayStatus(true);
                        }
                } catch (error) {
                    console.error("Error playing audio:", error);
                        setPlayStatus(true);
                    }
                }
            }
        }
    };

    const previous = async () => {
        if (songsData.length === 0) return;
        
        const currentIndex = songsData.findIndex(item => item._id === track._id);
        if (currentIndex > 0) {
            const wasPlaying = playStatus;
            setPlayStatus(false);
            
            const prevTrack = songsData[currentIndex - 1];
            await setTrack(prevTrack);
            
            // Small delay to ensure track is set
            await new Promise(resolve => setTimeout(resolve, 50));
            
            if (prevTrack.file && prevTrack.file.includes('youtube.com/watch')) {
                console.log("Switching to previous YouTube video");
                if (wasPlaying) {
                    setTimeout(() => {
                        setPlayStatus(true);
                    }, 100);
                }
            } else {
                console.log("Switching to previous regular audio");
                if (wasPlaying) {
                    try {
                        // Wait for audio element to be ready
                        if (audioRef.current) {
                            await audioRef.current.play();
                            setPlayStatus(true);
                        } else {
                            console.log("Audio element not ready yet");
                            // Set play status to true, audio will start when ready
                            setPlayStatus(true);
                        }
                    } catch (error) {
                        console.error("Error playing previous audio:", error);
                        // If there's an error, still set play status to true
                        // The audio will start when it's ready
                        setPlayStatus(true);
                    }
                }
            }
        }
    };

    const next = async () => {
        if (songsData.length === 0) return;
        
        const currentIndex = songsData.findIndex(item => item._id === track._id);
        if (currentIndex < songsData.length - 1) {
            const wasPlaying = playStatus;
            setPlayStatus(false);
            
            const nextTrack = songsData[currentIndex + 1];
            await setTrack(nextTrack);
            
            // Small delay to ensure track is set
            await new Promise(resolve => setTimeout(resolve, 50));
            
            if (nextTrack.file && nextTrack.file.includes('youtube.com/watch')) {
                console.log("Switching to next YouTube video");
                if (wasPlaying) {
                    setTimeout(() => {
                        setPlayStatus(true);
                    }, 100);
                }
            } else {
                console.log("Switching to next regular audio");
                if (wasPlaying) {
                    try {
                        // Wait for audio element to be ready
                        if (audioRef.current) {
                            await audioRef.current.play();
                            setPlayStatus(true);
                        } else {
                            console.log("Audio element not ready yet");
                            // Set play status to true, audio will start when ready
                            setPlayStatus(true);
                        }
                    } catch (error) {
                        console.error("Error playing next audio:", error);
                        // If there's an error, still set play status to true
                        // The audio will start when it's ready
                        setPlayStatus(true);
                    }
                }
            }
        }
    };

    const seekYouTube = (e) => {
        if (seekBg.current) {
            const seekTime = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * (time?.totalTime?.minute * 60 + time?.totalTime?.second);
            // Send the seek time to the YouTube player
            if (track?.file?.includes('youtube.com/watch')) {
                // The YouTubePlayer component will handle the actual seeking
                setTime(prev => ({
                    ...prev,
                    currentTime: {
                        minute: Math.floor(seekTime / 60),
                        second: Math.floor(seekTime % 60)
                    }
                }));
            }
        }
    };

    const seekSong = (e) => {
        if (track?.file?.includes('youtube.com/watch')) {
            seekYouTube(e);
        } else if (audioRef.current && seekBg.current) {
            const duration = audioRef.current.duration;
            if (!isNaN(duration)) {
                const seekTime = (e.nativeEvent.offsetX / seekBg.current.offsetWidth) * duration;
                audioRef.current.currentTime = seekTime;
            }
        }
    };

    const getSongsData = async () => {
        try {
            setIsLoading(true);
            const token = await getToken();
            const response = await axios.get(`${url}/api/song/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setSongsData(response.data.songs);
            if (response.data.songs.length > 0) {
                setTrack(response.data.songs[0]);
            }
        } catch (error) {
            console.error('Error fetching songs:', error);
            setSongsData([]);
        } finally {
            setIsLoading(false);
        }
    }

    const getAlbumsData = async () => {
        try {
            const token = await getToken();
            const response = await axios.get(`${url}/api/album/list`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setAlbumsData(response.data.albums);
        } catch (error) {
            console.error('Error fetching albums:', error);
            setAlbumsData([]);
        }
    }

    const getArtistsData = async () => {
        try {
            const token = await getToken();
            if (!token) {
                throw new Error('No authentication token available');
            }

            console.log('Fetching artists with token:', token.substring(0, 20) + '...');
            
            const response = await axios.get(`${url}/api/artists`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            console.log('Artists response:', response.data);

            if (response.data && response.data.artists) {
                setArtistsData(response.data.artists);
            } else {
                console.log('No artists data in response');
                setArtistsData([]);
            }
        } catch (error) {
            console.error('Error fetching artists:', error.response?.data || error.message);
            setArtistsData([]);
        }
    }

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        const updateSeekBar = () => {
            if (isLoading) return;

            const currentTime = audio.currentTime;
            const duration = audio.duration || 0;

            if (isNaN(duration)) return;

            if (duration > 0 && seekBar.current) {
                seekBar.current.style.width = `${(currentTime / duration) * 100}%`;
            }

            setTime({
                currentTime: {
                    second: Math.floor(currentTime % 60) || 0,
                    minute: Math.floor(currentTime / 60) || 0,
                },
                totalTime: {
                    second: Math.floor(duration % 60) || 0,
                    minute: Math.floor(duration / 60) || 0,
                },
            });
        };



        const handleLoadedMetadata = () => {
            const duration = audio.duration || 0;
            if (!isNaN(duration)) {
                setTime(prev => ({
                    ...prev,
                    totalTime: {
                        second: Math.floor(duration % 60) || 0,
                        minute: Math.floor(duration / 60) || 0,
                    },
                }));
            }
            setIsLoading(false);
        };

        const handleError = () => {
            setIsLoading(false);
        };

        audio.addEventListener('timeupdate', updateSeekBar);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);
        audio.addEventListener('error', handleError);

        return () => {
            audio.removeEventListener('timeupdate', updateSeekBar);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            audio.removeEventListener('error', handleError);
        };
    }, [isLoading]);
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            getSongsData();
            getAlbumsData();
            getArtistsData();
        }
    }, [isLoaded, isSignedIn]);

    const contextValue = {
        audioRef,
        volumeRef,
        seekBar,
        seekBg,
        track,
        setTrack,
        playStatus,
        setPlayStatus,
        time,
        setTime,
        play,
        pause,
        playWithId,
        next,
        previous,
        seekSong,
        isLoading,
        songsData,
        setSongsData,
        albumsData,
        artistsData,
        toggleMute,
        setAudioVolume,
        volume,
        getSongsData,
        getArtistsData
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
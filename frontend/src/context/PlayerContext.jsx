import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react';

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const { getToken, isLoaded, isSignedIn } = useAuth();
    const audioRef = useRef();
    const volumeRef = useRef(null);
    const seekBg = useRef();
    const seekBar = useRef();
    const url = 'http://localhost:4000'

    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [songsData, setSongsData] = useState([])
    const [albumsData, setAlbumsData] = useState([])
    const [artistsData, setArtistsData] = useState([])
    const [track, setTrack] = useState(songsData[0]);
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
        if (volume > 0) {
            setVolume(0);
            audioRef.current.volume = 0;
        } else {
            setVolume(1); // Unmute (restore to max volume)
            audioRef.current.volume = 1;
        }
    };
    const setAudioVolume = (vol) => {
        vol = Math.max(0, Math.min(1, vol)); // Ensure volume is between 0 and 1
        setVolume(vol);
        audioRef.current.volume = vol;
    };

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    };

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    };

    const playWithId =  (id) => {
         songsData.map((item) => {
            if(id === item._id) {
                setTrack(item)
            }
        })
         audioRef.current.play()
        setPlayStatus(true)
    }

    const previous = async () => {
        songsData.map(async (item,index) => {
            if(track._id === item._id && index > 0) {
                await setTrack(songsData[index-1]);
                await audioRef.current.play()
                setPlayStatus(true)
            }
        })
    };

    const next = async () => {
        songsData.map(async (item,index) => {
            if(track._id === item._id && index < songsData.length -1) {
                await setTrack(songsData[index+1]);
                await audioRef.current.play()
                setPlayStatus(true)
            }
        })
    };

    const seekSong = (e) => {
        if (audioRef.current && seekBg.current) {
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
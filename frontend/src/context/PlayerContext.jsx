import { createContext, useEffect, useRef, useState } from "react";
import axios from 'axios'

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const volumeRef = useRef(null);
    const seekBg = useRef();
    const seekBar = useRef();
    const url = 'http://localhost:4000'

    const [volume, setVolume] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [songsData, setSongsData] = useState([])
    const [albumsData, setAlbumsData] = useState([])
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
            const response = await axios.get(`${url}/api/song/list`);
            setSongsData(response.data.songs)
            setTrack(response.data.songs[0])
        } catch (error) {
            console.log(error)
        }
    }
    const getAlbumsData = async () => {
        try {
            const response = await axios.get(`${url}/api/album/list`);
            setAlbumsData(response.data.albums)
        } catch (error) {
            console.log(error)
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
        getSongsData();
        getAlbumsData()
    }, []);

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
        songsData,albumsData,
        toggleMute,setAudioVolume,volume
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
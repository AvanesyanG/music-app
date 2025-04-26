import { createContext, useEffect, useRef, useState } from "react";
import { songsData } from "../assets/assets.js";

export const PlayerContext = createContext();

const PlayerContextProvider = (props) => {
    const audioRef = useRef();
    const seekBg = useRef();
    const seekBar = useRef();
    const [isLoading, setIsLoading] = useState(false);

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

    const play = () => {
        audioRef.current.play();
        setPlayStatus(true);
    };

    const pause = () => {
        audioRef.current.pause();
        setPlayStatus(false);
    };

    const playWithId = async (id) => {
        setIsLoading(true);
        const newTrack = songsData.find(song => song.id === id);
        await setTrack(newTrack);
        try {
            await audioRef.current.play();
            setPlayStatus(true);
        } catch (error) {
            console.error("Playback error:", error);
        }
        setIsLoading(false);
    };

    const previous = async () => {
        if (track.id > 0) {
            setIsLoading(true);
            const newTrack = songsData[track.id - 1];
            await setTrack(newTrack);
            try {
                await audioRef.current.play();
                setPlayStatus(true);
            } catch (error) {
                console.error("Playback error:", error);
            }
            setIsLoading(false);
        }
    };

    const next = async () => {
        if (track.id < songsData.length - 1) {
            setIsLoading(true);
            const newTrack = songsData[track.id + 1];
            await setTrack(newTrack);
            try {
                await audioRef.current.play();
                setPlayStatus(true);
            } catch (error) {
                console.error("Playback error:", error);
            }
            setIsLoading(false);
        }
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

    const contextValue = {
        audioRef,
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
        isLoading
    };

    return (
        <PlayerContext.Provider value={contextValue}>
            {props.children}
        </PlayerContext.Provider>
    );
};

export default PlayerContextProvider;
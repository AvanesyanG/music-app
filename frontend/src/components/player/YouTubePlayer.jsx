import { useEffect, useRef, useState } from 'react';

// Add helper functions at the top
const getStateName = (state) => {
    switch (state) {
        case -1: return 'UNSTARTED';
        case 0: return 'ENDED';
        case 1: return 'PLAYING';
        case 2: return 'PAUSED';
        case 3: return 'BUFFERING';
        case 5: return 'VIDEO_CUED';
        default: return 'UNKNOWN';
    }
};

const getErrorName = (error) => {
    switch (error) {
        case 2: return 'INVALID_PARAMETER';
        case 5: return 'HTML5_PLAYER_ERROR';
        case 100: return 'VIDEO_NOT_FOUND';
        case 101: return 'EMBED_NOT_ALLOWED';
        case 150: return 'EMBED_NOT_ALLOWED';
        default: return 'UNKNOWN_ERROR';
    }
};

const getYouTubeVideoId = (urlOrId) => {
    if (!urlOrId) return null;
    
    // If it's already a video ID (11 characters)
    if (urlOrId.length === 11) {
        return urlOrId;
    }
    
    // If it's a URL, extract the ID
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

const YouTubePlayer = ({ url, onTimeUpdate, onStateChange, onError, seekTime, isPlaying }) => {
    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isFallback, setIsFallback] = useState(false);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isApiReady, setIsApiReady] = useState(false);

    console.log('YouTubePlayer render:', { url, isPlaying, currentVideoId, isPlayerReady, isApiReady });

    // Initialize YouTube API
    useEffect(() => {
        if (!window.YT) {
            console.log('Loading YouTube IFrame API');
            const tag = document.createElement('script');
            tag.src = 'https://www.youtube.com/iframe_api';
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                console.log('YouTube IFrame API ready');
                setIsApiReady(true);
            };
        } else {
            console.log('YouTube IFrame API already loaded');
            setIsApiReady(true);
        }

        return () => {
            if (player) {
                try {
                    console.log('Cleaning up player');
                    player.destroy();
                } catch (error) {
                    console.error('Error cleaning up player:', error);
                }
            }
        };
    }, []);

    // Effect to handle URL changes
    useEffect(() => {
        console.log('URL change effect triggered:', { url });
        const videoId = getYouTubeVideoId(url);
        console.log('Extracted video ID:', videoId);
        
        if (videoId !== currentVideoId) {
            console.log('Video ID changed:', { old: currentVideoId, new: videoId });
            setCurrentVideoId(videoId);
            setIsPlayerReady(false);
            
            // Destroy existing player if it exists
            if (player) {
                try {
                    console.log('Destroying existing player');
                    player.destroy();
                } catch (error) {
                    console.error('Error destroying player:', error);
                }
                setPlayer(null);
            }
        }
    }, [url, currentVideoId, player]);

    // Effect to initialize player
    useEffect(() => {
        console.log('Player initialization effect triggered:', { 
            currentVideoId, 
            isPlaying,
            hasPlayer: !!player,
            isPlayerReady,
            isApiReady
        });
        
        if (!currentVideoId || !isApiReady) {
            console.log('Waiting for video ID or API to be ready');
            return;
        }

        // Check if this is a fallback URL (search results page)
        if (url && url.includes('youtube.com/results')) {
            console.log('Fallback URL detected');
            setIsFallback(true);
            return;
        }

        console.log('Creating new YouTube player');
        const newPlayer = new window.YT.Player(playerRef.current, {
            height: '1',
            width: '1',
            videoId: currentVideoId,
            playerVars: {
                autoplay: 0,
                controls: 0,
                disablekb: 1,
                enablejsapi: 1,
                fs: 0,
                modestbranding: 1,
                rel: 0,
                playsinline: 1,
                iv_load_policy: 3,
                showinfo: 0
            },
            events: {
                onReady: (event) => {
                    console.log('YouTube player ready event fired');
                    setPlayer(event.target);
                    setIsPlayerReady(true);
                    
                    // Only attempt to play if isPlaying is true
                    if (isPlaying) {
                        try {
                            console.log('Attempting to play video on ready');
                            event.target.playVideo();
                        } catch (error) {
                            console.error('Error playing video on ready:', error);
                        }
                    }
                },
                onStateChange: (event) => {
                    const state = getStateName(event.data);
                    console.log('YouTube player state changed:', {
                        state,
                        videoId: currentVideoId,
                        isPlaying,
                        currentTime: event.target.getCurrentTime?.()
                    });
                    
                    // If the video ended, notify the parent
                    if (state === 'ENDED') {
                        onStateChange?.(event.data);
                    }
                },
                onError: (event) => {
                    console.error('YouTube player error:', {
                        error: getErrorName(event.data),
                        videoId: currentVideoId
                    });
                    onError?.(getErrorName(event.data));
                }
            }
        });

        return () => {
            if (newPlayer) {
                try {
                    console.log('Cleaning up new player');
                    newPlayer.destroy();
                } catch (error) {
                    console.error('Error cleaning up new player:', error);
                }
            }
        };
    }, [currentVideoId, isApiReady]);

    // Add effect to handle play/pause
    useEffect(() => {
        console.log('Play/Pause effect triggered:', { 
            isPlaying, 
            hasPlayer: !!player, 
            isPlayerReady,
            videoId: currentVideoId
        });
        
        if (player && isPlayerReady) {
            try {
                if (isPlaying) {
                    console.log('Attempting to play video:', currentVideoId);
                    player.playVideo();
                } else {
                    console.log('Attempting to pause video:', currentVideoId);
                    player.pauseVideo();
                }
            } catch (error) {
                console.error('Error controlling video:', error);
            }
        } else {
            console.log('Player not ready for play/pause:', { 
                hasPlayer: !!player, 
                isPlayerReady,
                videoId: currentVideoId
            });
        }
    }, [isPlaying, player, isPlayerReady, currentVideoId]);

    // Handle seeking
    useEffect(() => {
        if (player && seekTime !== undefined) {
            player.seekTo(seekTime, true);
        }
    }, [seekTime, player]);

    // Handle time updates
    useEffect(() => {
        if (!player) return;

        const interval = setInterval(() => {
            if (player.getPlayerState() === 1) { // PLAYING
                const currentTime = player.getCurrentTime();
                const duration = player.getDuration();
                const progress = (currentTime / duration) * 100;

                onTimeUpdate?.({
                    currentTime: {
                        minute: Math.floor(currentTime / 60),
                        second: Math.floor(currentTime % 60)
                    },
                    totalTime: {
                        minute: Math.floor(duration / 60),
                        second: Math.floor(duration % 60)
                    },
                    progress
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player, onTimeUpdate]);

    if (isFallback) {
        return (
            <div className="youtube-fallback">
                <p>YouTube API quota exceeded. Please click the link below to search for this song:</p>
                <a href={url} target="_blank" rel="noopener noreferrer">
                    Search on YouTube
                </a>
            </div>
        );
    }

    return <div ref={playerRef} className="youtube-player" />;
};

export default YouTubePlayer; 
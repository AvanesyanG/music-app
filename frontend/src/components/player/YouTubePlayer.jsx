import { useEffect, useRef, useState, useCallback } from 'react';

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

// Validate YouTube video ID format
const isValidYouTubeId = (id) => {
    if (!id) return false;
    // YouTube video IDs are 11 characters long and can contain letters, numbers, and some special characters
    return /^[a-zA-Z0-9_-]{11}$/.test(id);
};

// Validate YouTube URL
const isValidYouTubeUrl = (url) => {
    if (!url) return false;
    try {
        const urlObj = new URL(url);
        return (
            (urlObj.hostname === 'youtube.com' || urlObj.hostname === 'www.youtube.com' || urlObj.hostname === 'youtu.be') &&
            (urlObj.pathname.includes('/watch') || urlObj.pathname.includes('/v/') || urlObj.pathname.length === 12)
        );
    } catch {
        return false;
    }
};

const getYouTubeVideoId = (urlOrId) => {
    console.log('getYouTubeVideoId called with:', urlOrId);
    if (!urlOrId) {
        console.log('No URL or ID provided');
        return null;
    }
    
    // If it's already a video ID, validate it
    if (urlOrId.length === 11) {
        if (isValidYouTubeId(urlOrId)) {
            console.log('Input is a valid video ID:', urlOrId);
            return urlOrId;
        }
        console.log('Input is an invalid video ID:', urlOrId);
        return null;
    }
    
    // If it's a URL, validate and extract the ID
    if (!isValidYouTubeUrl(urlOrId)) {
        console.log('Invalid YouTube URL:', urlOrId);
        return null;
    }

    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = urlOrId.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;
    
    if (videoId && isValidYouTubeId(videoId)) {
        console.log('Extracted valid video ID:', videoId);
        return videoId;
    }
    
    console.log('Could not extract valid video ID from URL:', urlOrId);
    return null;
};

const YouTubePlayer = ({ url, onTimeUpdate, onStateChange, onError, seekTime, isPlaying }) => {
    const playerRef = useRef(null);
    const [player, setPlayer] = useState(null);
    const [isFallback, setIsFallback] = useState(false);
    const [currentVideoId, setCurrentVideoId] = useState(null);
    const [isPlayerReady, setIsPlayerReady] = useState(false);
    const [isApiReady, setIsApiReady] = useState(false);
    const [isValid, setIsValid] = useState(true);
    const isUnmountingRef = useRef(false);
    const playerContainerRef = useRef(null);
    const mountCountRef = useRef(0);
    const cleanupInProgressRef = useRef(false);
    const playerInstanceRef = useRef(null);

    // Reset unmounting state when component mounts
    useEffect(() => {
        mountCountRef.current++;
        isUnmountingRef.current = false;
        cleanupInProgressRef.current = false;
        return () => {
            isUnmountingRef.current = true;
        };
    }, []);

    // Cleanup function
    const cleanupPlayer = useCallback(() => {
        if (cleanupInProgressRef.current) return;
        cleanupInProgressRef.current = true;

        const currentPlayer = playerInstanceRef.current;
        if (currentPlayer) {
            try {
                console.log('Cleaning up player');
                currentPlayer.destroy();
            } catch (error) {
                console.error('Error destroying player:', error);
            } finally {
                playerInstanceRef.current = null;
                setPlayer(null);
                setIsPlayerReady(false);
                cleanupInProgressRef.current = false;
            }
        } else {
            cleanupInProgressRef.current = false;
        }
    }, []);

    // Effect to handle URL changes
    useEffect(() => {
        if (isUnmountingRef.current) return;

        console.log('URL change effect triggered:', { 
            url,
            currentVideoId,
            isPlayerReady,
            isApiReady,
            isPlaying,
            mountCount: mountCountRef.current
        });

        // Check if this is a search URL (fallback)
        if (url && url.includes('youtube.com/results')) {
            console.log('Fallback URL detected:', url);
            setIsFallback(true);
            setIsValid(false);
            return;
        }

        const videoId = getYouTubeVideoId(url);
        console.log('Extracted video ID:', videoId);
        
        if (!videoId) {
            console.error('Invalid YouTube URL or video ID:', url);
            setIsValid(false);
            onError?.('INVALID_VIDEO');
            return;
        }

        setIsValid(true);
        setIsFallback(false);
        
        if (videoId !== currentVideoId) {
            console.log('Video ID changed, updating player:', { 
                old: currentVideoId, 
                new: videoId,
                url,
                isPlaying,
                mountCount: mountCountRef.current
            });
            
            cleanupPlayer();
            setCurrentVideoId(videoId);
        }
    }, [url, currentVideoId, cleanupPlayer, isPlaying, onError]);

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
    }, []);

    // Effect to initialize player
    useEffect(() => {
        if (!currentVideoId || !isApiReady || !isValid || isUnmountingRef.current) {
            console.log('Waiting for video ID or API to be ready:', {
                hasVideoId: !!currentVideoId,
                isApiReady,
                isValid,
                isUnmounting: isUnmountingRef.current,
                mountCount: mountCountRef.current
            });
            return;
        }

        console.log('Creating new YouTube player with video ID:', currentVideoId);
        let newPlayer = null;

        try {
            newPlayer = new window.YT.Player(playerRef.current, {
                height: '1',
                width: '1',
                videoId: currentVideoId,
                playerVars: {
                    autoplay: isPlaying ? 1 : 0,
                    controls: 0,
                    disablekb: 1,
                    enablejsapi: 1,
                    fs: 0,
                    modestbranding: 1,
                    rel: 0,
                    playsinline: 1,
                    iv_load_policy: 3,
                    showinfo: 0,
                    origin: window.location.origin,
                    widget_referrer: window.location.href,
                    host: 'https://www.youtube.com',
                    allow: 'autoplay',
                    allowfullscreen: false,
                    allowscriptaccess: 'always',
                    cc_load_policy: 0,
                    color: 'white',
                    hl: 'en',
                    mute: 0,
                    playsinline: 1,
                    start: 0
                },
                events: {
                    onReady: (event) => {
                        if (isUnmountingRef.current) return;
                        
                        console.log('YouTube player ready event fired:', {
                            videoId: currentVideoId,
                            isPlaying,
                            playerState: event.target.getPlayerState?.(),
                            mountCount: mountCountRef.current
                        });
                        
                        // Ensure the player is fully initialized
                        if (typeof event.target.getPlayerState === 'function' &&
                            typeof event.target.getCurrentTime === 'function' &&
                            typeof event.target.getDuration === 'function') {
                            
                            playerInstanceRef.current = event.target;
                            setPlayer(event.target);
                            setIsPlayerReady(true);
                            
                            if (isPlaying) {
                                try {
                                    console.log('Forcing initial play state');
                                    event.target.playVideo();
                                } catch (error) {
                                    console.error('Error in initial play:', error);
                                }
                            }
                        } else {
                            console.error('Player methods not available after ready event');
                            setIsFallback(true);
                            setIsValid(false);
                            onError?.('PLAYER_INIT_ERROR');
                        }
                    },
                    onStateChange: (event) => {
                        if (isUnmountingRef.current) return;
                        
                        const state = getStateName(event.data);
                        console.log('YouTube player state changed:', {
                            state,
                            videoId: currentVideoId,
                            isPlaying,
                            currentTime: event.target.getCurrentTime?.(),
                            mountCount: mountCountRef.current
                        });
                        
                        if (state === 'ENDED') {
                            onStateChange?.(event.data);
                        }
                    },
                    onError: (event) => {
                        if (isUnmountingRef.current) return;
                        
                        const errorName = getErrorName(event.data);
                        console.error('YouTube player error:', {
                            error: errorName,
                            videoId: currentVideoId,
                            url,
                            mountCount: mountCountRef.current
                        });
                        
                        // Instead of showing error, try to use a fallback approach
                        if (errorName === 'EMBED_NOT_ALLOWED') {
                            // Try to create a new player with different parameters
                            try {
                                const fallbackPlayer = new window.YT.Player(playerRef.current, {
                                    height: '1',
                                    width: '1',
                                    videoId: currentVideoId,
                                    playerVars: {
                                        autoplay: isPlaying ? 1 : 0,
                                        controls: 0,
                                        disablekb: 1,
                                        enablejsapi: 1,
                                        fs: 0,
                                        modestbranding: 1,
                                        rel: 0,
                                        playsinline: 1,
                                        iv_load_policy: 3,
                                        showinfo: 0,
                                        origin: window.location.origin,
                                        widget_referrer: window.location.href,
                                        host: 'https://www.youtube.com',
                                        allow: 'autoplay',
                                        allowfullscreen: false,
                                        allowscriptaccess: 'always',
                                        cc_load_policy: 0,
                                        mute: 0,
                                        playsinline: 1
                                    }
                                });
                                
                                playerInstanceRef.current = fallbackPlayer;
                                setPlayer(fallbackPlayer);
                                setIsPlayerReady(true);
                                return;
                            } catch (fallbackError) {
                                console.error('Fallback player creation failed:', fallbackError);
                                setIsFallback(true);
                                setIsValid(false);
                                onError?.(errorName);
                            }
                        } else {
                            setIsValid(false);
                            onError?.(errorName);
                        }
                    }
                }
            });
        } catch (error) {
            console.error('Error creating YouTube player:', error);
            setIsFallback(true);
            setIsValid(false);
            onError?.('PLAYBACK_ERROR');
            return;
        }

        return () => {
            if (newPlayer) {
                try {
                    newPlayer.destroy();
                } catch (error) {
                    console.error('Error destroying new player:', error);
                }
            }
        };
    }, [currentVideoId, isApiReady, isPlaying, isValid, onError, cleanupPlayer]);

    // Add effect to handle play/pause
    useEffect(() => {
        if (!player || !isPlayerReady || !isValid || isUnmountingRef.current) {
            console.log('Player not ready for play/pause:', { 
                hasPlayer: !!player, 
                isPlayerReady,
                isValid,
                videoId: currentVideoId,
                url,
                mountCount: mountCountRef.current
            });
            return;
        }

        // Add safety check for player state
        const playerState = player.getPlayerState?.();
        if (playerState === undefined) {
            console.log('Player state not available, skipping control');
            return;
        }

        try {
            if (isPlaying) {
                console.log('Attempting to play video:', {
                    videoId: currentVideoId,
                    playerState: playerState,
                    mountCount: mountCountRef.current
                });
                // Force play regardless of current state
                player.playVideo();
            } else {
                console.log('Attempting to pause video:', {
                    videoId: currentVideoId,
                    playerState: playerState,
                    mountCount: mountCountRef.current
                });
                // Force pause regardless of current state
                player.pauseVideo();
            }
        } catch (error) {
            console.error('Error controlling video:', error);
        }
    }, [isPlaying, player, isPlayerReady, currentVideoId, url, isValid]);

    // Handle seeking
    useEffect(() => {
        if (player && seekTime !== undefined && isValid) {
            player.seekTo(seekTime, true);
        }
    }, [seekTime, player, isValid]);

    // Handle time updates
    useEffect(() => {
        if (!player || !isValid || !isPlayerReady) return;

        const interval = setInterval(() => {
            try {
                // Check if player and its methods exist
                if (!player || typeof player.getPlayerState !== 'function' || typeof player.getCurrentTime !== 'function' || typeof player.getDuration !== 'function') {
                    return; // Silently skip if methods aren't available
                }

                const playerState = player.getPlayerState();
                if (playerState === 1) { // PLAYING
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
            } catch (error) {
                // Silently handle errors in time updates
                return;
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [player, onTimeUpdate, isValid, isPlayerReady]);

    if (isFallback) {
        return (
            <div className="youtube-fallback p-4 text-center">
                <p className="text-gray-300 mb-2">This video cannot be played in the player. Please click the link below to watch on YouTube:</p>
                <a 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline"
                >
                    Watch on YouTube
                </a>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="youtube-error p-4 text-center">
                <p className="text-red-400 mb-2">Unable to play this video. It may be unavailable or restricted.</p>
            </div>
        );
    }

    return (
        <div className="youtube-player-container" ref={playerContainerRef}>
            <div ref={playerRef} className="youtube-player" />
        </div>
    );
};

export default YouTubePlayer; 
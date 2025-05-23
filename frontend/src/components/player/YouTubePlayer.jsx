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

const YouTubePlayer = ({ videoId, isPlaying, onTimeUpdate, volume }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const isPlayerReadyRef = useRef(false);
    const initialPlayStateRef = useRef(isPlaying);
    const lastPlayStateRef = useRef(isPlaying);
    const timeUpdateIntervalRef = useRef(null);
    const isUnmountingRef = useRef(false);
    const apiReadyRef = useRef(false);
    const [isContainerReady, setIsContainerReady] = useState(false);
    const cleanupInProgressRef = useRef(false);
    const mountCountRef = useRef(0);

    // Add validation for videoId
    const validVideoId = getYouTubeVideoId(videoId);
    
    // If not a valid YouTube video ID, don't render the player
    if (!validVideoId) {
        console.log('⚠️ Not a valid YouTube video ID:', {
            input: videoId,
            length: videoId?.length,
            isUrl: videoId?.includes('youtube.com') || videoId?.includes('youtu.be')
        });
        return null;
    }

    // Add seek functionality
    const handleSeek = (newTime) => {
        if (!isPlayerReadyRef.current || !playerRef.current) {
            console.log('⚠️ Player not ready for seek:', {
                isPlayerReady: isPlayerReadyRef.current,
                hasPlayer: !!playerRef.current,
                hasSeekTo: !!playerRef.current?.seekTo
            });
            return;
        }

        try {
            const seekTime = Number(newTime);
            if (!isNaN(seekTime) && seekTime >= 0) {
                console.log('⏩ Attempting to seek video:', { seekTime });
                playerRef.current.seekTo(seekTime, true);
            }
        } catch (error) {
            console.error('❌ Error seeking video:', error);
        }
    };

    // Update the time progress function to include seeking
    const updateTimeProgress = () => {
        if (playerRef.current && isPlayerReadyRef.current) {
            const currentTime = playerRef.current.getCurrentTime();
            const duration = playerRef.current.getDuration();
            
            if (typeof currentTime === 'number' && typeof duration === 'number') {
                // Calculate minutes and seconds
                const currentMinutes = Math.floor(currentTime / 60);
                const currentSeconds = Math.floor(currentTime % 60);
                const totalMinutes = Math.floor(duration / 60);
                const totalSeconds = Math.floor(duration % 60);

                // Calculate progress percentage
                const progress = (currentTime / duration) * 100;

                // Send time update with progress
                onTimeUpdate({
                    currentTime: {
                        minute: currentMinutes,
                        second: currentSeconds
                    },
                    totalTime: {
                        minute: totalMinutes,
                        second: totalSeconds
                    },
                    progress: progress, // Add progress percentage
                    seek: handleSeek
                });
            }
        }
    };

    // Cleanup function to handle player destruction
    const cleanupPlayer = () => {
        if (cleanupInProgressRef.current) {
            console.log('⚠️ Cleanup already in progress, skipping');
            return;
        }

        cleanupInProgressRef.current = true;
        console.log('🔧 Starting player cleanup:', {
            videoId,
            isPlayerReady: isPlayerReadyRef.current,
            hasPlayer: !!playerRef.current,
            hasInterval: !!timeUpdateIntervalRef.current,
            isUnmounting: isUnmountingRef.current,
            hasContainer: !!containerRef.current,
            containerParent: containerRef.current?.parentNode
        });

        try {
            // First, clear any intervals
            if (timeUpdateIntervalRef.current) {
                clearInterval(timeUpdateIntervalRef.current);
                timeUpdateIntervalRef.current = null;
            }

            // Then, handle the player cleanup
            if (playerRef.current) {
                try {
                    const player = playerRef.current;
                    
                    // Stop the video first
                    try {
                        player.stopVideo?.();
                    } catch (error) {
                        console.error('❌ Error stopping video:', error);
                    }

                    // Then destroy the player
                    console.log('🎯 Destroying player instance');
                    player.destroy();
                } catch (error) {
                    console.error('❌ Error during player cleanup:', error);
                } finally {
                    playerRef.current = null;
                }
            }

            // Finally, clean up the container
            if (containerRef.current) {
                try {
                    console.log('🎯 Cleaning up container');
                    // Instead of removing the container, just clear its contents
                    containerRef.current.innerHTML = '';
                    // Remove all event listeners
                    const newContainer = containerRef.current.cloneNode(true);
                    if (containerRef.current.parentNode) {
                        containerRef.current.parentNode.replaceChild(newContainer, containerRef.current);
                        containerRef.current = newContainer;
                    }
                } catch (error) {
                    console.error('❌ Error cleaning up container:', error);
                }
            }

            isPlayerReadyRef.current = false;
        } finally {
            cleanupInProgressRef.current = false;
        }
    };

    // Track component lifecycle
    useEffect(() => {
        mountCountRef.current++;
        console.log('🔄 Component lifecycle:', {
            action: 'mount',
            count: mountCountRef.current,
            videoId,
            isPlaying,
            hasContainer: !!containerRef.current,
            containerParent: containerRef.current?.parentNode
        });

        return () => {
            console.log('🔄 Component lifecycle:', {
                action: 'unmount',
                count: mountCountRef.current,
                videoId,
                isPlaying,
                hasContainer: !!containerRef.current,
                containerParent: containerRef.current?.parentNode
            });
        };
    }, []);

    // Initialize YouTube API
    useEffect(() => {
        mountCountRef.current++;
        console.log('📥 Initializing YouTube API:', {
            mountCount: mountCountRef.current,
            hasYT: !!window.YT,
            hasContainer: !!containerRef.current
        });

        if (!window.YT) {
            console.log('📥 Loading YouTube IFrame API...');
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

            window.onYouTubeIframeAPIReady = () => {
                console.log('✅ YouTube IFrame API Ready:', {
                    mountCount: mountCountRef.current,
                    hasContainer: !!containerRef.current
                });
                apiReadyRef.current = true;
                isUnmountingRef.current = false; // Reset unmounting flag when API is ready
            };
        } else {
            console.log('✅ YouTube IFrame API already loaded');
            apiReadyRef.current = true;
            isUnmountingRef.current = false; // Reset unmounting flag when API is already loaded
        }

        return () => {
            console.log('🧹 Cleaning up YouTube API:', {
                mountCount: mountCountRef.current,
                isUnmounting: isUnmountingRef.current
            });
            apiReadyRef.current = false;
        };
    }, []);

    // Handle container ready state
    useEffect(() => {
        if (containerRef.current) {
            console.log('🎯 Container is ready:', {
                mountCount: mountCountRef.current,
                containerParent: containerRef.current.parentNode,
                containerChildren: containerRef.current.children.length
            });
            setIsContainerReady(true);
        }
    }, [containerRef.current]);

    // Handle videoId changes
    useEffect(() => {
        if (!validVideoId) {
            console.log('⚠️ Skipping player initialization - invalid video ID');
            return;
        }

        console.log('🔄 VideoId changed:', {
            videoId: validVideoId,
            isPlaying,
            apiReady: apiReadyRef.current,
            containerReady: isContainerReady,
            isUnmounting: isUnmountingRef.current,
            isPlayerReady: isPlayerReadyRef.current,
            mountCount: mountCountRef.current
        });

        if (!apiReadyRef.current || !isContainerReady) {
            console.log('⏳ Waiting for API and container to be ready');
            return;
        }

        if (isUnmountingRef.current) {
            console.log('⚠️ Skipping initialization due to unmounting');
            return;
        }

        // Clean up existing player before creating a new one
        cleanupPlayer();

        // Create new player instance
        try {
            console.log('🎮 Creating new player instance');
            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '1',
                width: '1',
                videoId: validVideoId,
                playerVars: {
                    'autoplay': 0, // Don't autoplay on creation
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'rel': 0,
                    'showinfo': 0,
                    'modestbranding': 1,
                    'enablejsapi': 1,
                    'mute': volume === 0 ? 1 : 0
                },
                events: {
                    'onReady': (event) => {
                        console.log('🎯 YouTube player ready');
                        playerRef.current = event.target;
                        isPlayerReadyRef.current = true;
                        
                        // Set initial volume
                        try {
                            playerRef.current.setVolume(volume * 100);
                            if (volume === 0) {
                                playerRef.current.mute();
                            } else {
                                playerRef.current.unMute();
                            }
                        } catch (error) {
                            console.error('❌ Error setting initial volume:', error);
                        }
                        
                        // Get initial duration
                        const duration = event.target.getDuration();
                        if (duration) {
                            const minutes = Math.floor(duration / 60);
                            const seconds = Math.floor(duration % 60);
                            console.log('Initial YouTube duration:', {
                                totalSeconds: duration,
                                minutes,
                                seconds
                            });
                            onTimeUpdate({
                                currentTime: { minute: 0, second: 0 },
                                totalTime: { minute: minutes, second: seconds }
                            });
                        }
                        
                        // Start time update interval
                        if (timeUpdateIntervalRef.current) {
                            clearInterval(timeUpdateIntervalRef.current);
                        }
                        
                        timeUpdateIntervalRef.current = setInterval(() => {
                            if (playerRef.current && isPlayerReadyRef.current) {
                                updateTimeProgress();
                            }
                        }, 1000); // Update every second
                        
                        if (isPlaying) {
                            console.log('▶️ Playing video on ready');
                            event.target.playVideo();
                        }
                    },
                    'onStateChange': (event) => {
                        if (isUnmountingRef.current) {
                            console.log('⚠️ Skipping onStateChange due to unmounting');
                            return;
                        }

                        console.log('🔄 Player state changed:', {
                            state: event.data,
                            stateName: getStateName(event.data)
                        });
                        
                        if (event.data === window.YT.PlayerState.PLAYING) {
                            lastPlayStateRef.current = true;
                            timeUpdateIntervalRef.current = setInterval(updateTimeProgress, 1000);
                        } else if (event.data === window.YT.PlayerState.PAUSED) {
                            lastPlayStateRef.current = false;
                            if (timeUpdateIntervalRef.current) {
                                clearInterval(timeUpdateIntervalRef.current);
                                timeUpdateIntervalRef.current = null;
                            }
                        }
                    },
                    'onError': (event) => {
                        console.error('❌ YouTube player error:', {
                            error: event.data,
                            errorName: getErrorName(event.data)
                        });
                    }
                }
            });
        } catch (error) {
            console.error('❌ Error creating YouTube player:', error);
        }

        return () => {
            if (!isUnmountingRef.current) {
                cleanupPlayer();
            }
        };
    }, [validVideoId, isContainerReady, apiReadyRef.current]);

    // Handle play state changes
    useEffect(() => {
        if (!isPlayerReadyRef.current || !playerRef.current) {
            console.log('⚠️ Player not ready for control:', {
                isPlayerReady: isPlayerReadyRef.current,
                hasPlayer: !!playerRef.current,
                hasPlayVideo: !!playerRef.current?.playVideo,
                hasPauseVideo: !!playerRef.current?.pauseVideo
            });
            return;
        }

        console.log('🔄 Play state changed:', {
            isPlaying,
            videoId: validVideoId,
            isPlayerReady: isPlayerReadyRef.current,
            lastPlayState: lastPlayStateRef.current
        });

        try {
            if (isPlaying) {
                console.log('▶️ Attempting to play video');
                playerRef.current.playVideo();
            } else {
                console.log('⏸️ Attempting to pause video');
                playerRef.current.pauseVideo();
            }
        } catch (error) {
            console.error('❌ Error controlling video:', error);
        }
    }, [isPlaying, validVideoId]);

    // Component unmounting
    useEffect(() => {
        return () => {
            console.log('🔄 Component unmounting');
            isUnmountingRef.current = true;
            
            // Use a Promise to ensure cleanup happens in the correct order
            Promise.resolve().then(() => {
                cleanupPlayer();
            });
        };
    }, []);

    // Add effect to handle volume changes
    useEffect(() => {
        console.log('🔊 Volume effect triggered:', {
            volume,
            isPlayerReady: isPlayerReadyRef.current,
            hasPlayer: !!playerRef.current,
            videoId: validVideoId
        });

        if (playerRef.current && isPlayerReadyRef.current) {
            try {
                if (volume === 0) {
                    console.log('🔇 Attempting to mute player');
                    playerRef.current.mute();
                } else {
                    console.log('🔊 Attempting to set volume:', volume * 100);
                    playerRef.current.unMute();
                    playerRef.current.setVolume(volume * 100);
                }
            } catch (error) {
                console.error('❌ Error setting volume:', error);
            }
        } else {
            console.log('⚠️ Cannot set volume - player not ready:', {
                hasPlayer: !!playerRef.current,
                isPlayerReady: isPlayerReadyRef.current
            });
        }
    }, [volume]);

    return (
        <div 
            ref={containerRef}
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                border: 'none',
                overflow: 'hidden'
            }}
        />
    );
};

export default YouTubePlayer; 
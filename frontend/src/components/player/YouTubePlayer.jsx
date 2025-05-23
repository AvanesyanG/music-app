import { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, isPlaying }) => {
    const playerRef = useRef(null);
    const containerRef = useRef(null);
    const isPlayerReadyRef = useRef(false);
    const initialPlayStateRef = useRef(isPlaying);

    useEffect(() => {
        console.log('YouTubePlayer mounted/updated:', { videoId, isPlaying });
        initialPlayStateRef.current = isPlaying;
        
        // Load the YouTube IFrame Player API
        if (!window.YT) {
            console.log('Loading YouTube IFrame API...');
            const tag = document.createElement('script');
            tag.src = "https://www.youtube.com/iframe_api";
            const firstScriptTag = document.getElementsByTagName('script')[0];
            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        } else {
            console.log('YouTube IFrame API already loaded');
        }

        // Initialize player when API is ready
        window.onYouTubeIframeAPIReady = () => {
            console.log('YouTube IFrame API Ready, initializing player...');
            
            if (playerRef.current) {
                console.log('Destroying existing player');
                playerRef.current.destroy();
            }

            playerRef.current = new window.YT.Player(containerRef.current, {
                height: '1',
                width: '1',
                videoId: videoId,
                playerVars: {
                    'autoplay': initialPlayStateRef.current ? 1 : 0,
                    'controls': 0,
                    'disablekb': 1,
                    'fs': 0,
                    'rel': 0,
                    'showinfo': 0,
                    'modestbranding': 1,
                    'enablejsapi': 1
                },
                events: {
                    'onReady': (event) => {
                        console.log('YouTube player ready:', {
                            videoId,
                            isPlaying: initialPlayStateRef.current,
                            playerState: event.target.getPlayerState()
                        });
                        isPlayerReadyRef.current = true;
                        if (initialPlayStateRef.current) {
                            console.log('Attempting to play video on ready');
                            event.target.playVideo();
                        }
                    },
                    'onStateChange': (event) => {
                        console.log('YouTube player state changed:', {
                            state: event.data,
                            videoId,
                            isPlaying: initialPlayStateRef.current
                        });
                    },
                    'onError': (event) => {
                        console.error('YouTube player error:', {
                            error: event.data,
                            videoId
                        });
                    }
                }
            });
        };

        // If API is already loaded, initialize player immediately
        if (window.YT && window.YT.Player) {
            console.log('YouTube API already available, initializing player immediately');
            window.onYouTubeIframeAPIReady();
        }

        return () => {
            console.log('YouTubePlayer cleanup:', { videoId });
            if (playerRef.current) {
                playerRef.current.destroy();
            }
            isPlayerReadyRef.current = false;
        };
    }, [videoId]); // Only recreate player when videoId changes

    useEffect(() => {
        console.log('Play state changed:', { isPlaying, videoId, isPlayerReady: isPlayerReadyRef.current });
        
        if (isPlayerReadyRef.current && playerRef.current && playerRef.current.playVideo && playerRef.current.pauseVideo) {
            try {
                const currentState = playerRef.current.getPlayerState();
                console.log('Current player state:', currentState);
                
                // Only change state if it's different from current
                if (isPlaying && currentState !== window.YT.PlayerState.PLAYING) {
                    console.log('Attempting to play video');
                    playerRef.current.playVideo();
                } else if (!isPlaying && currentState !== window.YT.PlayerState.PAUSED) {
                    console.log('Attempting to pause video');
                    playerRef.current.pauseVideo();
                }
            } catch (error) {
                console.error('Error controlling YouTube player:', {
                    error,
                    videoId,
                    isPlaying,
                    playerState: playerRef.current?.getPlayerState?.()
                });
            }
        } else {
            console.log('Player not ready for control:', {
                isPlayerReady: isPlayerReadyRef.current,
                hasPlayer: !!playerRef.current,
                hasPlayVideo: !!playerRef.current?.playVideo,
                hasPauseVideo: !!playerRef.current?.pauseVideo
            });
        }
    }, [isPlaying]); // Handle play/pause state changes

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
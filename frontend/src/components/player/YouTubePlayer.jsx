import { useEffect, useRef } from 'react';

const YouTubePlayer = ({ videoId, isPlaying }) => {
    const iframeRef = useRef(null);

    useEffect(() => {
        if (iframeRef.current) {
            const iframe = iframeRef.current;
            if (isPlaying) {
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&modestbranding=1`;
            } else {
                iframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=0&controls=0&disablekb=1&fs=0&rel=0&showinfo=0&modestbranding=1`;
            }
        }
    }, [videoId, isPlaying]);

    return (
        <iframe
            ref={iframeRef}
            style={{
                position: 'absolute',
                width: '1px',
                height: '1px',
                border: 'none',
                overflow: 'hidden'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
        />
    );
};

export default YouTubePlayer; 
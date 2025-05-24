import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PageTransition = ({ children }) => {
    const location = useLocation();
    const [displayLocation, setDisplayLocation] = useState(location);
    const [transitionStage, setTransitionStage] = useState('fadeIn');
    const [slideDirection, setSlideDirection] = useState('right');

    useEffect(() => {
        if (location.pathname !== displayLocation.pathname) {
            const routes = ['/', '/library'];
            const currentIndex = routes.indexOf(displayLocation.pathname);
            const nextIndex = routes.indexOf(location.pathname);
            
            if (location.pathname.includes('/library/album/')) {
                setSlideDirection('left');
            } else if (displayLocation.pathname.includes('/library/album/')) {
                setSlideDirection('right');
            } else if (currentIndex !== -1 && nextIndex !== -1) {
                setSlideDirection(currentIndex < nextIndex ? 'left' : 'right');
            }
            
            setTransitionStage('fadeOut');
        }
    }, [location.pathname, displayLocation.pathname]);

    useEffect(() => {
        if (transitionStage === 'fadeOut') {
            const timeout = setTimeout(() => {
                setDisplayLocation(location);
                setTransitionStage('fadeIn');
            }, 250); // Match with animation duration

            return () => clearTimeout(timeout);
        }
    }, [transitionStage, location]);

    let animationClass = '';
    if (transitionStage === 'fadeOut') {
        animationClass = slideDirection === 'left' ? 'animate-slide-left-out' : 'animate-slide-right-out';
    } else {
        animationClass = slideDirection === 'left' ? 'animate-slide-left-in' : 'animate-slide-right-in';
    }

    return (
        <div className="w-full h-full relative overflow-hidden">
            <div
                className={`w-full h-full ${animationClass}`}
            >
                {children}
            </div>
        </div>
    );
};

export default PageTransition; 
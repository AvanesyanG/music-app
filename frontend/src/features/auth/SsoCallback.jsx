import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useClerk } from '@clerk/clerk-react';

const SsoCallback = () => {
    const { handleRedirectCallback } = useClerk();
    const navigate = useNavigate();

    useEffect(() => {
        handleRedirectCallback()
            .then(() => navigate("/"))
            .catch(err => console.error("Error handling redirect:", err));
    }, [handleRedirectCallback, navigate]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <p className="text-white text-lg">Completing authentication...</p>
        </div>
    );
};

export default SsoCallback;
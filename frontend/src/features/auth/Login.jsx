import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignIn } from '@clerk/clerk-react';
import SignIn from './forms/SignIn';
import SignUp from './forms/SignUp';
import EmailVerifier from './forms/EmailVerifier';

const Login = () => {
    const [isSignIn, setIsSignIn] = useState(true);
    const [showVerification, setShowVerification] = useState(false);
    const { signIn } = useSignIn();

    const handleGoogleLogin = () => {
        signIn.authenticateWithRedirect({
            strategy: "oauth_google",
            redirectUrl: "/sso-callback",
            redirectUrlComplete: "/"
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-black p-4">
            <div className="w-full max-w-sm">
                <div className="bg-black/30 p-8 rounded-lg backdrop-blur-md">

                   

                    {/* Toggle Button */}
                    <div className="flex justify-center mb-8">
                        <div className="bg-gray-800 p-1 rounded-full inline-flex">
                            <button
                                onClick={() => setIsSignIn(true)}
                                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                                    isSignIn 
                                        ? 'bg-[#1DB954] text-white' 
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsSignIn(false)}
                                className={`px-6 py-2 rounded-full transition-all duration-300 ${
                                    !isSignIn 
                                        ? 'bg-[#1DB954] text-white' 
                                        : 'text-gray-300 hover:text-white'
                                }`}
                            >
                                Sign Up
                            </button>
                        </div>
                    </div>

                    {/* Forms Container */}
                    <div className="relative h-[500px]">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={isSignIn ? 'signin' : 'signup'}
                                initial={{ 
                                    opacity: 0,
                                    x: isSignIn ? 100 : -100,
                                    position: 'absolute',
                                    width: '100%'
                                }}
                                animate={{ 
                                    opacity: 1,
                                    x: 0,
                                    position: 'absolute',
                                    width: '100%'
                                }}
                                exit={{ 
                                    opacity: 0,
                                    x: isSignIn ? -100 : 100,
                                    position: 'absolute',
                                    width: '100%'
                                }}
                                transition={{ 
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30
                                }}
                                className="w-full"
                            >
                                {isSignIn ? (
                                    <SignIn />
                                ) : (
                                    <SignUp 
                                        onSuccess={() => setShowVerification(true)}
                                        onSwitch={() => setIsSignIn(true)}
                                    />
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
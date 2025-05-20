import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSignIn } from '@clerk/clerk-react';
import SignIn from './forms/SignIn';
import SignUp from './forms/SignUp';
import EmailVerifier from './forms/EmailVerifier';

const Login = () => {
    const [isSignUp, setIsSignUp] = useState(false);
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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
            <AnimatePresence mode='wait'>
                <motion.div
                    key={showVerification ? 'verify' : 'form'}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="w-full max-w-6xl"
                >
                    {showVerification ? (
                        <EmailVerifier onBack={() => setShowVerification(false)} />
                    ) : (
                        <div className="bg-black/30 p-8 rounded-lg backdrop-blur-md">
                            <h1 className="text-4xl font-bold text-white mb-8 text-center">Welcome to Spotify</h1>
                            
                            {/* Google Login Button */}
                            <button
                                onClick={handleGoogleLogin}
                                className="w-full bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-full flex items-center justify-center gap-2 transition-all mb-8"
                            >
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.345-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z"/>
                                </svg>
                                Continue with Google
                            </button>

                            {/* Divider */}
                            <div className="flex items-center mb-8">
                                <div className="flex-1 border-t border-gray-600"></div>
                                <span className="px-4 text-gray-300">or</span>
                                <div className="flex-1 border-t border-gray-600"></div>
                            </div>

                            {/* Toggle Button */}
                            <div className="flex justify-center mb-8">
                                <div className="bg-gray-800 p-1 rounded-full inline-flex">
                                    <button
                                        onClick={() => setIsSignUp(false)}
                                        className={`px-6 py-2 rounded-full transition-all duration-300 ${
                                            !isSignUp 
                                                ? 'bg-blue-600 text-white' 
                                                : 'text-gray-300 hover:text-white'
                                        }`}
                                    >
                                        Sign In
                                    </button>
                                    <button
                                        onClick={() => setIsSignUp(true)}
                                        className={`px-6 py-2 rounded-full transition-all duration-300 ${
                                            isSignUp 
                                                ? 'bg-blue-600 text-white' 
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
                                        key={isSignUp ? 'signup' : 'signin'}
                                        initial={{ 
                                            opacity: 0,
                                            x: isSignUp ? 100 : -100,
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
                                            x: isSignUp ? -100 : 100,
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
                                        {isSignUp ? (
                                            <SignUp 
                                                onSuccess={() => setShowVerification(true)}
                                                onSwitch={() => setIsSignUp(false)}
                                            />
                                        ) : (
                                            <SignIn onSwitch={() => setIsSignUp(true)} />
                                        )}
                                    </motion.div>
                                </AnimatePresence>
                            </div>
                        </div>
                    )}
                </motion.div>
            </AnimatePresence>
        </div>
    );
};

export default Login;
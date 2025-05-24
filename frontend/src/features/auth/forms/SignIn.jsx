import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { assets } from '../../../assets/assets';

const SignIn = () => {
    const { signIn, isLoaded } = useSignIn();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;

        try {
            setLoading(true);
            const result = await signIn.create({
                identifier: email,
                password,
            });

            if (result.status === 'complete') {
                toast.success('Signed in successfully!');
                navigate('/');
            } else {
                toast.error('Sign in failed. Please try again.');
            }
        } catch (err) {
            toast.error(err.errors?.[0]?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return;
        try {
            setLoading(true);
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/'
            });
        } catch (err) {
            toast.error('Google sign in failed. Please try again.');
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center space-y-8">
            {/* Logo and Title */}
            <div className="text-center">
                <h2 className="text-3xl font-bold text-white mb-2">Welcome to Spotify</h2>
            </div>

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="w-48 space-y-4">
                <div>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full bg-[#1E1E1E] text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-colors"
                        placeholder="Email address"
                    />
                </div>

                <div>
                    <input
                        type="password"
                        id="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full bg-[#1E1E1E] text-white rounded-full px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#1DB954] transition-colors"
                        placeholder="Password"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-[#1DB954] text-white py-3 px-4 rounded-full font-medium hover:bg-[#1ed760] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Signing in...' : 'Sign In'}
                </button>
            </form>

            {/* Sign Up Link */}
            <p className="text-gray-400">
                Don't have an account?{' '}
                <button
                    onClick={() => navigate('/sign-up')}
                    className="text-[#1DB954] hover:text-[#1ed760] font-medium"
                >
                    Sign up
                </button>
            </p>

            {/* Divider */}
            <div className="relative w-48">
                <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-700"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                    <span className="px-2 bg-black/30 text-gray-400">or</span>
                </div>
            </div>

            {/* Google Sign In Button */}
            <button
                onClick={handleGoogleSignIn}
                disabled={loading}
                className="w-48 flex items-center justify-center gap-3 bg-[#1DB954] text-white py-3 px-4 rounded-full font-medium hover:bg-[#1ed760] transition-colors"
            >
                <img 
                    src="https://www.google.com/favicon.ico" 
                    alt="Google" 
                    className="w-5 h-5"
                />
                Continue with Google
            </button>
        </div>
    );
};

export default SignIn;
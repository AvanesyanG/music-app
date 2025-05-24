import { useSignUp } from "@clerk/clerk-react";
import { useClerk } from "@clerk/clerk-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

const EmailVerifier = ({ onBack }) => {
    const { isLoaded, signUp } = useSignUp();
    const { setActive } = useClerk();
    const [code, setCode] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleVerify = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code,
            });

            if (completeSignUp.status === "complete") {
                await setActive({ session: completeSignUp.createdSessionId });
                navigate("/");
            }
        } catch (err) {
            setError(err.errors[0].longMessage);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Verify Email</h2>
            <p className="text-gray-300 mb-4">We've sent a verification code to your email</p>
            <form onSubmit={handleVerify} className="space-y-4">
                <div>
                    <label className="block text-gray-300 mb-2">Verification Code</label>
                    <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Verify Email
                </button>
            </form>
            <button 
                onClick={onBack}
                className="text-sm text-blue-400 hover:text-blue-300 mt-4 block mx-auto"
            >
                Back to sign up
            </button>
        </div>
    );
};

export default EmailVerifier;
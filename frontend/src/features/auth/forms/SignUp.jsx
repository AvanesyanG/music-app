import { useSignUp } from "@clerk/clerk-react";
import { useState } from "react";

const SignUp = ({ onSuccess, onSwitch }) => {
    const { isLoaded, signUp } = useSignUp();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isLoaded) return;

        try {
            const result = await signUp.create({
                emailAddress: email,
                password,
            });

            await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
            onSuccess();
        } catch (err) {
            setError(err.errors[0].longMessage);
        }
    };

    return (
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-gray-300 mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                        required
                    />
                </div>
                <div>
                    <label className="block text-gray-300 mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-700 rounded text-white"
                        required
                    />
                </div>
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button
                    type="submit"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                    Create Account
                </button>
            </form>
            <div className="mt-6 text-center text-gray-300">
                Already have an account?{" "}
                <button 
                    onClick={onSwitch}
                    className="text-blue-400 hover:text-blue-300"
                >
                    Sign in
                </button>
            </div>
        </div>
    );
};

export default SignUp;
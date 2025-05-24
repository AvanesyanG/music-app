import { useState } from 'react';
import { spotifyService } from '../../services/spotifyService';

export const FallbackTester = () => {
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const testFallbacks = async () => {
        try {
            setLoading(true);
            setError(null);
            const validationResults = await spotifyService.validateFallbackVideos();
            setResults(validationResults);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-gray-900 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-6 text-white">Fallback Video Tester</h2>
            
            <button
                onClick={testFallbacks}
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Testing Videos...' : 'Test Fallback Videos'}
            </button>

            {error && (
                <div className="mt-4 p-4 bg-red-900 text-red-200 rounded-lg">
                    Error: {error}
                </div>
            )}

            {results && (
                <div className="mt-6 text-gray-200">
                    <h3 className="text-xl font-semibold mb-4">Results</h3>
                    
                    <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                        <h4 className="font-medium text-lg mb-2">Summary</h4>
                        <p>Total Videos: {results.validVideos.length + results.invalidVideos.length}</p>
                        <p>Valid Videos: {results.validVideos.length}</p>
                        <p>Invalid Videos: {results.invalidVideos.length}</p>
                    </div>

                    {results.validVideos.length > 0 && (
                        <div className="mb-6 p-4 bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-lg mb-2">Valid Videos</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                {results.validVideos.map(video => (
                                    <li key={video.id} className="text-green-400">
                                        {video.id} - {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {results.invalidVideos.length > 0 && (
                        <div className="p-4 bg-gray-800 rounded-lg">
                            <h4 className="font-medium text-lg mb-2">Invalid Videos</h4>
                            <ul className="list-disc pl-5 space-y-2">
                                {results.invalidVideos.map(video => (
                                    <li key={video.id} className="text-red-400">
                                        {video.id} - {video.reason}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}; 
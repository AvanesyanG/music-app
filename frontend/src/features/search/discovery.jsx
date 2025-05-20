import { useState, useEffect } from 'react';
import { spotifyService } from '../../services/spotifyService';
import { SongItem } from '../common/SongItem';

export const Discovery = () => {
  const [topTracks, setTopTracks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDiscoveryData = async () => {
      try {
        setLoading(true);
        const [top, recs] = await Promise.all([
          spotifyService.getTopTracks(),
          spotifyService.getRecommendations()
        ]);
        setTopTracks(top);
        setRecommendations(recs);
      } catch (err) {
        console.error('Error fetching discovery data:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDiscoveryData();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 p-4">
        Error loading discovery content: {error}
      </div>
    );
  }

  return (
    <div className="space-y-8 p-4">
      <section>
        <h2 className="text-2xl font-bold mb-4 text-white">Top Tracks</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {topTracks.map(track => (
            <SongItem 
              key={track.id} 
              song={track}
              showPreview={true}
              showSpotifyLink={true}
            />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold mb-4 text-white">Recommended for You</h2>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map(track => (
            <SongItem 
              key={track.id} 
              song={track}
              showPreview={true}
              showSpotifyLink={true}
            />
          ))}
        </div>
      </section>
    </div>
  );
}; 
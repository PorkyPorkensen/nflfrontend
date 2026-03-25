import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';

export default function PlayerStats() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  
  const [playerData, setPlayerData] = useState(null);
  const [seasonStats, setSeasonStats] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Use player data passed from modal
    if (location.state?.playerData) {
      const player = location.state.playerData;
      setPlayerData(player);
      console.log('Loaded player from modal:', player);
      
      // Create sample stats from the data we have
      const mockStats = [
        { displayName: 'Jersey', displayValue: player.jersey || 'N/A', name: 'jersey', value: player.jersey },
        { displayName: 'Position', displayValue: typeof player.position === 'string' ? player.position : player.position?.abbreviation, name: 'position', value: player.position },
        { displayName: 'College', displayValue: typeof player.college === 'string' ? player.college : player.college?.name || 'N/A', name: 'college', value: player.college },
      ];
      
      setSeasonStats(mockStats);
      
      // Try to fetch additional stats from sports.core API
      if (player.id) {
        fetchPlayerStats();
      }
    } else {
      // Try to fetch if no state was passed
      fetchPlayerStats();
    }
  }, [location.state, playerId]);

  const fetchPlayerStats = async () => {
    setLoading(true);
    
    try {
      // Try the overview endpoint first - contains stats + next game + rotowire notes
      const overviewResponse = await fetch(
        `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${playerId}/overview`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        console.log('✓ Player overview loaded:', overviewData);
        
        // Extract position-specific stats from statistics
        if (overviewData.statistics) {
          const stats = overviewData.statistics;
          
          // Get the regular season or most recent split
          const regularSeasonSplit = stats.splits?.find(s => s.displayName === 'Regular Season') || stats.splits?.[stats.splits.length - 1];
          
          if (regularSeasonSplit && regularSeasonSplit.stats) {
            const positionStats = [];
            
            regularSeasonSplit.stats.forEach((statValue, idx) => {
              const statName = stats.displayNames?.[idx] || stats.names?.[idx];
              const statLabel = stats.labels?.[idx];
              
              if (statName && statValue !== null && statValue !== undefined) {
                positionStats.push({
                  displayName: statName,
                  displayValue: statValue,
                  label: statLabel,
                  name: stats.names?.[idx] || `stat_${idx}`
                });
              }
            });
            
            if (positionStats.length > 0) {
              setSeasonStats(prev => {
                const existingNames = new Set((prev || []).map(s => s.name));
                const uniqueStats = positionStats.filter(stat => !existingNames.has(stat.name));
                return [...(prev || []), ...uniqueStats];
              });
            }
          }
        }
      }
      
      // Try to fetch game log for recent games
      const gamelogResponse = await fetch(
        `https://site.web.api.espn.com/apis/common/v3/sports/football/nfl/athletes/${playerId}/gamelog`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (gamelogResponse.ok) {
        const gamelogData = await gamelogResponse.json();
        console.log('✓ Player game log loaded:', gamelogData);
      }
      
      // Try to fetch bio data from sports.core.api as backup
      const bioResponse = await fetch(
        `https://sports.core.api.espn.com/v3/sports/football/nfl/athletes/${playerId}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (bioResponse.ok) {
        const apiData = await bioResponse.json();
        console.log('✓ Player bio data loaded:', apiData.displayName);
        
        // Merge API data with existing player data
        setPlayerData(prev => ({
          ...prev,
          displayHeight: apiData.displayHeight || prev?.displayHeight,
          displayWeight: apiData.displayWeight || prev?.displayWeight,
          age: apiData.age || prev?.age,
          dateOfBirth: apiData.dateOfBirth || prev?.dateOfBirth,
          birthPlace: apiData.birthPlace || prev?.birthPlace,
          fullName: apiData.fullName || prev?.fullName,
          active: apiData.active !== undefined ? apiData.active : prev?.active,
        }));
        
        // Create enhanced stats from bio data
        const bioStats = [];
        if (apiData.displayHeight) bioStats.push({ displayName: 'Height', displayValue: apiData.displayHeight, name: 'height' });
        if (apiData.displayWeight) bioStats.push({ displayName: 'Weight', displayValue: apiData.displayWeight, name: 'weight' });
        if (apiData.age) bioStats.push({ displayName: 'Age', displayValue: apiData.age, name: 'age' });
        if (apiData.experience?.years !== undefined) bioStats.push({ 
          displayName: 'Experience', 
          displayValue: apiData.experience.years > 0 ? `${apiData.experience.years} yrs` : 'Rookie', 
          name: 'experience' 
        });
        if (apiData.birthPlace?.city) bioStats.push({ 
          displayName: 'Hometown', 
          displayValue: `${apiData.birthPlace.city}, ${apiData.birthPlace.state}`, 
          name: 'hometown' 
        });
        
        // Add to existing season stats - but only if not already present
        setSeasonStats(prev => {
          const existingNames = new Set((prev || []).map(s => s.name));
          const uniqueBioStats = bioStats.filter(stat => !existingNames.has(stat.name));
          return [...(prev || []), ...uniqueBioStats];
        });
      }
    } catch (err) {
      console.error('Error fetching player data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No player data available. Please navigate from the team roster.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-blue-600 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:opacity-80 transition bg-blue-900 px-4 py-2 rounded-lg"
          >
            ← Back
          </button>
          
          <div className="flex items-start gap-6">
            {/* Player Image */}
            {playerData.headshot?.href && (
              <img
                src={playerData.headshot.href}
                alt={playerData.displayName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-4 border-white"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            
            {/* Player Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-oswald mb-2">
                {playerData.displayName || 'Player Stats'}
              </h1>
              <div className="space-y-2 font-roboto-condensed text-lg">
                <p>#{playerData.jersey} • {typeof playerData.position === 'string' ? playerData.position : (playerData.position?.abbreviation || 'N/A')}</p>
                {playerData.team?.displayName && (
                  <p>{playerData.team.displayName}</p>
                )}
                {playerData.displayHeight && playerData.displayWeight && (
                  <p>{playerData.displayHeight} • {playerData.displayWeight}</p>
                )}
                {playerData.birthPlace && (
                  <p>{playerData.birthPlace.city}, {playerData.birthPlace.state}</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* Player Info */}
        <div className="space-y-8">
          {seasonStats && seasonStats.length > 0 ? (
            <>
              {/* Bio Info Cards */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Player Profile</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {seasonStats
                    .filter(stat => ['jersey', 'position', 'college', 'height', 'weight', 'age', 'experience', 'hometown'].includes(stat.name))
                    .map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                      >
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                          {stat.displayName || stat.name}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-blue-600 font-oswald">
                          {stat.displayValue || stat.value || 'N/A'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

              {/* Season Stats Cards */}
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-800">Season Stats</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {seasonStats
                    .filter(stat => !['jersey', 'position', 'college', 'height', 'weight', 'age', 'experience', 'hometown'].includes(stat.name))
                    .map((stat, idx) => (
                      <div
                        key={idx}
                        className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                      >
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                          {stat.displayName || stat.name}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-blue-600 font-oswald">
                          {stat.displayValue || stat.value || 'N/A'}
                        </p>
                      </div>
                    ))}
                </div>
              </div>

                {/* About Player */}
                <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
                  <div className="bg-blue-50 px-6 py-4 border-b border-gray-200">
                    <h3 className="text-lg font-bold font-oswald">About This Player</h3>
                  </div>
                  <div className="p-6 space-y-3 text-gray-700 font-roboto-condensed leading-relaxed">
                    <p>
                      Player information loaded from team roster. For full career statistics and game-by-game breakdowns, 
                      visit <a href={`https://www.espn.com/nfl/player/_/id/${playerData.id}`} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">ESPN Player Profile</a>.
                    </p>
                    {playerData.experience?.years !== undefined && (
                      <p>
                        <strong>Experience:</strong> {playerData.experience.years > 0 ? `${playerData.experience.years} years in the NFL` : 'Rookie'}
                      </p>
                    )}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-8 text-center">
                <p className="text-gray-600">No additional stats available</p>
              </div>
            )}
          </div>
      </div>
    </div>
  );
}

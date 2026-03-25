import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function PlayerDetailsModal({ 
  isOpen, 
  onClose, 
  player, 
  sport = 'nfl',
  teamId,
  gameStats
}) {
  const navigate = useNavigate();
  const [seasonStats, setSeasonStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen && teamId && player) {
      fetchSeasonStats();
    }
  }, [isOpen, teamId, player]);

  const fetchSeasonStats = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const sportPath = sport.toLowerCase() === 'nba' 
        ? 'basketball/nba' 
        : 'football/nfl';
      
      // Fetch team roster
      const rosterResponse = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/teams/${teamId}/roster`
      );
      
      if (!rosterResponse.ok) {
        throw new Error('Failed to fetch roster');
      }
      
      const rosterData = await rosterResponse.json();
      console.log('Roster response:', rosterData);
      console.log('Looking for player ID:', player.id);
      
      if (rosterData?.athletes) {
        console.log('Roster athletes:', rosterData.athletes);
        
        // Find player by matching multiple criteria
        let playerData = null;
        
        // First try by ID if available
        if (player.id && player.id.indexOf('-') === -1) {
          playerData = rosterData.athletes.find(a => a.id === player.id);
        }
        
        // If not found, try by displayName
        if (!playerData && player.displayName) {
          playerData = rosterData.athletes.find(a => 
            (a.displayName === player.displayName) || 
            (a.name === player.displayName)
          );
        }
        
        // If still not found, try by jersey and position
        if (!playerData && player.jersey) {
          playerData = rosterData.athletes.find(a => 
            a.jersey === player.jersey && 
            (typeof a.position === 'string' ? 
              a.position === player.position : 
              a.position?.abbreviation === (typeof player.position === 'string' ? player.position : player.position?.abbreviation) ||
              a.position?.name === (typeof player.position === 'string' ? player.position : player.position?.name)
            )
          );
        }
        
        // Log what we found
        if (!playerData) {
          console.log('Exact match not found. Available athlete IDs:', rosterData.athletes.map(a => a.id));
          console.log('Available Names:', rosterData.athletes.map(a => a.displayName || a.name));
          console.log('Available Jerseys:', rosterData.athletes.map(a => a.jersey));
          // Don't set error - just means we couldn't find them in the roster, which is fine
        }
        
        if (playerData) {
          console.log('Found player data:', playerData);
          console.log('Player data keys:', Object.keys(playerData));
          console.log('Has stats?:', playerData.stats);
          setSeasonStats(playerData);
        }
      } else {
        console.log('No athletes in roster data');
        // Don't set error - roster just isn't available
      }
    } catch (err) {
      console.error('Error fetching roster:', err);
      // Don't show error - roster data is optional
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !player) return null;

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const getSportColors = () => {
    switch(sport.toLowerCase()) {
      case 'nba':
        return { primary: '#f97316', bg: 'orange' };
      case 'nfl':
      default:
        return { primary: '#3b82f6', bg: 'blue' };
    }
  };

  const colors = getSportColors();

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div style={{ backgroundColor: colors.primary }} className="text-white p-6 border-b-4 border-gray-300 shadow-md">
          <button
            onClick={onClose}
            className="float-right text-white bg-black hover:opacity-80 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
          
          <div className="flex items-start gap-4">
            {/* Player Headshot */}
            {(player.headshot?.href || player.athlete?.headshot?.href) && (
              <img 
                src={player.headshot?.href || player.athlete?.headshot?.href}
                alt={player.displayName || player.athlete?.displayName}
                className="w-24 h-24 md:w-32 md:h-32 rounded-lg object-cover"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            
            {/* Player Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-oswald mb-2">
                {player.displayName || player.athlete?.displayName || 'Unknown Player'}
              </h1>
              <div className="space-y-1 font-roboto-condensed">
                <p className="text-lg">
                  #{player.jersey || player.athlete?.jersey || 'N/A'} • {typeof player.position === 'string' ? player.position : (player.position?.abbreviation || player.athlete?.position?.abbreviation || player.athlete?.position?.displayName || 'N/A')}
                </p>
                {(player.birth?.date || player.athlete?.birth?.date) && (
                  <p className="text-sm opacity-90">
                    DOB: {new Date(player.birth?.date || player.athlete?.birth?.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bio Info */}
          <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200">
            <h2 className="text-lg font-bold mb-3 font-oswald">Bio & Career</h2>
            {loading && (
              <p className="text-gray-600 text-sm mb-3">Loading player info...</p>
            )}
            <div className="grid grid-cols-2 gap-4 text-sm">
              {(player.jersey || player.athlete?.jersey) && (
                <div>
                  <p className="text-gray-600 font-semibold">Jersey</p>
                  <p className="text-gray-800">#{player.jersey || player.athlete?.jersey}</p>
                </div>
              )}
              {(player.position || player.athlete?.position) && (
                <div>
                  <p className="text-gray-600 font-semibold">Position</p>
                  <p className="text-gray-800">
                    {typeof player.position === 'string' ? 
                      player.position : 
                      (player.position?.abbreviation || player.athlete?.position?.abbreviation || 'N/A')
                    }
                  </p>
                </div>
              )}
              {(player.height || seasonStats?.displayHeight) && (
                <div>
                  <p className="text-gray-600 font-semibold">Height</p>
                  <p className="text-gray-800">{player.height || seasonStats?.displayHeight}</p>
                </div>
              )}
              {(player.weight || seasonStats?.displayWeight) && (
                <div>
                  <p className="text-gray-600 font-semibold">Weight</p>
                  <p className="text-gray-800">{player.weight || seasonStats?.displayWeight}</p>
                </div>
              )}
              {(player.college || player.athlete?.college?.displayName || seasonStats?.college?.displayName) && (
                <div>
                  <p className="text-gray-600 font-semibold">College</p>
                  <p className="text-gray-800">
                    {typeof player.college === 'string' ? 
                      player.college : 
                      (player.college?.name || player.athlete?.college?.displayName || seasonStats?.college?.displayName)
                    }
                  </p>
                </div>
              )}
              {seasonStats?.age && (
                <div>
                  <p className="text-gray-600 font-semibold">Age</p>
                  <p className="text-gray-800">{seasonStats.age}</p>
                </div>
              )}
              {seasonStats?.birthPlace && (
                <div>
                  <p className="text-gray-600 font-semibold">Hometown</p>
                  <p className="text-gray-800">
                    {seasonStats.birthPlace.city}, {seasonStats.birthPlace.state}
                  </p>
                </div>
              )}
              {seasonStats?.contract?.baseYearCompensation?.value && (
                <div>
                  <p className="text-gray-600 font-semibold">Base Salary</p>
                  <p className="text-gray-800">
                    ${(seasonStats.contract.baseYearCompensation.value / 1000000).toFixed(1)}M
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Game Stats */}
          {gameStats && gameStats.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-bold mb-3 font-oswald">Game Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gameStats.slice(0, 9).map((stat, idx) => (
                  <div key={idx} className="bg-white p-3 rounded">
                    <p className="text-xs text-gray-600 font-semibold mb-1 uppercase">
                      {stat.label || stat.name}
                    </p>
                    <p className="text-2xl font-bold font-roboto-mono" style={{ color: colors.primary }}>
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Season Stats */}
          {loading && (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600 font-roboto-condensed">Loading additional info...</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-center">
            {sport.toLowerCase() === 'nfl' && player.id && (
              <button
                onClick={() => {
                  navigate(`/nfl/player/${player.id}`, {
                    state: { playerData: player }
                  });
                  onClose();
                }}
                style={{ backgroundColor: colors.primary }}
                className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity font-medium"
              >
                View Full Stats
              </button>
            )}
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

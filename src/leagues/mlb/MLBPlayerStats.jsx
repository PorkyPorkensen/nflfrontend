import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const PROFILE_STAT_NAMES = new Set([
  'jersey',
  'position',
  'displayHeight',
  'displayWeight',
  'throws'
]);

function buildInitialProfileStats(player) {
  if (!player) {
    return [];
  }

  return [
    { displayName: 'Jersey', displayValue: player.jersey || 'N/A', name: 'jersey' },
    {
      displayName: 'Position',
      displayValue: typeof player.position === 'string' ? player.position : (player.position?.abbreviation || 'N/A'),
      name: 'position'
    },
    { displayName: 'Height', displayValue: player.displayHeight || 'N/A', name: 'displayHeight' },
    { displayName: 'Weight', displayValue: player.displayWeight || 'N/A', name: 'displayWeight' },
    {
      displayName: 'Throws',
      displayValue: player.throws?.abbreviation || 'N/A',
      name: 'throws'
    }
  ];
}

export default function MLBPlayerStats() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [playerData, setPlayerData] = useState(null);
  const [profileStats, setProfileStats] = useState([]);
  const [statsSplits, setStatsSplits] = useState([]);
  const [editorialNote, setEditorialNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const player = location.state?.playerData || null;

    if (player) {
      setPlayerData(player);
      setProfileStats(buildInitialProfileStats(player));
    } else {
      setPlayerData(null);
      setProfileStats([]);
    }

    if (playerId) {
      fetchPlayerStats(playerId, player);
    }
  }, [location.state, playerId]);

  const fetchPlayerStats = async (id, initialPlayer) => {
    setLoading(true);

    try {
      // Fetch player overview with stats
      const overviewResponse = await fetch(
        `https://site.web.api.espn.com/apis/common/v3/sports/baseball/mlb/athletes/${id}/overview`,
        { headers: { Accept: 'application/json' } }
      );

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();
        
        if (overviewData.rotowire?.headline) {
          setEditorialNote(overviewData.rotowire.headline);
        }

        // Parse batting statistics
        if (overviewData.statistics) {
          const stats = overviewData.statistics;
          const splits = [];

          if (stats.splits && Array.isArray(stats.splits)) {
            stats.splits.forEach(split => {
              const splitData = {
                displayName: split.displayName,
                stats: []
              };

              if (split.stats && Array.isArray(split.stats)) {
                split.stats.forEach((statValue, index) => {
                  const displayName = stats.displayNames?.[index] || stats.labels?.[index] || stats.names?.[index];
                  const name = stats.names?.[index] || `stat_${index}`;

                  if (statValue === null || statValue === undefined || displayName === 'N/A') {
                    return;
                  }

                  splitData.stats.push({
                    displayName,
                    displayValue: statValue,
                    label: stats.labels?.[index],
                    name
                  });
                });
              }

              if (splitData.stats.length > 0) {
                splits.push(splitData);
              }
            });
          }

          setStatsSplits(splits);
        }
      }

      // Fetch bio data
      const bioResponse = await fetch(
        `https://sports.core.api.espn.com/v3/sports/baseball/mlb/athletes/${id}`,
        { headers: { Accept: 'application/json' } }
      );

      if (bioResponse.ok) {
        const bioData = await bioResponse.json();

        const updatedPlayerData = {
          ...(initialPlayer || {}),
          ...bioData,
          displayName: initialPlayer?.displayName || bioData.displayName,
          team: initialPlayer?.team || null,
          headshot: initialPlayer?.headshot || null,
          position: initialPlayer?.position || null
        };

        setPlayerData(updatedPlayerData);
        
        // Rebuild profile stats with the new bio data
        setProfileStats(buildInitialProfileStats(updatedPlayerData));
      }
    } catch (error) {
      console.error('Error fetching MLB player data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading player information...</p>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No MLB player data available. Please navigate from a team roster.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="py-8 px-4">
        <div
          className="max-w-6xl mx-auto text-white rounded-xl overflow-hidden"
          style={{ backgroundImage: 'url(/bbtBG.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="bg-black/50 px-8 py-10">
            <button
              onClick={() => navigate(-1)}
              className="mb-4 text-white hover:opacity-80 transition bg-amber-600 px-4 py-2 rounded-lg"
            >
              ← Back
            </button>

            <div className="flex items-start gap-6">
              {playerData.headshot?.href && (
                <img
                  src={playerData.headshot.href}
                  alt={playerData.displayName}
                  className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-cover border-4 border-white"
                  onError={(event) => {
                    event.target.style.display = 'none';
                  }}
                />
              )}

              <div>
                <h1 className="text-4xl md:text-5xl font-bold font-oswald mb-2">
                  {playerData.displayName || 'MLB Player'}
                </h1>
                <div className="space-y-2 font-roboto-condensed text-lg">
                  <p>
                    #{playerData.jersey || 'N/A'} • {typeof playerData.position === 'string'
                      ? playerData.position
                      : (playerData.position?.abbreviation || 'N/A')}
                  </p>
                  {playerData.team?.displayName && <p>{playerData.team.displayName}</p>}
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="space-y-8">
          {profileStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Player Profile</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {profileStats.map((stat, index) => (
                  <div
                    key={`${stat.name}-${index}`}
                    className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                      {stat.displayName || stat.name}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-amber-600 font-oswald">
                      {stat.displayValue || stat.value || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {statsSplits.length > 0 && (
            <div>
              {statsSplits.map((split, splitIdx) => (
                <div key={`split-${splitIdx}`} className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-gray-800">{split.displayName}</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {split.stats.map((stat, index) => (
                      <div
                        key={`${stat.name}-${index}`}
                        className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                      >
                        <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                          {stat.displayName || stat.label}
                        </p>
                        <p className="text-xl md:text-2xl font-bold text-amber-600 font-oswald">
                          {stat.displayValue || stat.value || 'N/A'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {editorialNote && (
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <div className="bg-amber-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold font-oswald">Player News</h3>
              </div>
              <div className="p-6 space-y-3 text-gray-700 font-roboto-condensed leading-relaxed">
                {editorialNote && <p>{editorialNote}</p>}
                <p>
                  For full game logs and advanced splits, visit{' '}
                  <a
                    href={`https://www.espn.com/mlb/player/_/id/${playerData.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-600 hover:underline"
                  >
                    ESPN Player Profile
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {!loading && profileStats.length === 0 && statsSplits.length === 0 && (
            <div className="bg-amber-50 border-2 border-amber-200 rounded-lg p-8 text-center">
              <p className="text-gray-600 font-roboto-condensed">No statistics available for this player.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

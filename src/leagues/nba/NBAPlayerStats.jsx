import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

const PROFILE_STAT_NAMES = new Set([
  'jersey',
  'position',
  'college',
  'height',
  'weight',
  'age',
  'experience',
  'hometown'
]);

const NBA_STAT_ORDER = [
  'gamesPlayed',
  'avgMinutes',
  'avgPoints',
  'fieldGoalPct',
  'threePointPct',
  'freeThrowPct',
  'avgRebounds',
  'avgAssists',
  'avgSteals',
  'avgBlocks',
  'avgTurnovers',
  'avgFouls'
];

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
    {
      displayName: 'College',
      displayValue: typeof player.college === 'string' ? player.college : (player.college?.name || 'N/A'),
      name: 'college'
    }
  ];
}

function sortSeasonStats(stats) {
  const rank = new Map(NBA_STAT_ORDER.map((name, index) => [name, index]));

  return [...stats].sort((left, right) => {
    const leftRank = rank.has(left.name) ? rank.get(left.name) : Number.MAX_SAFE_INTEGER;
    const rightRank = rank.has(right.name) ? rank.get(right.name) : Number.MAX_SAFE_INTEGER;

    if (leftRank !== rightRank) {
      return leftRank - rightRank;
    }

    return String(left.displayName || left.name).localeCompare(String(right.displayName || right.name));
  });
}

export default function NBAPlayerStats() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [playerData, setPlayerData] = useState(null);
  const [seasonStats, setSeasonStats] = useState([]);
  const [editorialNote, setEditorialNote] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const player = location.state?.playerData || null;

    if (player) {
      setPlayerData(player);
      setSeasonStats(buildInitialProfileStats(player));
    } else {
      setPlayerData(null);
      setSeasonStats([]);
    }

    if (playerId) {
      fetchPlayerStats(playerId, player);
    }
  }, [location.state, playerId]);

  const fetchPlayerStats = async (id, initialPlayer) => {
    setLoading(true);

    try {
      const overviewResponse = await fetch(
        `https://site.web.api.espn.com/apis/common/v3/sports/basketball/nba/athletes/${id}/overview`,
        { headers: { Accept: 'application/json' } }
      );

      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json();

        if (overviewData.rotowire?.headline) {
          setEditorialNote(overviewData.rotowire.headline);
        }

        if (overviewData.statistics?.splits?.length) {
          const stats = overviewData.statistics;
          const regularSeasonSplit =
            stats.splits.find((split) => split.displayName === 'Regular Season') ||
            stats.splits[stats.splits.length - 1];

          if (regularSeasonSplit?.stats?.length) {
            const parsedStats = regularSeasonSplit.stats
              .map((statValue, index) => {
                const name = stats.names?.[index] || `stat_${index}`;
                const displayName = stats.displayNames?.[index] || stats.labels?.[index] || name;

                if (statValue === null || statValue === undefined || displayName === 'N/A') {
                  return null;
                }

                return {
                  displayName,
                  displayValue: statValue,
                  label: stats.labels?.[index],
                  name
                };
              })
              .filter(Boolean);

            if (parsedStats.length > 0) {
              setSeasonStats((previous) => {
                const existingNames = new Set((previous || []).map((stat) => stat.name));
                const uniqueStats = parsedStats.filter((stat) => !existingNames.has(stat.name));
                return [...(previous || []), ...sortSeasonStats(uniqueStats)];
              });
            }
          }
        }
      }

      const bioResponse = await fetch(
        `https://sports.core.api.espn.com/v3/sports/basketball/nba/athletes/${id}`,
        { headers: { Accept: 'application/json' } }
      );

      if (bioResponse.ok) {
        const bioData = await bioResponse.json();

        setPlayerData((previous) => ({
          ...(initialPlayer || {}),
          ...(previous || {}),
          ...bioData,
          displayName: previous?.displayName || initialPlayer?.displayName || bioData.displayName,
          team: previous?.team || initialPlayer?.team || null,
          headshot: previous?.headshot || initialPlayer?.headshot || null,
          position: previous?.position || initialPlayer?.position || null,
          college: previous?.college || initialPlayer?.college || null
        }));

        const bioStats = [];

        if (bioData.displayHeight) {
          bioStats.push({ displayName: 'Height', displayValue: bioData.displayHeight, name: 'height' });
        }
        if (bioData.displayWeight) {
          bioStats.push({ displayName: 'Weight', displayValue: bioData.displayWeight, name: 'weight' });
        }
        if (bioData.age) {
          bioStats.push({ displayName: 'Age', displayValue: bioData.age, name: 'age' });
        }
        if (bioData.experience?.years !== undefined) {
          bioStats.push({
            displayName: 'NBA Experience',
            displayValue: bioData.experience.years > 0 ? `${bioData.experience.years} yrs` : 'Rookie',
            name: 'experience'
          });
        }
        if (bioData.birthPlace?.city) {
          bioStats.push({
            displayName: 'Hometown',
            displayValue: bioData.birthPlace.state
              ? `${bioData.birthPlace.city}, ${bioData.birthPlace.state}`
              : bioData.birthPlace.city,
            name: 'hometown'
          });
        }

        setSeasonStats((previous) => {
          const existingNames = new Set((previous || []).map((stat) => stat.name));
          const uniqueBioStats = bioStats.filter((stat) => !existingNames.has(stat.name));
          return [...(previous || []), ...uniqueBioStats];
        });
      }
    } catch (error) {
      console.error('Error fetching NBA player data:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileStats = seasonStats.filter((stat) => PROFILE_STAT_NAMES.has(stat.name));
  const basketballStats = sortSeasonStats(seasonStats.filter((stat) => !PROFILE_STAT_NAMES.has(stat.name)));

  if (loading && !playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mb-4 mx-auto"></div>
          <p className="text-gray-600">Loading player information...</p>
        </div>
      </div>
    );
  }

  if (!playerData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No NBA player data available. Please navigate from a team roster.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
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
          style={{ backgroundImage: 'url(/bbBg.webp)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
        <div className="bg-black/50 px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white hover:opacity-80 transition bg-orange-500 px-4 py-2 rounded-lg"
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
                {playerData.displayName || 'NBA Player'}
              </h1>
              <div className="space-y-2 font-roboto-condensed text-lg">
                <p>
                  #{playerData.jersey || 'N/A'} • {typeof playerData.position === 'string'
                    ? playerData.position
                    : (playerData.position?.abbreviation || 'N/A')}
                </p>
                {playerData.team?.displayName && <p>{playerData.team.displayName}</p>}
                {playerData.displayHeight && playerData.displayWeight && (
                  <p>{playerData.displayHeight} • {playerData.displayWeight}</p>
                )}
                {playerData.birthPlace?.city && (
                  <p>
                    {playerData.birthPlace.state
                      ? `${playerData.birthPlace.city}, ${playerData.birthPlace.state}`
                      : playerData.birthPlace.city}
                  </p>
                )}
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
                    <p className="text-xl md:text-2xl font-bold text-orange-500 font-oswald">
                      {stat.displayValue || stat.value || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {basketballStats.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-800">Season Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {basketballStats.map((stat, index) => (
                  <div
                    key={`${stat.name}-${index}`}
                    className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                  >
                    <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                      {stat.displayName || stat.name}
                    </p>
                    <p className="text-xl md:text-2xl font-bold text-orange-500 font-oswald">
                      {stat.displayValue || stat.value || 'N/A'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {editorialNote && (
            <div className="bg-white rounded-lg border-2 border-gray-200 overflow-hidden">
              <div className="bg-orange-50 px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-bold font-oswald">Player News</h3>
              </div>
              <div className="p-6 space-y-3 text-gray-700 font-roboto-condensed leading-relaxed">
                {editorialNote && <p>{editorialNote}</p>}
                <p>
                  For full game logs and advanced splits, visit{' '}
                  <a
                    href={`https://www.espn.com/nba/player/_/id/${playerData.id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-orange-600 hover:underline"
                  >
                    ESPN Player Profile
                  </a>
                  .
                </p>
              </div>
            </div>
          )}

          {!loading && profileStats.length === 0 && basketballStats.length === 0 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-8 text-center">
              <p className="text-gray-600">No additional NBA stats available.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
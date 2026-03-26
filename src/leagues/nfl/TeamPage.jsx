import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const STATS_ORDER = ['wins', 'losses', 'ties', 'streak', 'winPercent', 'pointsFor', 'pointsAgainst', 'differential'];

function extractAndOrderStats(statsArray) {
  const stats = [];
  STATS_ORDER.forEach(statName => {
    const stat = statsArray.find(s => s.name === statName);
    if (stat) {
      stats.push({
        displayName: stat.displayName,
        displayValue: stat.value,
        name: stat.name
      });
    }
  });
  return stats;
}

export default function TeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [teamData, setTeamData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [standingStats, setStandingStats] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (teamId) {
      fetchTeamData(teamId);
    }
  }, [teamId]);

  const fetchTeamData = async (id) => {
    setLoading(true);
    
    try {
      // Fetch team details
      const teamResponse = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (teamResponse.ok) {
        const response = await teamResponse.json();
        const data = response.team || response; // Extract team object if nested
        console.log('✓ Team data loaded:', data.displayName || data.name, data);
        
        // Extract record from items array if present
        let record = '';
        if (data.record?.items && Array.isArray(data.record.items)) {
          const totalRecord = data.record.items.find(r => r.type === 'total') || data.record.items[0];
          record = totalRecord?.summary || '';
        } else if (typeof data.record === 'string') {
          record = data.record;
        }
        
        setTeamData({
          ...data,
          displayName: data.displayName || data.name,
          record: record,
          logo: data.logos?.[0]?.href || data.logo
        });
        
        // Process team stats if available (look for statistics property)
        if (data.statistics && Array.isArray(data.statistics)) {
          const stats = [];
          data.statistics.forEach(stat => {
            stats.push({
              displayName: stat.displayName || stat.name,
              displayValue: stat.displayValue || stat.value,
              name: stat.name
            });
          });
          setTeamStats(stats);
        }
      }
      
      // Fetch standings to get allStats (wins, losses, etc.)
      const standingsResponse = await fetch(
        `https://site.api.espn.com/apis/v2/sports/football/nfl/standings?season=2025`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (standingsResponse.ok) {
        const standingsData = await standingsResponse.json();
        const conferencesData = standingsData.children;
        
        // Find this team in the standings
        conferencesData.forEach(conf => {
          conf.standings.entries.forEach(entry => {
            if (entry.team.id === id) {
              console.log('✓ Found team in standings:', entry.team.displayName);
              
              
              // Extract standing stats
              if (entry.stats && Array.isArray(entry.stats)) {
                const stats = extractAndOrderStats(entry.stats);
                console.log('✓ Standing stats extracted from standings:', stats);
                setStandingStats(stats);
              }
            }
          });
        });
      }
      
      // Fetch roster from Site API
      const rosterResponse = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${id}/roster`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (rosterResponse.ok) {
        const rosterResponse_data = await rosterResponse.json();
        console.log('✓ Roster data loaded:', rosterResponse_data);
        
        // Handle nested roster structure (grouped by position)
        let players = [];
        const rosterData = rosterResponse_data.athletes || rosterResponse_data; // Extract athletes if nested
        
        if (Array.isArray(rosterData)) {
          // If it's an array, iterate through position groups
          rosterData.forEach(positionGroup => {
            if (positionGroup.items && Array.isArray(positionGroup.items)) {
              players.push(...positionGroup.items);
            } else if (Array.isArray(positionGroup)) {
              // If the position group is itself an array, flatten it
              players.push(...positionGroup);
            }
          });
        }
        
        console.log('✓ Roster loaded:', players.length, 'players');
        setRoster(players);
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (athlete) => {
    const playerData = {
      id: athlete.id,
      displayName: athlete.displayName,
      jersey: athlete.jersey,
      position: athlete.position,
      headshot: athlete.headshot,
      college: athlete.college,
      team: teamData,
      ...athlete
    };
    
    navigate(`/nfl/player/${athlete.id}`, { state: { playerData } });
  };

  if (!teamData && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No team data available. Please navigate from a game.</p>
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
      <div className="py-8 px-4">
        <div
          className="max-w-6xl mx-auto text-white rounded-xl overflow-hidden"
          style={{ backgroundImage: 'url(/fbBg.jpg)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
        <div className="bg-black/50 px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white bg-blue-600 hover:opacity-80 transition"
          >
            ← Back
          </button>
          
          <div className="flex items-start gap-6">
            {/* Team Logo */}
            {teamData?.logo && (
              <img
                src={teamData.logo}
                alt={teamData.displayName}
                className="w-32 h-32 md:w-40 md:h-40 rounded-lg object-contain p-4"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            
            {/* Team Info */}
            <div>
              <h1 className="text-4xl md:text-5xl font-bold font-oswald mb-2">
                {teamData?.displayName || teamData?.name || 'Team'}
              </h1>
              <div className="space-y-2 font-roboto-condensed text-lg">
                {teamData?.record && (
                  <p className="font-semibold">{teamData.record}</p>
                )}
                {teamData?.location && (
                  <p>{teamData.location}</p>
                )}
                {typeof teamData?.conference === 'string' ? (
                  <p>{teamData.conference}</p>
                ) : (
                  teamData?.conference?.name && <p>{teamData.conference.name}</p>
                )}
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Team Content */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4 mx-auto"></div>
              <p className="text-gray-600">Loading team information...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-12">
            {/* Standing Stats */}
            {standingStats.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-oswald mb-6 text-gray-800">Team Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {standingStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm "
                    >
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                        {stat.displayName}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-blue-600 font-oswald">
                        {stat.displayValue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season Stats */}
            {teamStats.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-oswald mb-6 text-gray-800">Season Stats</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {teamStats.map((stat, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm hover:shadow-md transition"
                    >
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                        {stat.displayName}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-blue-600 font-oswald">
                        {stat.displayValue}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Roster */}
            {roster.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold font-oswald mb-6 text-gray-800">Roster</h2>
                <div 
                  className="grid gap-4"
                  style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(275px, 1fr))' }}
                >
                  {roster
                    .sort((a, b) => {
                      const jerseyA = parseInt(a.jersey) || 999;
                      const jerseyB = parseInt(b.jersey) || 999;
                      return jerseyA - jerseyB;
                    })
                    .map((player, idx) => (
                    <div
                      key={player.id || idx}
                      onClick={() => handlePlayerClick(player)}
                      className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg hover:border-blue-400 transition cursor-pointer"
                    >
                      {/* Player Headshot - Circular */}
                      {player.headshot?.href ? (
                        <img
                          src={player.headshot.href}
                          alt={player.displayName}
                          className="w-20 h-20 rounded-full object-cover mb-3 border-2 border-gray-300"
                          onError={(e) => { e.target.style.display = 'none'; }}
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-300 mb-3 border-2 border-gray-300" />
                      )}
                      
                      {/* Player Info */}
                      <div className="text-center w-full">
                        <h3 className="font-bold text-gray-800 line-clamp-2 mb-2">
                          {player.displayName}
                        </h3>
                        <div className="text-sm text-gray-600 font-roboto-condensed space-y-1">
                          <p className="font-semibold">
                            #{player.jersey} • {typeof player.position === 'string' ? player.position : player.position?.abbreviation}
                          </p>
                          {typeof player.college === 'string' ? (
                            <p className="truncate">{player.college}</p>
                          ) : (
                            player.college?.name && <p className="truncate">{player.college.name}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

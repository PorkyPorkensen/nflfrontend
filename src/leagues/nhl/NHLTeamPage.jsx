import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const STATS_ORDER = ['wins', 'losses', 'overtimeLosses', 'winPercent', 'points', 'pointDifferential', 'goalsFor', 'goalsAgainst'];

function extractAndOrderStats(statsArray) {
  const stats = [];
  STATS_ORDER.forEach(statName => {
    const stat = statsArray.find(s => s.name === statName);
    if (stat) {
      let displayValue = stat.value;
      
      // Format decimal values to 3 decimal places
      if (statName === 'winPercent' || statName === 'pointDifferential') {
        displayValue = typeof displayValue === 'number' ? displayValue.toFixed(3) : displayValue;
      }
      
      stats.push({
        displayName: stat.displayName,
        displayValue: displayValue,
        name: stat.name
      });
    }
  });
  return stats;
}

export default function NHLTeamPage() {
  const { teamId } = useParams();
  const navigate = useNavigate();
  
  const [teamData, setTeamData] = useState(null);
  const [roster, setRoster] = useState([]);
  const [standingStats, setStandingStats] = useState([]);
  const [loading, setLoading] = useState(false);

  // NHL team to division mapping
  const teamDivisionMap = {
    '5': 'Atlantic',   // Detroit Red Wings
    '20': 'Atlantic',  // Tampa Bay Lightning
    '21': 'Atlantic',  // Toronto Maple Leafs
    '26': 'Atlantic',  // Florida Panthers
    '10': 'Atlantic',  // Montreal Canadiens
    '1': 'Atlantic',   // Boston Bruins
    '2': 'Atlantic',   // Buffalo Sabres
    '14': 'Atlantic',  // Ottawa Senators
    '16': 'Metropolitan', // Pittsburgh Penguins
    '29': 'Metropolitan', // Columbus Blue Jackets
    '23': 'Metropolitan', // Washington Capitals
    '11': 'Metropolitan', // New Jersey Devils
    '12': 'Metropolitan', // New York Islanders
    '13': 'Metropolitan', // New York Rangers
    '7': 'Metropolitan',  // Carolina Hurricanes
    '15': 'Metropolitan', // Philadelphia Flyers
    '4': 'Central',   // Chicago Blackhawks
    '17': 'Central',  // Colorado Avalanche
    '9': 'Central',   // Dallas Stars
    '19': 'Central',  // St. Louis Blues
    '129764': 'Central', // Utah Mammoth
    '30': 'Central',  // Minnesota Wild
    '27': 'Central',  // Nashville Predators
    '28': 'Central',  // Winnipeg Jets
    '18': 'Pacific',  // San Jose Sharks
    '124292': 'Pacific', // Seattle Kraken
    '6': 'Pacific',   // Edmonton Oilers
    '8': 'Pacific',   // Los Angeles Kings
    '22': 'Pacific',  // Vancouver Canucks
    '37': 'Pacific',  // Vegas Golden Knights
    '25': 'Pacific',  // Anaheim Ducks
    '3': 'Pacific',   // Calgary Flames
  };

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
        `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${id}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (teamResponse.ok) {
        const response = await teamResponse.json();
        const data = response.team || response;
        
        // Extract record from items array if present
        let record = '';
        if (data.record?.items && Array.isArray(data.record.items)) {
          const totalRecord = data.record.items.find(r => r.type === 'total') || data.record.items[0];
          record = totalRecord?.summary || '';
        } else if (typeof data.record === 'string') {
          record = data.record;
        }
        
        const division = teamDivisionMap[id] || 'N/A';
        const conference = ['Atlantic', 'Metropolitan'].includes(division) ? 'Eastern Conference' : 'Western Conference';
        
        setTeamData({
          ...data,
          displayName: data.displayName || data.name,
          record: record,
          logo: data.logos?.[0]?.href || data.logo,
          division: division,
          conference: conference
        });
      }
      
      // Fetch standings to get standing stats (wins, losses, etc.)
      const standingsResponse = await fetch(
        `https://site.web.api.espn.com/apis/v2/sports/hockey/nhl/standings?season=${new Date().getFullYear()}`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (standingsResponse.ok) {
        const standingsData = await standingsResponse.json();
        const conferencesData = standingsData.children;
        
        // Find this team in the standings
        conferencesData.forEach(conf => {
          conf.standings.entries.forEach(entry => {
            if (entry.team.id === id) {
              // Extract standing stats
              if (entry.stats && Array.isArray(entry.stats)) {
                const stats = extractAndOrderStats(entry.stats);
                setStandingStats(stats);
              }
            }
          });
        });
      }
      
      // Fetch roster
      const rosterResponse = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/teams/${id}/roster`,
        { headers: { 'Accept': 'application/json' } }
      );
      
      if (rosterResponse.ok) {
        const rosterData = await rosterResponse.json();
        
        // Handle grouped roster structure (by position)
        let players = [];
        
        // The API returns rosterData.athletes as an array of position groups
        if (rosterData.athletes && Array.isArray(rosterData.athletes)) {
          rosterData.athletes.forEach((positionGroup) => {
            if (positionGroup.items && Array.isArray(positionGroup.items)) {
              players.push(...positionGroup.items);
            }
          });
        }
        
        setRoster(players);
      }
    } catch (err) {
      console.error('Error fetching NHL team data:', err);
    } finally {
      // Log team info and stats (excluding roster)
      console.log('=== NHL Team Page Data ===');
      if (teamData) {
        console.log('Team Info:', {
          name: teamData.displayName,
          abbreviation: teamData.abbreviation,
          location: teamData.location,
          division: teamData.division,
          conference: teamData.conference,
          record: teamData.record,
          logo: teamData.logo,
          venue: teamData.venue?.displayName,
          founded: teamData.founded,
          officialLogoUrl: teamData.logos?.[0]?.href,
          colors: teamData.color
        });
      }
      if (standingStats.length > 0) {
        console.log('Standing Stats:', standingStats);
      }
      setLoading(false);
    }
  };

  const handlePlayerClick = (athlete) => {
    const routePath = `/nhl/player/${athlete.id}`;
    const playerData = {
      id: athlete.id,
      displayName: athlete.displayName,
      jersey: athlete.jersey,
      position: athlete.position,
      headshot: athlete.headshot,
      team: teamData,
      ...athlete
    };
    
    navigate(routePath, { state: { playerData } });
  };

  if (!teamData && !loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No team data available. Please navigate from a game.</p>
          <button
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800"
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
          style={{ backgroundImage: 'url(/hBg.png)', backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
        <div className="bg-gray-900/60 px-8 py-10">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-white bg-gray-700 hover:opacity-80 transition"
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
                {teamData?.division && (
                  <p>{teamData.division} • {teamData.conference}</p>
                )}
                {teamData?.location && (
                  <p>{teamData.location}</p>
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
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-700 mb-4 mx-auto"></div>
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
                      className="bg-white rounded-lg p-4 border-2 border-gray-200 shadow-sm"
                    >
                      <p className="text-xs text-gray-600 font-semibold uppercase mb-2">
                        {stat.displayName}
                      </p>
                      <p className="text-xl md:text-2xl font-bold text-gray-700 font-oswald">
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
                      className="flex flex-col items-center p-4 bg-white rounded-lg border-2 border-gray-200 hover:shadow-lg hover:border-gray-700 transition cursor-pointer"
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

import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import MLBGamesHeader from './MLBGamesHeader';

export default function MLBStandings() {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [season, setSeason] = useState(2026);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetch(`https://site.api.espn.com/apis/v2/sports/baseball/mlb/standings?season=${season}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        console.log('API Response:', data);
        const conferencesData = data?.children || [];
        
        if (!conferencesData || conferencesData.length === 0) {
          console.warn('No conference data found in response');
          setAllTeams([]);
          setLoading(false);
          return;
        }
        
        // Extract all teams with their full data
        console.log('Sample conference object keys:', conferencesData[0] ? Object.keys(conferencesData[0]) : 'none');
        console.log('Sample conference object:', conferencesData[0]);
        console.log('Sample team entry:', conferencesData[0]?.standings?.entries?.[0]);
        
        const teams = conferencesData.flatMap(conf => {
          const entries = conf.standings?.entries || [];
          console.log(`Processing ${conf.name}: ${entries.length} teams`);
          
          return entries.map(entry => {
            // Find wins, losses from stats
            const wins = entry.stats?.find(stat => stat.name === 'wins')?.value || 0;
            const losses = entry.stats?.find(stat => stat.name === 'losses')?.value || 0;
            const winPercent = entry.stats?.find(stat => stat.name === 'winPercent')?.value || 0;
            const gamesBehind = entry.stats?.find(stat => stat.name === 'gamesBehind')?.value || 0;
            
            return {
              id: entry.team?.id,
              name: entry.team?.displayName || entry.team?.name,
              location: entry.team?.location,
              abbreviation: entry.team?.abbreviation,
              logo: entry.team?.logos?.[0]?.href,
              conference: conf.name,
              conferenceAbbr: conf.abbreviation,
              division: entry.group?.name || 'Overall',
              wins,
              losses,
              record: `${wins}-${losses}`,
              winPercent,
              gamesBehind: Number(gamesBehind).toFixed(1),
              allStats: entry.stats,
              teamData: entry.team
            };
          });
        });

        console.log('Total teams extracted:', teams.length);
        setConferences(conferencesData);
        
        // Calculate playoff positions
        const alTeams = teams.filter(t => t.conference === 'American League');
        const nlTeams = teams.filter(t => t.conference === 'National League');
        
        // Sort by wins to get conference rankings
        const sortByWins = (a, b) => {
          const aWins = parseInt(a.wins);
          const bWins = parseInt(b.wins);
          return bWins - aWins;
        };
        
        alTeams.sort(sortByWins);
        nlTeams.sort(sortByWins);
        
        // Mark playoff positions
        alTeams.forEach((team, idx) => {
          if (idx < 2) {
            team.playoffSeed = idx + 1;
          } else if (idx < 6) {
            team.playoffStatus = 'Wild Card';
          }
        });
        
        nlTeams.forEach((team, idx) => {
          if (idx < 2) {
            team.playoffSeed = idx + 1;
          } else if (idx < 6) {
            team.playoffStatus = 'Wild Card';
          }
        });
        
        setAllTeams([...alTeams, ...nlTeams]);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching MLB standings:', err);
        setError(err.message);
        setLoading(false);
      });
  }, [season]);

  const handleTeamClick = (team) => {
    navigate(`/mlb/team/${team.id}`);
  };

  // Get playoff and wild card teams
  const getPlayoffInfo = () => {
    const eastern = allTeams.filter(t => t.conference === 'American League').sort((a, b) => Number(a.gamesBehind) - Number(b.gamesBehind));
    const western = allTeams.filter(t => t.conference === 'National League').sort((a, b) => Number(a.gamesBehind) - Number(b.gamesBehind));
    
    return {
      playoffTeams: [...eastern.slice(0, 2), ...western.slice(0, 2)],
      wildCardTeams: [...eastern.slice(2, 6), ...western.slice(2, 6)]
    };
  };

  const { playoffTeams, wildCardTeams } = getPlayoffInfo();

  const getPlayoffBadge = (team) => {
    if (team.playoffSeed === 1) {
      return { label: '#1 Seed', color: 'bg-amber-500 text-white' };
    } else if (team.playoffSeed === 2) {
      return { label: '#2 Seed', color: 'bg-amber-600 text-white' };
    } else if (team.playoffStatus === 'Wild Card') {
      return { label: 'Wild Card', color: 'bg-amber-200 text-amber-900' };
    }
    return null;
  };


  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-roboto-condensed">Loading standings...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 font-roboto-condensed mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!allTeams || allTeams.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p className="text-gray-600 font-roboto-condensed">No standings data available</p>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      {/* MLB Games Header */}
      <div className="mb-8">
        <MLBGamesHeader />
      </div>

      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-oswald">MLB Standings</h1>
        
        {/* Season Selection */}
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mb-6">
          <label className="font-semibold text-gray-700 font-roboto-condensed">Season:</label>
          <select 
            value={season} 
            onChange={(e) => setSeason(Number(e.target.value))}
            className="w-44 px-4 py-2 border border-amber-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
            <option value={2024}>2024</option>
            <option value={2023}>2023</option>
            <option value={2022}>2022</option>
          </select>
        </div>
      </div>

      {/* Main Content Grid - Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Standings */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-oswald">Conference Standings</h2>
          </div>
          
          {/* Column Headers */}
          <div className="flex items-center px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-200">
            <div className="min-w-8">#</div>
            <div className="w-10 mr-4"></div>
            <div className="flex-1">Team</div>
            <div className="text-center min-w-16">Record</div>
            <div className="text-center min-w-16 ml-4">GB</div>
          </div>
          
          <div className="space-y-3 mt-3">
            {['American League', 'National League'].map(confName => {
              const confTeams = allTeams
                .filter(t => t.conference === confName)
                .sort((a, b) => Number(a.gamesBehind) - Number(b.gamesBehind));
              return (
                <div key={confName}>
                  <h3 className="text-lg font-bold text-gray-800 mb-3 pl-4 font-oswald">{confName}</h3>
                  {confTeams.map((team, index) => {
                    const isPlayoff = playoffTeams.some(t => t.id === team.id);
                    const isWildCard = wildCardTeams.some(t => t.id === team.id);
                    const badge = getPlayoffBadge(team);
                    
                    return (
                      <div 
                        key={team.id} 
                        onClick={() => handleTeamClick(team)}
                        className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer mb-2"
                      >
                        {/* Ranking */}
                        <div className={`min-w-8 font-bold text-lg font-roboto-mono ${
                          isPlayoff ? 'text-amber-600' : isWildCard ? 'text-amber-500' : 'text-gray-600'
                        }`}>
                          {index + 1}
                        </div>
                        
                        {/* Team Logo */}
                        {team.logo && (
                          <img 
                            src={team.logo} 
                            alt={`${team.name} logo`}
                            className="w-10 h-10 mr-4 rounded-full"
                          />
                        )}
                        
                        {/* Team Info */}
                        <div className="flex-1 min-w-0 mr-2">
                          <div className="flex items-center flex-wrap">
                            <div className="font-bold text-sm md:text-lg text-gray-800 truncate font-oswald">
                              {team.name}
                            </div>
                          </div>
                          <div className="flex flex-col md:flex-row md:items-center md:gap-3">
                            <div className="text-xs md:text-sm text-gray-500 font-roboto-condensed">
                              {team.abbreviation}
                            </div>
                            {badge && (
                              <span className={`px-2 py-1 text-xs font-bold rounded-full mt-1 md:mt-0 self-start ${badge.color}`}>
                                {badge.label}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        {/* Record */}
                        <div className="text-center min-w-12 md:min-w-16 flex-shrink-0">
                          <div className="font-bold text-sm md:text-lg text-gray-800 font-roboto-mono">
                            {team.record}
                          </div>
                          <div className="text-xs md:text-sm text-gray-500 font-roboto-mono">
                            {(team.winPercent * 100).toFixed(1)}%
                          </div>
                        </div>
                        
                        {/* Games Behind */}
                        <div className="text-center min-w-12 md:min-w-16 ml-2 md:ml-4 font-bold text-sm md:text-base flex-shrink-0 font-roboto-mono text-gray-700">
                          {team.gamesBehind}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>

        {/* Conference Standings - Takes 1 column on desktop */}
        <div className="lg:col-span-1">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center font-oswald">Conference Standings</h2>
          <div className="space-y-6">
            {['American League', 'National League'].map(confName => {
              const confTeams = allTeams
                .filter(team => team.conference === confName)
                .sort((a, b) => Number(a.gamesBehind) - Number(b.gamesBehind));
                
              return (
                <div key={confName} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                  <h3 className={`text-lg font-bold text-white p-4 font-oswald border-b-2 border-stone-500 ${
                    confName === 'American League' ? 'bg-blue-800' : 'bg-orange-600'
                  }`}>
                    {confName.split(' ')[0]} Conf.
                  </h3>
                  
                  <div className="p-3 space-y-1">
                    {confTeams.map((team, index) => {
                      const isPlayoff = index < 2;
                      const isWildCard = index >= 2 && index < 6;
                      return (
                        <div 
                          key={team.id} 
                          className="flex items-center justify-between p-2 hover:bg-gray-50 rounded transition-colors cursor-pointer"
                          onClick={() => handleTeamClick(team)}
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            {team.logo && (
                              <img 
                                src={team.logo} 
                                alt={team.abbreviation}
                                className="w-6 h-6 mr-2 rounded-full flex-shrink-0"
                              />
                            )}
                            <span className={`text-xs font-bold font-oswald truncate ${
                              isPlayoff ? 'text-amber-600' : isWildCard ? 'text-amber-500' : 'text-gray-800'
                            }`}>
                              {team.abbreviation}
                            </span>
                          </div>
                          <span className="text-xs font-roboto-mono text-gray-700 ml-2 flex-shrink-0">
                            {team.record}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Back to MLB */}
      <div className="text-center mt-12">
        <Link to="/mlb" className="inline-flex items-center px-6 py-3 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors text-lg font-semibold">
          ← Back to MLB
        </Link>
      </div>
    </div>
  );
}

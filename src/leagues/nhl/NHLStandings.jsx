import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NHLStandings() {
  const navigate = useNavigate();
  const [conferences, setConferences] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [sortBy, setSortBy] = useState('division'); // 'wins', 'conference', 'division'
  const [season, setSeason] = useState(2026);
  const [showAllTeams, setShowAllTeams] = useState(true);
  // Hardcoded NHL team to division mapping (2024-25 season)
  const teamDivisionMap = {
    // Eastern Conference - Atlantic Division
    '5': 'Atlantic',   // Detroit Red Wings
    '20': 'Atlantic',  // Tampa Bay Lightning
    '21': 'Atlantic',  // Toronto Maple Leafs
    '26': 'Atlantic',  // Florida Panthers
    '10': 'Atlantic',  // Montreal Canadiens
    '1': 'Atlantic',   // Boston Bruins
    '2': 'Atlantic',   // Buffalo Sabres
    '14': 'Atlantic',  // Ottawa Senators
    // Eastern Conference - Metropolitan Division
    '16': 'Metropolitan', // Pittsburgh Penguins
    '29': 'Metropolitan', // Columbus Blue Jackets
    '23': 'Metropolitan', // Washington Capitals
    '11': 'Metropolitan', // New Jersey Devils
    '12': 'Metropolitan', // New York Islanders
    '13': 'Metropolitan', // New York Rangers
    '7': 'Metropolitan',  // Carolina Hurricanes
    '15': 'Metropolitan', // Philadelphia Flyers
    // Western Conference - Central Division
    '4': 'Central',   // Chicago Blackhawks
    '17': 'Central',  // Colorado Avalanche
    '9': 'Central',   // Dallas Stars
    '19': 'Central',  // St. Louis Blues
    '129764': 'Central', // Utah Mammoth
    '30': 'Central',  // Minnesota Wild
    '27': 'Central',  // Nashville Predators
    '28': 'Central',  // Winnipeg Jets
    // Western Conference - Pacific Division
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
    fetch(`https://site.web.api.espn.com/apis/v2/sports/hockey/nhl/standings?season=${season}`)
      .then(res => res.json())
      .then(data => {
        const conferencesData = data.children;
        console.log('Fetched NHL standings data:', conferencesData);
        
        // Extract all teams with their full data
        const teams = conferencesData.flatMap(conf =>
          conf.standings.entries.map(entry => {
            // Log each team with their ID and name
            console.log(`Team: ${entry.team.displayName} | ID: ${entry.team.id}`);
            
            // Find wins, losses, OT losses from stats
            const wins = entry.stats.find(stat => stat.name === 'wins')?.value || 0;
            const losses = entry.stats.find(stat => stat.name === 'losses')?.value || 0;
            const overtimeLosses = entry.stats.find(stat => stat.name === 'overtimeLosses')?.value || 0;
            const winPercent = entry.stats.find(stat => stat.name === 'winPercent')?.value || 0;
            const playoffSeed = entry.stats.find(stat => stat.name === 'playoffSeed')?.value || 0;
            const differential = entry.stats.find(stat => stat.name === 'pointDifferential')?.value || 0;
            const points = entry.stats.find(stat => stat.name === 'points')?.value || 0;
            
            // Get division from hardcoded mapping
            const division = teamDivisionMap[entry.team.id] || 'N/A';
            
            return {
              id: entry.team.id,
              name: entry.team.displayName,
              location: entry.team.location,
              abbreviation: entry.team.abbreviation,
              logo: entry.team.logos[0]?.href,
              conference: conf.name,
              conferenceAbbr: conf.abbreviation,
              division: division,
              wins,
              losses,
              overtimeLosses,
              record: `${wins}-${losses}-${overtimeLosses}`,
              winPercent,
              playoffSeed,
              points,
              differential: differential > 0 ? `+${differential}` : `${differential}`,
              allStats: entry.stats,
              teamData: entry.team
            };
          })
        );

        setConferences(conferencesData);
        setAllTeams(teams);
      });
  }, [season]);

  const getDivisionOrder = (division) => {
    const order = {
      'Atlantic': 1,
      'Metropolitan': 2,
      'Central': 3,
      'Pacific': 4
    };
    return order[division] || 99;
  };

  const getConferenceOrder = (conference) => {
    return conference === 'Eastern Conference' ? 0 : 1;
  };

  const getSortedTeams = () => {
    const sorted = [...allTeams];
    
    switch (sortBy) {
      case 'wins':
        return sorted.sort((a, b) => {
          // First sort by points (descending)
          if (b.points !== a.points) return b.points - a.points;
          // Then by wins (descending)
          if (b.wins !== a.wins) return b.wins - a.wins;
          // Then by win percentage (descending)
          if (b.winPercent !== a.winPercent) return b.winPercent - a.winPercent;
          // Then by point differential (descending)
          return parseInt(b.differential) - parseInt(a.differential);
        });
      case 'conference':
        return sorted.sort((a, b) => {
          // First sort by conference
          if (a.conference !== b.conference) return a.conference.localeCompare(b.conference);
          // Then by points (descending)
          return b.points - a.points;
        });
      case 'division':
        return sorted.sort((a, b) => {
          // Sort by conference first (Eastern before Western)
          const confDiff = getConferenceOrder(a.conference) - getConferenceOrder(b.conference);
          if (confDiff !== 0) return confDiff;
          
          // Then by division order (Atlantic, Metropolitan, Central, Pacific)
          const divDiff = getDivisionOrder(a.division) - getDivisionOrder(b.division);
          if (divDiff !== 0) return divDiff;
          
          // Then by points within division (descending)
          return b.points - a.points;
        });
      default:
        return sorted;
    }
  };

  const getPlayoffQualificationStatus = (team) => {
    // Use the official playoffSeed from ESPN
    if (team.playoffSeed === 0 || !team.playoffSeed) {
      return { status: 'OUT', badge: 'bg-red-100 text-red-800', playoff: false };
    }
    
    // Seeds 1-6 are the top seeds in each conference
    if (team.playoffSeed <= 6) {
      return { status: `#${team.playoffSeed}`, badge: 'bg-green-100 text-green-800', playoff: true };
    }
    
    // Seeds 7-8 are the wild card spots in each conference
    if (team.playoffSeed === 7) {
      return { status: 'WC1', badge: 'bg-yellow-100 text-yellow-800', playoff: true };
    }
    
    if (team.playoffSeed === 8) {
      return { status: 'WC2', badge: 'bg-yellow-100 text-yellow-800', playoff: true };
    }
    
    // Not qualified
    return { status: 'OUT', badge: 'bg-red-100 text-red-800', playoff: false };
  };

  const sortedTeams = getSortedTeams();

  const handleTeamClick = (team) => {
    const routePath = `/nhl/team/${team.id}`;
    console.log('NHL Standings - Navigating to team:', routePath, 'Team data:', team);
    navigate(routePath);
  };

  const getDivisionsByConference = () => {
    if (sortBy !== 'division') return {};
    
    const divisions = {};
    sortedTeams.forEach(team => {
      if (!divisions[team.division]) {
        divisions[team.division] = [];
      }
      divisions[team.division].push(team);
    });
    return divisions;
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-4 font-oswald">NHL Standings</h1>
        
        {/* Global Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 mb-6">
          {/* Sort Controls */}
          <div className="flex flex-col items-center sm:flex-row sm:items-center w-full sm:w-auto justify-center sm:justify-start">
            <label className="mb-2 sm:mb-0 sm:mr-3 font-semibold text-gray-700 font-roboto-condensed">Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
              className="w-44 sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 max-w-xs"
            >
              <option value="division">By Division</option>
              <option value="conference">By Conference</option>
              <option value="wins">Power Rankings</option>
            </select>
          </div>
          
          {/* Year Selection */}
          <div className="flex flex-col sm:flex-row items-center">
            <label className="mb-2 sm:mb-0 sm:mr-3 font-semibold text-gray-700 font-roboto-condensed">Year:</label>
            <select 
              value={season} 
              onChange={(e) => setSeason(Number(e.target.value))}
              className="w-44 sm:w-auto px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
            >
              <option value={2026}>2025-26</option>
              <option value={2025}>2024-25</option>
              <option value={2024}>2023-24</option>
              <option value={2023}>2022-23</option>
              <option value={2022}>2021-22</option>
              <option value={2021}>2020-21</option>
              <option value={2020}>2019-20</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Grid - Standings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Overall Standings - Takes 2 columns on desktop */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800 font-oswald">
              {sortBy === 'wins' ? 'Power Rankings' : 
               sortBy === 'conference' ? 'Conference Standings' : 
               'Division Standings'}
            </h2>
          </div>
          
          {/* Column Headers */}
          <div className="flex items-center px-4 py-2 text-sm font-semibold text-gray-500 border-b border-gray-200">
            <div className="min-w-8">#</div>
            <div className="w-10 mr-4"></div> {/* Logo space */}
            <div className="flex-1">Team</div>
            <div className="text-center min-w-16">Record</div>
            <div className="text-center min-w-12">PTS</div>
            <div className="text-center min-w-16 ml-4">GD</div>
          </div>
          
          <div className="space-y-3 mt-3">
            {sortBy === 'division' ? (
              // Group by division with headers
              Object.entries(getDivisionsByConference()).map(([division, teams]) => (
                <div key={division} className="mb-6">
                  <h3 className="text-lg font-bold text-gray-700 mb-3 font-oswald border-b-2 border-gray-300 pb-2">
                    {division}
                  </h3>
                  <div className="space-y-3">
                    {teams.map((team, divIndex) => (
                      <div 
                        key={team.id} 
                        onClick={() => handleTeamClick(team)}
                        className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
                      >
                        {/* Ranking */}
                        <div className={`min-w-8 font-bold text-lg font-roboto-mono ${
                          divIndex < 3 ? 'text-green-600' : 
                          divIndex < 6 ? 'text-yellow-600' : 
                          'text-red-600'
                        }`}>
                          {divIndex + 1}
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
                              {team.conferenceAbbr} • {team.division}
                            </div>
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

                        {/* Points */}
                        <div className="text-center min-w-12 ml-2 md:ml-4 font-bold text-sm md:text-base flex-shrink-0 font-roboto-mono">
                          {team.points}
                        </div>
                        
                        {/* Goal Differential */}
                        <div className={`text-center min-w-12 md:min-w-16 ml-2 md:ml-4 font-bold text-sm md:text-base flex-shrink-0 font-roboto-mono ${
                          parseInt(team.differential) > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {team.differential}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              // Original list display for other sort modes
              (showAllTeams ? sortedTeams : sortedTeams.slice(0, 2)).map((team, index) => (
              <div 
                key={team.id} 
                onClick={() => handleTeamClick(team)}
                className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                {/* Ranking */}
                <div className={(() => {
                  let rankForColor;
                  if (sortBy === 'division') {
                    const divisionTeams = sortedTeams.filter(t => t.division === team.division);
                    rankForColor = divisionTeams.findIndex(t => t.id === team.id);
                  } else if (sortBy === 'conference') {
                    const conferenceTeams = sortedTeams.filter(t => t.conference === team.conference);
                    rankForColor = conferenceTeams.findIndex(t => t.id === team.id);
                  } else {
                    rankForColor = showAllTeams ? index : sortedTeams.indexOf(team);
                  }
                  
                  let colorClass = 'text-gray-800';
                  if (sortBy === 'wins') {
                    colorClass = 'text-gray-800';
                  } else if (sortBy === 'conference') {
                    if (rankForColor < 6) colorClass = 'text-green-600';
                    else if (rankForColor < 8) colorClass = 'text-yellow-600';
                    else colorClass = 'text-red-600';
                  } else {
                    if (rankForColor < 3) colorClass = 'text-green-600';
                    else if (rankForColor < 5) colorClass = 'text-yellow-600';
                    else colorClass = 'text-red-600';
                  }
                  
                  return `min-w-8 font-bold text-lg font-roboto-mono ${colorClass}`;
                })()}>
                  {(() => {
                    if (sortBy === 'division') {
                      const divisionTeams = sortedTeams.filter(t => t.division === team.division);
                      const divisionRank = divisionTeams.findIndex(t => t.id === team.id) + 1;
                      return divisionRank;
                    } else if (sortBy === 'conference') {
                      const conferenceTeams = sortedTeams.filter(t => t.conference === team.conference);
                      const conferenceRank = conferenceTeams.findIndex(t => t.id === team.id) + 1;
                      return conferenceRank;
                    } else {
                      return showAllTeams ? index + 1 : sortedTeams.indexOf(team) + 1;
                    }
                  })()}
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
                      {sortBy !== 'conference' && `${team.conferenceAbbr} • `}{team.division}
                    </div>
                    {sortBy === 'conference' && (
                      <span className={`px-2 py-1 text-xs font-bold rounded-full mt-1 md:mt-0 self-start ${
                        team.conference === 'Eastern Conference' 
                          ? 'bg-red-100 text-red-800' 
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {team.conferenceAbbr}
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

                {/* Points */}
                <div className="text-center min-w-12 ml-2 md:ml-4 font-bold text-sm md:text-base flex-shrink-0 font-roboto-mono">
                  {team.points}
                </div>
                
                {/* Goal Differential */}
                <div className={`text-center min-w-12 md:min-w-16 ml-2 md:ml-4 font-bold text-sm md:text-base flex-shrink-0 font-roboto-mono ${
                  parseInt(team.differential) > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {team.differential}
                </div>
              </div>
            ))
            )}
          </div>
        </div>

        {/* Conference Standings - Takes 1 column on desktop */}
        <div className="lg:col-span-1 bg-white rounded-lg shadow-md border border-gray-200 p-6 h-fit">
          <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center font-oswald">Playoff Picture</h2>
          <div className="space-y-6">
            {conferences.map(conf => {
              const confTeams = allTeams
                .filter(team => team.conference === conf.name)
                .sort((a, b) => b.points - a.points);

              return (
                <div key={conf.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="font-bold text-center mb-3 font-oswald text-gray-700">{conf.name}</h3>
                  <div className="space-y-2">
                    {confTeams.map((team, idx) => {
                      const status = getPlayoffQualificationStatus(team);
                      return (
                        <div 
                          key={team.id}
                          onClick={() => handleTeamClick(team)}
                          className={`flex items-center justify-between p-2 rounded cursor-pointer transition-colors ${
                            status.playoff ? 'hover:bg-white' : 'opacity-60'
                          }`}
                        >
                          <div className="flex items-center flex-1 min-w-0">
                            <span className="font-bold w-5 text-right mr-2 font-roboto-mono text-sm">{idx + 1}</span>
                            <img 
                              src={team.logo} 
                              alt={team.abbreviation}
                              className="w-6 h-6 rounded-full mr-2 flex-shrink-0"
                            />
                            <span className="text-xs font-bold truncate text-gray-800">{team.abbreviation}</span>
                          </div>
                          <span className={`ml-2 px-2 py-1 text-xs font-bold rounded ${status.badge}`}>
                            {status.status}
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
    </div>
  );
}

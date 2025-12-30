import { useEffect, useState } from "react";

export default function Teams() {
  const [conferences, setConferences] = useState([]);
  const [allTeams, setAllTeams] = useState([]);
  const [sortBy, setSortBy] = useState('wins'); // 'wins', 'conference', 'division'

  useEffect(() => {
    fetch("https://site.web.api.espn.com/apis/v2/sports/football/nfl/standings?season=2025")
      .then(res => res.json())
      .then(data => {
        const conferencesData = data.children;
        
        // Extract all teams with their full data
        const teams = conferencesData.flatMap(conf =>
          conf.standings.entries.map(entry => {
            // Find wins, losses, and ties from stats
            const wins = entry.stats.find(stat => stat.name === 'wins')?.value || 0;
            const losses = entry.stats.find(stat => stat.name === 'losses')?.value || 0;
            const ties = entry.stats.find(stat => stat.name === 'ties')?.value || 0;
            const winPercent = entry.stats.find(stat => stat.name === 'winPercent')?.value || 0;
            const playoffSeed = entry.stats.find(stat => stat.name === 'playoffSeed')?.value || 0;
            const differential = entry.stats.find(stat => stat.name === 'pointDifferential')?.value || 0;
            
            return {
              id: entry.team.id,
              name: entry.team.displayName,
              location: entry.team.location,
              abbreviation: entry.team.abbreviation,
              logo: entry.team.logos[0]?.href,
              conference: conf.name,
              conferenceAbbr: conf.abbreviation,
              wins,
              losses,
              ties,
              record: ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`,
              winPercent,
              playoffSeed,
              differential: differential > 0 ? `+${differential}` : `${differential}`
            };
          })
        );

        setConferences(conferencesData);
        setAllTeams(teams);
      });
  }, []);

  const getSortedTeams = () => {
    const sorted = [...allTeams];
    
    switch (sortBy) {
      case 'wins':
        return sorted.sort((a, b) => {
          // First sort by wins (descending)
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
          // Then by playoff seed (ascending - lower is better)
          return a.playoffSeed - b.playoffSeed;
        });
      case 'division':
        return sorted.sort((a, b) => {
          // Sort by playoff seed (division rankings)
          return a.playoffSeed - b.playoffSeed;
        });
      default:
        return sorted;
    }
  };

  const sortedTeams = getSortedTeams();

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">NFL Teams - 2025 Season</h1>
      
      {/* Sort Controls */}
      <div className="mb-6">
        <label className="mr-3 font-semibold text-gray-700">Sort by:</label>
        <select 
          value={sortBy} 
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="wins">Overall Standings (Wins)</option>
          <option value="conference">Conference</option>
          <option value="division">Playoff Seeding</option>
        </select>
      </div>

      {/* Teams List */}
      <div className="space-y-3">
        {sortedTeams.map((team, index) => (
          <div 
            key={team.id} 
            className="flex items-center p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
          >
            {/* Ranking */}
            <div className={`min-w-8 font-bold text-lg ${
              index < 7 ? 'text-green-600' : 
              index < 14 ? 'text-yellow-600' : 
              'text-red-600'
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
            <div className="flex-1">
              <div className="font-bold text-lg text-gray-800">
                {team.name}
              </div>
              <div className="text-sm text-gray-500">
                {team.conferenceAbbr} • Seed #{team.playoffSeed}
              </div>
            </div>
            
            {/* Record */}
            <div className="text-center min-w-16">
              <div className="font-bold text-lg text-gray-800">
                {team.record}
              </div>
              <div className="text-sm text-gray-500">
                {(team.winPercent * 100).toFixed(1)}%
              </div>
            </div>
            
            {/* Point Differential */}
            <div className={`text-center min-w-16 ml-4 font-bold ${
              parseInt(team.differential) > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {team.differential}
            </div>
          </div>
        ))}
      </div>

      {/* Conference Breakdown */}
      <div className="mt-12">
        <h2 className="text-3xl font-bold text-gray-800 mb-6">Conference Standings</h2>
        {conferences.map(conf => {
          const confTeams = allTeams
            .filter(team => team.conference === conf.name)
            .sort((a, b) => a.playoffSeed - b.playoffSeed);
            
          return (
            <div key={conf.id} className="mb-8">
              <h3 className={`text-xl font-bold text-white p-3 rounded-lg my-4 ${
                conf.abbreviation === 'AFC' ? 'bg-blue-800' : 'bg-red-600'
              }`}>
                {conf.name} ({conf.abbreviation})
              </h3>
              
              <div className="space-y-2 ml-6">
                {confTeams.map((team, index) => (
                  <div 
                    key={team.id}
                    className={`flex items-center p-3 rounded-lg border-l-4 ${
                      index < 7 
                        ? 'bg-green-50 border-l-green-500' 
                        : 'bg-gray-50 border-l-gray-400'
                    }`}
                  >
                    <span className="min-w-6 font-bold text-gray-700">
                      {team.playoffSeed}
                    </span>
                    <span className="flex-1 ml-4 font-medium text-gray-800">
                      {team.name}
                    </span>
                    <span className="font-bold text-gray-800">
                      {team.record}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
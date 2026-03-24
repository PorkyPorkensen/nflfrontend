import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import GameDetailsModal from "../components/GameDetailsModal";

export default function NBAHome() {
  const [games, setGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllGames, setShowAllGames] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGames();
  }, [selectedDate]);

  const fetchGames = async () => {
    setLoading(true);
    try {
      // Format date as YYYYMMDD using local date values (not UTC)
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`
      );
      
      if (response.ok) {
        const data = await response.json();
        const gamesData = data.events?.map(event => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
          const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
          
          return {
            id: event.id,
            status: event.status.type.state,
            statusText: event.status.type.shortDetail,
            clock: event.status.displayClock,
            homeTeam: {
              name: homeTeam.team.displayName,
              abbreviation: homeTeam.team.abbreviation,
              logo: homeTeam.team.logo,
              score: homeTeam.score
            },
            awayTeam: {
              name: awayTeam.team.displayName,
              abbreviation: awayTeam.team.abbreviation,
              logo: awayTeam.team.logo,
              score: awayTeam.score
            }
          };
        }) || [];
        setGames(gamesData);
      }
    } catch (err) {
      console.error('Error fetching NBA games:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  const handleGameClick = (gameId) => {
    setSelectedGameId(gameId);
    setShowGameDetails(true);
  };

  const formattedDate = selectedDate.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="text-center mb-4">
        <div className="flex items-center flex-col justify-center md:flex-row">
          <img src="/src/assets/nba.png" alt="NBA" className="h-16 md:h-36 w-auto" />
        </div>
        <p className="text-lg text-gray-600 mb-8 mt-4">Live scores, standings, and team information.</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <div className="bg-white rounded-lg shadow-md border-2 border-gray-300 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-orange-100 rounded-lg p-3 mr-4">
              <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Standings</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Track NBA standings with playoff and play-in seeding information.
          </p>
          <Link to="/nba/standings" className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors">
            View Standings
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-md border-2 border-gray-300 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gray-100 rounded-lg p-3 mr-4">
              <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">Player Stats</h3>
          </div>
          <p className="text-gray-600 mb-4">
            View detailed player statistics and career information.
          </p>
          <button disabled className="inline-flex items-center px-4 py-2 bg-gray-300 text-gray-500 rounded-lg cursor-not-allowed">
            Coming Soon
          </button>
        </div>
      </div>

      {/* Scores Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl md:text-3xl font-bold text-gray-800 font-oswald">Scores</h3>
          
          {/* Date Navigation */}
          <div className="flex items-center gap-2">
            <button 
              onClick={handlePreviousDay}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              ←
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold min-w-32 text-center font-roboto-mono">
              {formattedDate}
            </span>
            <button 
              onClick={handleNextDay}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors"
            >
              →
            </button>
          </div>
        </div>

        {/* Show All Games Toggle */}
        {games.length > 6 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowAllGames(!showAllGames)}
              className="px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
            >
              {showAllGames ? 'Show Less' : `Show All Games (${games.length})`}
            </button>
          </div>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          </div>
        ) : games.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAllGames ? games : games.slice(0, 6)).map(game => (
              <div 
                key={game.id} 
                className="bg-gray-50 border-2 border-gray-200 rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-orange-300 transition-all duration-200"
                onClick={() => handleGameClick(game.id)}
              >
                {/* Game Status */}
                <div className="text-center mb-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold font-roboto-condensed ${
                    game.status === 'in' 
                      ? 'bg-red-100 text-red-800' 
                      : game.status === 'pre'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status === 'in' && game.clock ? game.statusText : game.statusText}
                  </span>
                </div>

                {/* Away Team */}
                <div className="flex items-center justify-between mb-3 p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <img 
                      src={game.awayTeam.logo} 
                      alt={`${game.awayTeam.name} logo`}
                      className="w-8 h-8 mr-3"
                    />
                    <div>
                      <span className="font-bold text-lg font-oswald">{game.awayTeam.abbreviation}</span>
                      <p className="text-xs text-gray-600 font-roboto-condensed">{game.awayTeam.name}</p>
                    </div>
                  </div>
                  <span className="font-bold text-2xl font-roboto-mono text-gray-800">{game.awayTeam.score}</span>
                </div>

                {/* Home Team */}
                <div className="flex items-center justify-between mb-3 p-3 bg-white rounded-lg">
                  <div className="flex items-center">
                    <img 
                      src={game.homeTeam.logo} 
                      alt={`${game.homeTeam.name} logo`}
                      className="w-8 h-8 mr-3"
                    />
                    <div>
                      <span className="font-bold text-lg font-oswald">{game.homeTeam.abbreviation}</span>
                      <p className="text-xs text-gray-600 font-roboto-condensed">{game.homeTeam.name}</p>
                    </div>
                  </div>
                  <span className="font-bold text-2xl font-roboto-mono text-gray-800">{game.homeTeam.score}</span>
                </div>

                {/* Click for details hint */}
                <div className="text-center mt-3 pt-3 border-t border-gray-200">
                  <span className="text-xs text-gray-500 font-roboto-condensed">Click for details</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-500 font-roboto-condensed">No games on {formattedDate}</p>
          </div>
        )}
      </div>

      {/* Back to leagues */}
      <div className="text-center">
        <Link to="/" className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-lg font-semibold">
          ← Back to League Selection
        </Link>
      </div>

      {/* Game Details Modal */}
      <GameDetailsModal
        gameId={selectedGameId}
        isOpen={showGameDetails}
        onClose={() => {
          setShowGameDetails(false);
          setSelectedGameId(null);
        }}
        sport="nba"
      />
    </div>
  );
}

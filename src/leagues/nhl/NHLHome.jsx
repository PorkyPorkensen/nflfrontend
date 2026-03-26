import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import GameDetailsModal from "../../components/GameDetailsModal";
import { FEATURES } from "../../config/features";


export default function NHLHome() {
  const [liveGames, setLiveGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showAllGames, setShowAllGames] = useState(false);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [loading, setLoading] = useState(false);

  // Fetch games for selected date
  const fetchGames = async () => {
    setLoading(true);
    try {
      const dateStr = selectedDate.toISOString().slice(0, 10).replace(/-/g, '');
      const endpoint = `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateStr}`;
      
      const res = await fetch(endpoint);
      if (res.ok) {
        const data = await res.json();
        const games = data.events?.map(event => {
          const competition = event.competitions[0];
          const homeTeam = competition.competitors.find(team => team.homeAway === 'home');
          const awayTeam = competition.competitors.find(team => team.homeAway === 'away');
          
          return {
            id: event.id,
            status: event.status.type.state,
            statusText: event.status.type.shortDetail,
            period: event.status.period,
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
        setLiveGames(games);
      }
    } catch (err) {
      console.error('Error fetching NHL games:', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch when date changes
  useEffect(() => {
    fetchGames();
  }, [selectedDate]);

  // Auto-refresh for live games every 30 seconds
  useEffect(() => {
    const hasLiveGames = liveGames.some(game => game.status === 'in');
    
    if (!hasLiveGames) return;

    const interval = setInterval(fetchGames, 30000);
    return () => clearInterval(interval);
  }, [liveGames]);

  // Handle game click to show details
  const handleGameClick = (gameId) => {
    setSelectedGameId(gameId);
    setShowGameDetails(true);
  };

  // Handle date navigation
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

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      <div className="text-center mb-4">
        <div className="flex items-center flex-col justify-center md:flex-row">
          <img src="/nhl.svg" alt="NHL" className="h-24 md:h-48 w-auto" />
        </div>
        <p className="text-lg text-gray-600 mb-4 mt-8">Live scores, standings, and player statistics.</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-1 gap-8 mb-8 max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex items-center mb-4">
            <div className="bg-gray-200 rounded-lg p-3 mr-4">
              <svg className="w-8 h-8 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-800">League Standings</h3>
          </div>
          <p className="text-gray-600 mb-4">
            Track real-time NHL standings with division breakdowns and playoff seedings.
          </p>
          <Link to="/nhl/standings" className="inline-flex items-center px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors">
            View Standings
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* Live Games Section */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
          <h3 className="text-xl md:text-3xl font-bold text-gray-800 font-oswald">Results</h3>
          
          {/* Date Navigation */}
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-2">
              <button 
                onClick={handlePreviousDay}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
              >
                ←
              </button>
              <div className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold min-w-48 text-center font-roboto-condensed">
                {formatDate(selectedDate)}
              </div>
              <button 
                onClick={handleNextDay}
                className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors"
              >
                →
              </button>
            </div>
            {selectedDate.toDateString() !== new Date().toDateString() && (
              <button
                onClick={handleToday}
                className="px-4 py-1 text-sm bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Go to Today
              </button>
            )}
          </div>
        </div>

        {/* Show All Games Toggle */}
        {liveGames.length > 6 && (
          <div className="flex justify-center mb-6">
            <button
              onClick={() => setShowAllGames(!showAllGames)}
              className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-700"
            >
              {showAllGames ? 'Show Less' : `Show All Games (${liveGames.length})`}
            </button>
          </div>
        )}

        {/* Games Grid */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : liveGames.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(showAllGames ? liveGames : liveGames.slice(0, 6)).map(game => (
              <div 
                key={game.id} 
                className="bg-gray-50 border-2 border-gray-200 rounded-lg shadow-sm p-5 cursor-pointer hover:shadow-lg hover:border-gray-400 transition-all duration-200"
                onClick={() => handleGameClick(game.id)}
              >
                {/* Game Status */}
                <div className="text-center mb-4">
                  <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold font-roboto-condensed ${
                    game.status === 'in' 
                      ? 'bg-red-100 text-red-800' 
                      : game.status === 'pre'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {game.status === 'in' && game.clock ? `${game.period}${['st', 'nd', 'rd'][game.period - 1] || 'th'} ${game.clock}` : game.statusText}
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
            <p className="text-gray-500 font-roboto-condensed">No games scheduled for {formatDate(selectedDate)}</p>
          </div>
        )}
      </div>

      {/* Game Details Modal */}
      <GameDetailsModal
        gameId={selectedGameId}
        isOpen={showGameDetails}
        onClose={() => {
          setShowGameDetails(false);
          setSelectedGameId(null);
        }}
        sport="nhl"
      />
    </div>
  );
}

import { useEffect, useState } from "react";
import GameDetailsModal from "./components/GameDetailsModal";

export default function NBAGamesHeader() {
  const [liveGames, setLiveGames] = useState([]);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [showAllGames, setShowAllGames] = useState(false);
  const [screenSize, setScreenSize] = useState('mobile');
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(false);

  // Track screen size for responsive game display
  useEffect(() => {
    const updateScreenSize = () => {
      if (window.innerWidth >= 1280) {
        setScreenSize('xl'); // 4 games
      } else if (window.innerWidth >= 1024) {
        setScreenSize('lg'); // 3 games
      } else if (window.innerWidth >= 768) {
        setScreenSize('md'); // 2 games
      } else {
        setScreenSize('mobile'); // 1 game
      }
    };

    updateScreenSize();
    window.addEventListener('resize', updateScreenSize);
    return () => window.removeEventListener('resize', updateScreenSize);
  }, []);

  // Fetch NBA live games
  const tryScoreboardAPI = async () => {
    // Format date as YYYYMMDD for ESPN API
    const year = selectedDate.getFullYear();
    const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDate.getDate()).padStart(2, '0');
    const formattedDate = `${year}${month}${day}`;

    const endpoints = [
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${formattedDate}`,
      `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${formattedDate}&seasontype=2`
    ];

    for (const endpoint of endpoints) {
      try {
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
          return;
        }
      } catch (err) {
        // console.log(`Endpoint failed: ${endpoint}`, err);
      }
    }
    
    // If all endpoints fail, create some mock data for testing
    setLiveGames([
      {
        id: 'mock1',
        status: 'in',
        statusText: '2nd Qtr',
        period: 2,
        clock: '8:42',
        homeTeam: {
          name: 'Los Angeles Lakers',
          abbreviation: 'LAL',
          logo: 'https://a.espncdn.com/i/teamlogos/nba/500/lal.png',
          score: '62'
        },
        awayTeam: {
          name: 'Boston Celtics',
          abbreviation: 'BOS',
          logo: 'https://a.espncdn.com/i/teamlogos/nba/500/bos.png',
          score: '58'
        }
      }
    ]);
  };

  // Initial fetch when date changes
  useEffect(() => {
    tryScoreboardAPI();
  }, [selectedDate]);

  // Auto-refresh for live games every 30 seconds
  useEffect(() => {
    const hasLiveGames = liveGames.some(game => game.status === 'in');
    
    if (!hasLiveGames) return; // Don't fetch if no live games

    // Set up interval to refresh live game data
    const interval = setInterval(tryScoreboardAPI, 30000);

    return () => clearInterval(interval); // Cleanup on unmount or when no live games
  }, [liveGames]);

  // Get default number of games to show based on screen size
  const getDefaultGameCount = () => {
    switch (screenSize) {
      case 'xl': return 4;
      case 'lg': return 3;
      case 'md': return 2;
      default: return 1;
    }
  };

  // Handle game click to show details
  const handleGameClick = (gameId) => {
    setSelectedGameId(gameId);
    setShowGameDetails(true);
  };

  // Format date for display
  const formatDate = (date) => {
    const options = { weekday: 'short', month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  // Navigate to previous day
  const handlePreviousDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() - 1);
    setSelectedDate(newDate);
  };

  // Navigate to next day
  const handleNextDay = () => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + 1);
    setSelectedDate(newDate);
  };

  // Handle date input change
  const handleDateChange = (e) => {
    const date = new Date(e.target.value);
    setSelectedDate(date);
  };

  // Format date for input field (YYYY-MM-DD)
  const formatDateForInput = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Don't render if no games
  if (liveGames.length === 0) {
    return null;
  }

  return (
    <div className="p-6 w-full max-w-6xl mx-auto mb-8">
      <div className="mb-4">
        {/* Date Navigation */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4 items-center md:items-center justify-center md:justify-between">
          <div className="flex items-center gap-2 flex-wrap justify-center md:justify-start">
            <button 
              onClick={handlePreviousDay}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-semibold"
            >
              ← Prev
            </button>
            <span className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-semibold text-center font-roboto-mono">
              {formatDate(selectedDate)}
            </span>
            <button 
              onClick={handleNextDay}
              className="px-3 py-2 bg-orange-500 text-white rounded hover:bg-orange-600 transition-colors font-semibold"
            >
              Next →
            </button>
            <input
              type="date"
              value={formatDateForInput(selectedDate)}
              onChange={handleDateChange}
              className="px-4 py-2 bg-white border border-gray-300 rounded-lg font-roboto-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>
          
          {liveGames.length > getDefaultGameCount() && (
            <button
              onClick={() => setShowAllGames(!showAllGames)}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 max-w-xs md:max-w-none w-full md:w-auto"
            >
              {showAllGames ? 'Show Less' : `Show All (${liveGames.length})`}
            </button>
          )}
        </div>
      </div>

      <div className={`flex flex-wrap gap-4 ${screenSize === 'mobile' || (showAllGames ? liveGames : liveGames.slice(0, getDefaultGameCount())).length === 1 ? 'justify-center' : ''}`}>
        {(showAllGames ? liveGames : liveGames.slice(0, getDefaultGameCount())).map(game => (
          <div 
            key={game.id} 
            className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 w-64 flex-shrink-0 cursor-pointer hover:shadow-md hover:border-orange-300 transition-all duration-200"
            onClick={() => handleGameClick(game.id)}
          >
            {/* Game Status */}
            <div className="text-center mb-3">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                game.status === 'in' 
                  ? 'bg-red-100 text-red-800' 
                  : game.status === 'pre'
                  ? 'bg-orange-100 text-orange-800'
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {game.status === 'in' && game.clock ? `Q${game.period} ${game.clock}` : game.statusText}
              </span>
            </div>

            {/* Away Team */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img 
                  src={game.awayTeam.logo} 
                  alt={`${game.awayTeam.name} logo`}
                  className="w-6 h-6 mr-2"
                />
                <span className="font-medium text-sm font-oswald">{game.awayTeam.abbreviation}</span>
              </div>
              <span className="font-bold text-lg font-roboto-mono">{game.awayTeam.score}</span>
            </div>

            {/* Home Team */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <img 
                  src={game.homeTeam.logo} 
                  alt={`${game.homeTeam.name} logo`}
                  className="w-6 h-6 mr-2"
                />
                <span className="font-medium text-sm font-oswald">{game.homeTeam.abbreviation}</span>
              </div>
              <span className="font-bold text-lg font-roboto-mono">{game.homeTeam.score}</span>
            </div>

            {/* Click for details hint */}
            <div className="text-center mt-2 pt-2 border-t border-gray-100">
              <span className="text-xs text-gray-500 font-roboto-condensed">Click for details</span>
            </div>
          </div>
        ))}
      </div>

      {/* Game Details Modal */}
      <GameDetailsModal
        gameId={selectedGameId}
        isOpen={showGameDetails}
        sport="nba"
        onClose={() => {
          setShowGameDetails(false);
          setSelectedGameId(null);
        }}
      />
    </div>
  );
}

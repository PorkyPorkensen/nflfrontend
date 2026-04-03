import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import GameDetailsModal from "./components/GameDetailsModal";

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [nflGames, setNflGames] = useState([]);
  const [nbaGames, setNbaGames] = useState([]);
  const [nhlGames, setNhlGames] = useState([]);
  const [mlbGames, setMlbGames] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [selectedGameId, setSelectedGameId] = useState(null);
  const [showGameDetails, setShowGameDetails] = useState(false);
  const [selectedSport, setSelectedSport] = useState(null);
  const [expandedLeagues, setExpandedLeagues] = useState({});
  const [gamesPerRow, setGamesPerRow] = useState(4);

  // Calculate how many games fit in one row based on screen width
  useEffect(() => {
    const calculateGamesPerRow = () => {
      const cardWidth = 250; // 250px
      const gap = 16; // 1rem gap
      const effectiveWidth = cardWidth + gap;
      const available = window.innerWidth - 48; // 24px padding on each side
      const perRow = Math.floor(available / effectiveWidth);
      setGamesPerRow(Math.max(1, Math.min(perRow, 4))); // Min 1, max 8
    };

    calculateGamesPerRow();
    window.addEventListener('resize', calculateGamesPerRow);
    return () => window.removeEventListener('resize', calculateGamesPerRow);
  }, []);

  const leagues = [
    {
      name: "NFL",
      icon: "🏈",
      description: "National Football League",
      color: "from-blue-500 to-blue-600",
      image: "/nflLp.webp",
      path: "/nfl",
      status: "active"
    },
    {
      name: "NBA",
      icon: "🏀",
      description: "National Basketball Association",
      color: "from-orange-500 to-orange-600",
      image: "/nbaLp.jpg",
      path: "/nba",
      status: "active"
    },
    {
      name: "NHL",
      icon: "🏒",
      description: "National Hockey League",
      color: "from-gray-700 to-gray-800",
      image: "/nhlLp.jpg",
      path: "/nhl",
      status: "active"
    },
    {
      name: "MLB",
      icon: "⚾",
      description: "Major League Baseball",
      color: "from-amber-600 to-amber-700",
      image: "/mlbBg.jpg",
      path: "/mlb",
      status: "active"
    }
  ];

  // Fetch games for all 3 sports
  const fetchAllGames = async () => {
    if (isInitialLoad) {
      setLoading(true);
    }

    try {
      // Format date as YYYYMMDD using local date values
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const dateStr = `${year}${month}${day}`;

      // Fetch NFL games
      const fetchNFL = async () => {
        try {
          const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?dates=${dateStr}`
          );
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
            setNflGames(games);
          }
        } catch (err) {
          console.error('Error fetching NFL games:', err);
          setNflGames([]);
        }
      };

      // Fetch NBA games
      const fetchNBA = async () => {
        try {
          const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard?dates=${dateStr}`
          );
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
            setNbaGames(games);
          }
        } catch (err) {
          console.error('Error fetching NBA games:', err);
          setNbaGames([]);
        }
      };

      // Fetch NHL games
      const fetchNHL = async () => {
        try {
          const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/hockey/nhl/scoreboard?dates=${dateStr}`
          );
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
            setNhlGames(games);
          }
        } catch (err) {
          console.error('Error fetching NHL games:', err);
          setNhlGames([]);
        }
      };

      // Fetch MLB games
      const fetchMLB = async () => {
        try {
          const res = await fetch(
            `https://site.api.espn.com/apis/site/v2/sports/baseball/mlb/scoreboard?dates=${dateStr}`
          );
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
            setMlbGames(games);
          }
        } catch (err) {
          console.error('Error fetching MLB games:', err);
          setMlbGames([]);
        }
      };

      // Fetch all in parallel
      await Promise.all([fetchNFL(), fetchNBA(), fetchNHL(), fetchMLB()]);
      if (isInitialLoad) {
        setIsInitialLoad(false);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
      }
    }
  };

  // Fetch when date changes
  useEffect(() => {
    fetchAllGames();
    setExpandedLeagues({}); // Collapse all sections when date changes
  }, [selectedDate]);

  // Auto-refresh every 30 seconds if there are live games
  useEffect(() => {
    const hasLiveGames = 
      nflGames.some(g => g.status === 'in') ||
      nbaGames.some(g => g.status === 'in') ||
      nhlGames.some(g => g.status === 'in') ||
      mlbGames.some(g => g.status === 'in');

    if (!hasLiveGames) return;

    const interval = setInterval(fetchAllGames, 30000);
    return () => clearInterval(interval);
  }, [nflGames, nbaGames, nhlGames, mlbGames, selectedDate]);

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

  const handleGameClick = (gameId, sport) => {
    setSelectedGameId(gameId);
    setSelectedSport(sport);
    setShowGameDetails(true);
  };

  const GameCard = ({ game, sport }) => {
    const statusDisplay = () => {
      if (game.status === 'in' && game.clock) {
        if (sport === 'nhl' && game.period > 3) {
          return `OT ${game.clock}`;
        } else if (sport === 'mlb') {
          // For MLB, statusText already contains "Top 8th" etc.
          return game.statusText;
        } else if (sport === 'nfl') {
          return `Q${game.period} ${game.clock}`;
        } else if (sport === 'nba') {
          return `Q${game.period} ${game.clock}`;
        }
      }
      return game.statusText;
    };

    const bgColor = {
      nfl: 'hover:border-blue-300',
      nba: 'hover:border-orange-300',
      nhl: 'hover:border-gray-400',
      mlb: 'hover:border-amber-300'
    }[sport];

    const badgeBg = {
      nfl: 'bg-blue-100 text-blue-800',
      nba: 'bg-orange-100 text-orange-800',
      nhl: 'bg-gray-100 text-gray-800',
      mlb: 'bg-amber-100 text-amber-800'
    }[sport];

    return (
      <div
        className={`bg-gray-50 border-2 border-gray-200 rounded-lg shadow-sm p-4 cursor-pointer hover:shadow-lg ${bgColor} transition-all duration-200`}
        onClick={() => handleGameClick(game.id, sport)}
      >
        <div className="text-center mb-3">
          <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold font-roboto-condensed ${
            game.status === 'in' ? 'bg-red-100 text-red-800' : game.status === 'pre' ? badgeBg : 'bg-gray-100 text-gray-800'
          }`}>
            {statusDisplay()}
          </span>
        </div>

        <div className="flex items-center justify-between mb-2 p-2 bg-white rounded">
          <div className="flex items-center">
            <img src={game.awayTeam.logo} alt={game.awayTeam.name} className="w-6 h-6 mr-2" />
            <span className="font-bold text-sm">{game.awayTeam.abbreviation}</span>
          </div>
          <span className="font-bold text-lg">{game.awayTeam.score}</span>
        </div>

        <div className="flex items-center justify-between p-2 bg-white rounded">
          <div className="flex items-center">
            <img src={game.homeTeam.logo} alt={game.homeTeam.name} className="w-6 h-6 mr-2" />
            <span className="font-bold text-sm">{game.homeTeam.abbreviation}</span>
          </div>
          <span className="font-bold text-lg">{game.homeTeam.score}</span>
        </div>
      </div>
    );
  };

  const SportSection = ({ sport, games, icon, color }) => {
    const isExpanded = expandedLeagues[sport] || false;
    const displayGames = isExpanded ? games : games.slice(0, gamesPerRow);

    return (
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <span className="text-3xl mr-3">{icon}</span>
          <h3 className="text-2xl font-bold text-gray-800">{sport.toUpperCase()}</h3>
        </div>
        {games.length > 0 ? (
          <>
            <div 
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, 250px)',
                gap: '1rem',
                justifyContent: 'center',
                margin: '0 auto',

              }}
              className="md:justify-start md:m-0"
            >
              {displayGames.map(game => (
                <GameCard key={game.id} game={game} sport={sport} />
              ))}
            </div>
            {games.length > gamesPerRow && (
              <button
                onClick={() => setExpandedLeagues(prev => ({ ...prev, [sport]: !isExpanded }))}
                className="mt-4 px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-roboto-condensed block mx-auto md:ml-2"
              >
                {isExpanded ? 'Show Less' : `Show More (${games.length - gamesPerRow} more)`}
              </button>
            )}
          </>
        ) : (
          <p className="text-gray-500 font-roboto-condensed">No games scheduled for {formatDate(selectedDate)}</p>
        )}
      </div>
    );
  };

  const allGamesEmpty = nflGames.length === 0 && nbaGames.length === 0 && nhlGames.length === 0 && mlbGames.length === 0;

  return (
    <div className="p-6 w-full max-w-6xl mx-auto">
      {/* Header */}
      <div className="text-center mb-16">
        <div className="flex items-center flex-col justify-center md:flex-row">
          <img 
            src="/logo3.png" 
            alt="SportSync" 
            className="h-20 w-auto mr-3 mb-4 md:mb-0"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextElementSibling.style.display = 'inline';
            }}
          />
          <h1 className="text-5xl font-bold text-gray-800" style={{display: 'none'}}>SportSync</h1>
        </div>
        <p className="text-xl text-gray-600 mt-8">
          Your one-stop shop for live scores, standings, and player stats
        </p>
      </div>

      {/* League Selection Cards */}
      <div className="grid grid-cols-1 place-items-center md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
        {leagues.map((league) => (
          <Link
            key={league.name}
            to={league.path}
            className="group relative overflow-hidden rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2"
            style={{ width: '275px', height: '275px' }}
          >
            {/* Background image */}
            <div 
              className="absolute inset-0"
              style={{
                backgroundImage: `url('${league.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            ></div>
            
            {/* Content */}
            <div className="relative p-8 text-white flex flex-col justify-between min-h-64">
              <div>
                <div className="text-6xl mb-4">{league.icon}</div>
                <h2 className="text-4xl font-bold mb-2">{league.name}</h2>
                <p className="text-lg opacity-90">{league.description}</p>
              </div>
              
              <div className="flex items-center text-lg font-semibold">
                <span>Explore</span>
                <svg className="w-5 h-5 ml-2 group-hover:translate-x-2 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>

            {/* Hover effect border */}
            <div className="absolute inset-0 border-2 border-white opacity-0 group-hover:opacity-100 transition-opacity rounded-lg"></div>
          </Link>
        ))}
      </div>

      {/* Live Games Section */}
      {!allGamesEmpty && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6 flex-col md:flex-row gap-4">
            <h3 className="text-2xl md:text-3xl font-bold text-gray-800 font-oswald">Schedule</h3>
            
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

          {/* Loading State */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-700"></div>
            </div>
          ) : (
            <div className="space-y-8">
              {nflGames.length > 0 && <SportSection sport="nfl" games={nflGames} icon="🏈" color="blue" />}
              {nbaGames.length > 0 && <SportSection sport="nba" games={nbaGames} icon="🏀" color="orange" />}
              {nhlGames.length > 0 && <SportSection sport="nhl" games={nhlGames} icon="🏒" color="gray" />}
              {mlbGames.length > 0 && <SportSection sport="mlb" games={mlbGames} icon="⚾" color="amber" />}
            </div>
          )}
        </div>
      )}

      {/* Game Details Modal */}
      <GameDetailsModal
        gameId={selectedGameId}
        isOpen={showGameDetails}
        onClose={() => {
          setShowGameDetails(false);
          setSelectedGameId(null);
          setSelectedSport(null);
        }}
        sport={selectedSport}
      />

      {/* Features Preview */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-8 mb-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-6">What We Offer</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-blue-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Live Standings</h4>
              <p className="text-gray-600">
                Real-time league standings and rankings
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Game Updates</h4>
              <p className="text-gray-600">
                Live scores and game information
              </p>
            </div>
          </div>

          <div className="flex items-start">
            <div className="flex-shrink-0 mr-4">
              <div className="flex items-center justify-center h-12 w-12 rounded-md bg-purple-500 text-white">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 mb-2">Predictions</h4>
              <p className="text-gray-600">
                Make predictions and compete with friends
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
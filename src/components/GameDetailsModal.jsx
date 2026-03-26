import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import PlayerDetailsModal from "./PlayerDetailsModal";

export default function GameDetailsModal({ gameId, onClose, isOpen, sport = 'nfl' }) {
  const navigate = useNavigate();
  const [gameDetails, setGameDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState(null);

  // Get sport-specific colors
  const getSportColors = () => {
    switch(sport.toLowerCase()) {
      case 'nba':
        return {
          primary: 'orange',
          bg: 'orange',
          border: 'orange',
          text: 'orange'
        };
      case 'nhl':
        return {
          primary: 'gray',
          bg: 'gray',
          border: 'gray',
          text: 'gray'
        };
      case 'nfl':
      default:
        return {
          primary: 'blue',
          bg: 'blue',
          border: 'blue',
          text: 'blue'
        };
    }
  };

  const colors = getSportColors();

  useEffect(() => {
    if (isOpen && gameId) {
      fetchGameDetails();
    }
  }, [isOpen, gameId, sport]);

  const fetchGameDetails = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Support NFL, NBA, and NHL
      const sportPath = sport.toLowerCase() === 'nba' 
        ? 'basketball/nba'
        : sport.toLowerCase() === 'nhl'
        ? 'hockey/nhl'
        : 'football/nfl';
      
      const response = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/${sportPath}/summary?event=${gameId}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch game details');
      }
      
      const data = await response.json();
      setGameDetails(data);
    } catch (err) {
      setError(err.message);
      // console.error('Error fetching game details:', err);
    } finally {
      setLoading(false);
    }
  };

  // Handle click outside to close
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto relative">
        {loading && (
          <div className="p-8 text-center">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto"
              style={{ borderBottomColor: colors.bg === 'orange' ? '#f97316' : '#3b82f6' }}
            ></div>
            <p className="mt-4 text-gray-600 font-roboto-condensed">Loading game details...</p>
          </div>
        )}

        {error && (
          <div className="p-8 text-center">
            <p className="text-red-600 mb-4 font-roboto-condensed">Failed to load game details</p>
            <p className="text-gray-600 font-roboto-condensed">{error}</p>
            <button
              onClick={fetchGameDetails}
              style={{ backgroundColor: colors.bg === 'orange' ? '#f97316' : '#3b82f6' }}
              className="mt-4 px-4 py-2 text-white rounded hover:opacity-80 transition-opacity"
            >
              Try Again
            </button>
          </div>
        )}

        {gameDetails && !loading && !error && (
          <GameDetailsContent gameDetails={gameDetails} onClose={onClose} sport={sport} colors={colors} navigate={navigate} onPlayerClick={(player, teamId, stats) => {
            setSelectedPlayer(player);
            setSelectedTeamId(teamId);
            // Format stats for display
            const gameStats = (stats || []).map((value, idx) => ({
              value: value || '0',
              label: (gameDetails?.boxscore?.players?.[player.playerGroupIdx]?.statistics?.[0]?.labels?.[idx]) || `Stat ${idx + 1}`
            }));
            setSelectedPlayer({ ...player, gameStats });
            setShowPlayerModal(true);
          }} onTeamClick={(team) => {
            if (sport.toLowerCase() === 'nfl') {
              navigate(`/nfl/team/${team.id}`, { state: { teamData: team } });
            } else if (sport.toLowerCase() === 'nba') {
              navigate(`/nba/team/${team.id}`, { state: { teamData: team } });
            } else {
              navigate(`/nhl/team/${team.id}`, { state: { teamData: team } });
            }
          }} />
        )}
        
        {/* Player Details Modal */}
        <PlayerDetailsModal
          isOpen={showPlayerModal}
          onClose={() => {
            setShowPlayerModal(false);
            setSelectedPlayer(null);
            setSelectedTeamId(null);
          }}
          player={selectedPlayer}
          sport={sport}
          teamId={selectedTeamId}
          gameStats={selectedPlayer?.gameStats}
        />
        
        {/* Fallback content if detailed API fails but we still want to show something */}
        {!gameDetails && !loading && error && (
          <div className="p-8 text-center">
            <h2 className="text-xl font-bold mb-4 font-oswald">Game Details</h2>
            <p className="text-gray-600 mb-4 font-roboto-condensed">Unable to load detailed statistics at this time.</p>
            <p className="text-sm text-gray-500 font-roboto-condensed">Game ID: {gameId}</p>
          </div>
        )}
      </div>
    </div>
  );
}

function GameDetailsContent({ gameDetails, onClose, sport = 'nfl', colors = { bg: 'blue', text: 'blue' }, navigate, onPlayerClick = () => {}, onTeamClick = () => {} }) {
  // Log the full structure to understand the data better
  // console.log('Full gameDetails structure:', gameDetails);
  
  const { header, boxscore, gameInfo, drives, leaders, winprobability, pickcenter, broadcasts, news } = gameDetails;
  
  // Enhanced team click handler for NFL that just passes the team ID
  const handleNFLTeamClick = (basicTeam) => {
    if (!basicTeam?.id) return;
    navigate(`/nfl/team/${basicTeam.id}`);
  };
  
  // ESPN Site API Data Structure Reference:
  // - winprobability: Array of {timeIndex, away: {winPercentage}, home: {winPercentage}} or {awayTeamWinPercentage, homeTeamWinPercentage}
  // - pickcenter: Array of {provider: {name}, spread, overUnder, homeTeamOdds, awayTeamOdds}
  // - header: {competitions: [{competitors: [{homeAway, team: {id, displayName, abbreviation, logo}}, ...], status: {type: {state}}}]}
  
  const competition = header?.competitions?.[0];
  const homeTeam = competition?.competitors?.find(team => team.homeAway === 'home');
  const awayTeam = competition?.competitors?.find(team => team.homeAway === 'away');

  // ESPN does not always return the same betting shape across games/seasons.
  const pickcenterLines = Array.isArray(pickcenter)
    ? pickcenter
    : (pickcenter ? [pickcenter] : []);
  const competitionOddsLines = Array.isArray(competition?.odds)
    ? competition.odds.map((odds) => ({
        provider: {
          name: odds?.provider?.name || odds?.provider?.displayName || 'Sportsbook'
        },
        spread: odds?.spread,
        overUnder: odds?.overUnder,
        homeTeamOdds: {
          moneyLine: odds?.homeTeamOdds?.moneyLine
        },
        awayTeamOdds: {
          moneyLine: odds?.awayTeamOdds?.moneyLine
        }
      }))
    : [];
  const bettingLines = pickcenterLines.length > 0 ? pickcenterLines : competitionOddsLines;

  // Helper function to get custom stat label for NBA
  const getStatLabel = (statName) => {
    const nbaLabels = {
      'fieldGoalsMade-fieldGoalsAttempted': 'FG',
      'threePointFieldGoalsMade-threePointFieldGoalsAttempted': '3PT',
      'freeThrowsMade-freeThrowsAttempted': 'FT',
      'fieldGoalPct': 'FG%',
      'threePointFieldGoalPct': '3P%',
      'freeThrowPct': 'FT%',
      'totalRebounds': 'RB',
      'offensiveRebounds': 'ORB',
      'defensiveRebounds': 'DRB',
      'assists': 'A',
      'steals': 'STL',
      'blocks': 'BLK',
      'turnovers': 'TO',
      // Pre-game team stats
      'streak': 'Streak',
      'lastTenGames': 'L10',
      'avgPoints': 'PF',
      'avgPointsAgainst': 'PA',
      'avgRebounds': 'REB',
      'avgAssists': 'A',
      'avgBlocks': 'BLK',
      'avgSteals': 'STL'
    };
    return nbaLabels[statName] || statName;
  };

  // Helper function to define stat display order and filter
  const getStatOrder = () => [
    'streak',
    'lastTenGames',
    'avgPoints',
    'avgPointsAgainst',
    'fieldGoalPct',
    'threePointFieldGoalPct',
    'avgRebounds',
    'avgAssists',
    'avgBlocks',
    'avgSteals'
  ];

  // Helper function to detect if stats are pre-game stats (vs live game stats)
  const isPreGameStats = (stats) => {
    if (!Array.isArray(stats) || stats.length === 0) return false;
    // Pre-game stats include names like 'streak', 'avgPoints', 'lastTenGames', etc.
    return stats.some(stat => 
      stat?.name && ['streak', 'lastTenGames', 'avgPoints', 'avgPointsAgainst', 'avgRebounds', 'avgAssists', 'avgBlocks', 'avgSteals'].includes(stat.name)
    );
  };

  // Helper function to reorder and filter stats
  const reorderStats = (stats) => {
    if (!Array.isArray(stats)) return stats;
    
    // If these are pre-game stats, reorder them
    if (isPreGameStats(stats)) {
      const statOrder = getStatOrder();
      const statMap = {};
      
      // Create a map of stats by name
      stats.forEach(stat => {
        if (stat?.name) {
          statMap[stat.name] = stat;
        }
      });
      
      // Reorder stats according to statOrder, only including those that exist
      const reordered = statOrder
        .map(statName => statMap[statName])
        .filter(stat => stat !== undefined);
      
      return reordered;
    }
    
    // For live game stats, return as-is
    return stats;
  };

  // Filter stats for NBA (up to and including turnovers)
  const getFilteredStats = (stats) => {
    if (sport.toLowerCase() !== 'nba' || !Array.isArray(stats)) return stats;
    
    const turnoversIndex = stats.findIndex(stat => 
      stat?.name?.toLowerCase().includes('turnover')
    );
    
    if (turnoversIndex !== -1) {
      return stats.slice(0, turnoversIndex + 1);
    }
    return stats;
  };

  // Helper function to format team data for NBATeamModal
  const formatTeamForModal = (teamData) => {
    if (!teamData) return null;
    
    // Build the full team name from location and name
    const teamName = teamData.displayName || `${teamData.location} ${teamData.name}` || 'Team';
    
    // Get record using the same logic as getTeamRecord
    let record = '';
    
    // Handle record.items array structure (from team details API)
    if (teamData.record?.items) {
      if (Array.isArray(teamData.record.items)) {
        const totalRecord = teamData.record.items.find(rec => rec.type === 'total') || teamData.record.items[0];
        if (totalRecord?.summary) {
          record = totalRecord.summary;
        }
      }
    } else if (Array.isArray(teamData.record)) {
      // Handle record as a direct array (from game summary API)
      const totalRecord = teamData.record.find(rec => rec.type === 'total') || teamData.record[0];
      if (totalRecord?.summary) {
        record = totalRecord.summary;
      }
    } else if (teamData.record?.summary) {
      record = teamData.record.summary;
    } else if (typeof teamData.record === 'string') {
      record = teamData.record;
    } else if (teamData.statistics) {
      const wins = teamData.statistics.find(s => s.name === 'wins')?.displayValue || '0';
      const losses = teamData.statistics.find(s => s.name === 'losses')?.displayValue || '0';
      record = `${wins}-${losses}`;
    }
    
    return {
      ...teamData,
      name: teamName,
      logo: teamData.logo || teamData.logos?.[0]?.href,
      abbreviation: teamData.abbreviation || '',
      record: record
    };
  };

  // Helper function to extract team record
  const getTeamRecord = (teamCompetitor) => {
    if (!teamCompetitor) return '';
    
    // Handle record.items array structure (from team details API)
    if (teamCompetitor.record?.items) {
      if (Array.isArray(teamCompetitor.record.items)) {
        const totalRecord = teamCompetitor.record.items.find(rec => rec.type === 'total') || teamCompetitor.record.items[0];
        if (totalRecord?.summary) {
          return totalRecord.summary;
        }
      }
    }
    
    // Handle record as a direct array (from game summary API)
    if (Array.isArray(teamCompetitor.record)) {
      // Find the total record or just use the first one
      const totalRecord = teamCompetitor.record.find(rec => rec.type === 'total') || teamCompetitor.record[0];
      if (totalRecord?.summary) {
        return totalRecord.summary;
      }
    }
    
    // Fallback: Check for record.summary directly
    if (teamCompetitor?.record?.summary) {
      return teamCompetitor.record.summary;
    }
    
    // Fallback: Check if record is a string
    if (typeof teamCompetitor.record === 'string') {
      return teamCompetitor.record;
    }
    
    return '';
  };
  
  // console.log('Parsed teams:', { homeTeam, awayTeam });
  // console.log('Home team logo paths:', {
  //   logo: homeTeam?.team?.logo,
  //   logos: homeTeam?.team?.logos,
  //   logoHref: homeTeam?.team?.logos?.[0]?.href
  // });
  // console.log('Away team logo paths:', {
  //   logo: awayTeam?.team?.logo, 
  //   logos: awayTeam?.team?.logos,
  //   logoHref: awayTeam?.team?.logos?.[0]?.href
  // });
  // console.log('Game status:', header?.competitions?.[0]?.status?.type?.state);
  // console.log('Officials structure:', gameInfo?.officials?.[0]);
  // console.log('Weather structure:', gameInfo?.weather);
  // console.log('Header structure for date/time:', {
  //   date: header?.competitions?.[0]?.date,
  //   season: header?.season,
  //   week: header?.week
  // });
  
  return (
    <div className="px-4 pb-6 p-6 mt-4">
      {/* Game Header */}
      <div className="mb-12 mt-2 pr-2 md:pr-8">
        <div className="flex flex-col md:flex-row items-center justify-center mb-4 space-y-4 md:space-y-0">
          {/* Away Team */}
          <div className="flex items-center mr-0 md:mr-8 w-full md:w-auto cursor-pointer hover:opacity-75 transition-opacity" onClick={() => sport.toLowerCase() === 'nfl' ? handleNFLTeamClick(awayTeam?.team) : onTeamClick(awayTeam?.team || formatTeamForModal(awayTeam?.team))}>
            {(awayTeam?.team?.logo || awayTeam?.team?.logos?.[0]?.href) && (
              <img 
                src={awayTeam.team.logo || awayTeam.team.logos[0].href} 
                alt={awayTeam.team?.displayName || 'Away Team'}
                className="w-10 h-10 md:w-12 md:h-12 mr-3"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex-1 md:flex-none">
              <h2 className="text-lg md:text-xl font-bold font-oswald">{awayTeam?.team?.location || awayTeam?.team?.displayName || 'Away Team'}</h2>
              <p className="text-gray-600 font-roboto-condensed text-lg">{awayTeam?.team?.name || awayTeam?.team?.shortDisplayName || ''}</p>
              {getTeamRecord(awayTeam) && (
                <p className="text-gray-500 font-roboto-condensed text-sm mt-1">{getTeamRecord(awayTeam)}</p>
              )}
            </div>
            <div className="ml-auto md:ml-4 text-2xl md:text-3xl font-bold font-roboto-mono">
              {awayTeam?.score || '0'}
            </div>
          </div>

          {/* VS */}
          <div className="mx-2 md:mx-4 text-gray-400 font-bold text-sm md:text-base">VS</div>

          {/* Home Team */}
          <div className="flex items-center ml-0 md:ml-8 w-full md:w-auto cursor-pointer hover:opacity-75 transition-opacity" onClick={() => sport.toLowerCase() === 'nfl' ? handleNFLTeamClick(homeTeam?.team) : onTeamClick(homeTeam?.team || formatTeamForModal(homeTeam?.team))}>
            {(homeTeam?.team?.logo || homeTeam?.team?.logos?.[0]?.href) && (
              <img 
                src={homeTeam.team.logo || homeTeam.team.logos[0].href} 
                alt={homeTeam.team?.displayName || 'Home Team'}
                className="w-10 h-10 md:w-12 md:h-12 mr-3"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            <div className="flex-1 md:flex-none">
              <h2 className="text-lg md:text-xl font-bold font-oswald">{homeTeam?.team?.location || homeTeam?.team?.displayName || 'Home Team'}</h2>
              <p className="text-gray-600 font-roboto-condensed text-lg">{homeTeam?.team?.name || homeTeam?.team?.shortDisplayName || ''}</p>
              {getTeamRecord(homeTeam) && (
                <p className="text-gray-500 font-roboto-condensed text-sm mt-1">{getTeamRecord(homeTeam)}</p>
              )}
            </div>
            <div className="ml-auto md:ml-4 text-2xl md:text-3xl font-bold font-roboto-mono">
              {homeTeam?.score || '0'}
            </div>
          </div>
        </div>

        {/* Game Status */}
        <div className="text-center">
          <p className="text-base md:text-lg font-medium font-roboto-condensed">{String(header?.competitions?.[0]?.status?.type?.detail || 'Game Status')}</p>
          {gameInfo?.venue && (
            <p className="text-gray-600 font-roboto-condensed text-sm md:text-base">
              {String(gameInfo.venue.fullName || 'Stadium')}
              {gameInfo.venue.address?.city ? ` • ${String(gameInfo.venue.address.city)}` : ''}
            </p>
          )}
        </div>

        {/* Close Button */}
        <div className="text-center mt-4 mb-6">
          <button
            onClick={onClose}
            style={{ backgroundColor: colors.bg === 'orange' ? '#ea580c' : '#2563eb' }}
            className="px-6 py-2 text-white rounded-md hover:opacity-90 transition-opacity font-medium"
            aria-label="Close modal"
          >
            Close
          </button>
        </div>
      </div>

      {/* Team Stats - Full width centered section */}
      {boxscore?.teams && Array.isArray(boxscore.teams) && boxscore.teams.length > 0 && (
        <div className="flex justify-center">
          <div className="bg-gray-50 rounded-lg p-4 mb-4 border border-gray-300 w-full" style={{maxWidth: '900px'}}>
            <h3 className="text-lg font-semibold mb-3 font-oswald">Team Stats</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 pr-6">Team</th>
                    {Array.isArray(boxscore.teams[0]?.statistics) && reorderStats(boxscore.teams[0].statistics).map((stat, idx) => (
                      <th key={idx} className="text-center px-3 py-2 whitespace-nowrap">
                        {sport.toLowerCase() === 'nba' 
                          ? getStatLabel(stat?.name || stat?.abbreviation || `Stat ${idx + 1}`)
                          : (stat?.abbreviation || stat?.name || `Stat ${idx + 1}`)
                        }
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {boxscore.teams.map((team, idx) => {
                    const reorderedTeamStats = reorderStats(team?.statistics);
                    return (
                      <tr key={idx} className="border-b">
                        <td className="py-2 pr-6">
                          <div className="flex items-center gap-2">
                            {team?.team?.logo && (
                              <img 
                                src={team.team.logo} 
                                alt={team.team?.name || 'Team'} 
                                className="w-6 h-6 flex-shrink-0"
                                onError={(e) => { e.target.style.display = 'none'; }}
                              />
                            )}
                            <span className="font-medium">{team?.team?.abbreviation || 'Team'}</span>
                          </div>
                        </td>
                        {Array.isArray(reorderedTeamStats) && reorderedTeamStats.map((stat, statIdx) => (
                          <td key={statIdx} className="text-center px-3 py-2">{stat?.displayValue || stat?.value || 'N/A'}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
            {/* Win Probability - Only show for live games */}
        {winprobability && Array.isArray(winprobability) && winprobability.length > 0 && 
         header?.competitions?.[0]?.status?.type?.state === 'in' && (
          <div className="flex justify-center mb-4">
            <div className="bg-gray-50 rounded-lg p-4 w-full border border-gray-300" style={{maxWidth: '400px'}}>
              <h3 className="text-lg font-semibold mb-4 text-center">Win Probability</h3>
              <div className="flex flex-col gap-4">
                {/* Get the last win probability entry (current game state) */}
                {(() => {
                  const lastProb = winprobability[winprobability.length - 1];
                  // Win Probability: homeWinPercentage and awayWinPercentage are 0-1 scale (multiply by 100 for percentage)
                  let awayPct = 'N/A';
                  let homePct = 'N/A';
                  
                  if (lastProb?.homeWinPercentage !== undefined) {
                    homePct = Math.round(lastProb.homeWinPercentage * 100);
                    // If away percentage missing, calculate as inverse of home
                    if (lastProb?.awayWinPercentage !== undefined) {
                      awayPct = Math.round(lastProb.awayWinPercentage * 100);
                    } else {
                      awayPct = Math.round((1 - lastProb.homeWinPercentage) * 100);
                    }
                  } else if (lastProb?.awayWinPercentage !== undefined) {
                    awayPct = Math.round(lastProb.awayWinPercentage * 100);
                    homePct = Math.round((1 - lastProb.awayWinPercentage) * 100);
                  }
                  
                  return (
                    <>
                      {/* Away Team Win Probability */}
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center">
                          {(awayTeam?.team?.logo || awayTeam?.team?.logos?.[0]?.href) && (
                            <img 
                              src={awayTeam.team.logo || awayTeam.team.logos[0].href} 
                              alt={awayTeam.team?.displayName || 'Away Team'} 
                              className="w-6 h-6 mr-2"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="font-medium">{awayTeam?.team?.abbreviation || 'Away'}</span>
                        </div>
                        <div className="text-xl font-bold">
                          {awayPct !== 'N/A' ? `${awayPct}%` : 'N/A'}
                        </div>
                      </div>
                      
                      {/* Home Team Win Probability */}
                      <div className="flex justify-between items-center py-3">
                        <div className="flex items-center">
                          {(homeTeam?.team?.logo || homeTeam?.team?.logos?.[0]?.href) && (
                            <img 
                              src={homeTeam.team.logo || homeTeam.team.logos[0].href} 
                              alt={homeTeam.team?.displayName || 'Home Team'} 
                              className="w-6 h-6 mr-2"
                              onError={(e) => { e.target.style.display = 'none'; }}
                            />
                          )}
                          <span className="font-medium">{homeTeam?.team?.abbreviation || 'Home'}</span>
                        </div>
                        <div className="text-xl font-bold">
                          {homePct !== 'N/A' ? `${homePct}%` : 'N/A'}
                        </div>
                      </div>
                    </>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

      {/* Stats Sections - Game Info and Betting Lines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Game Information */}
        {gameInfo && (
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-300">
            <h3 className="text-lg font-semibold mb-3">Game Information</h3>
            <div className="space-y-2 text-sm">
              {gameInfo.attendance && (
                <p><span className="font-medium">Attendance:</span> {String(gameInfo.attendance).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}</p>
              )}
              {/* Show game date and time */}
              {header?.competitions?.[0]?.date && (
                <p><span className="font-medium">Game Time:</span> {new Date(header.competitions[0].date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit'
                })}</p>
              )}
              {/* Show season info */}
              {header?.season && (
                <p><span className="font-medium">Season:</span> {header.season.year} {header.season.type === 2 ? 'Regular Season' : header.season.type === 3 ? 'Playoffs' : 'Preseason'}</p>
              )}
              {/* Show week if available */}
              {header?.week && (
                <p><span className="font-medium">Week:</span> {header.week}</p>
              )}
              {/* Only show weather if it has meaningful data */}
              {gameInfo.weather && gameInfo.weather.displayValue && gameInfo.weather.displayValue !== '[object Object]' && (
                <p><span className="font-medium">Weather:</span> {gameInfo.weather.displayValue}</p>
              )}
              {/* Show temperature if available */}
              {gameInfo.weather && gameInfo.weather.temperature && (
                <p><span className="font-medium">Temperature:</span> {gameInfo.weather.temperature}°F</p>
              )}
              {gameInfo.officials && Array.isArray(gameInfo.officials) && gameInfo.officials.length > 0 && (
                <div>
                  <p className="font-medium">Officials:</p>
                  <ul className="ml-4">
                    {gameInfo.officials.map((official, idx) => (
                      <li key={idx}>
                        {String(official?.position?.name || official?.position || 'Official')}: {String(official?.displayName || official?.name || 'N/A')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Betting Odds / Spreads */}
        {(bettingLines.length > 0 || sport.toLowerCase() === 'nfl') && (
          <div className="flex justify-center">
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-300 w-full" style={{maxWidth: '400px'}}>
            <h3 className="text-lg font-semibold mb-3">Pre-Game Betting Lines</h3>
            {bettingLines.length > 0 ? (
            <div className="space-y-3">
              {bettingLines.map((provider, idx) => (
                <div key={idx} className="border rounded p-4 bg-white">
                  <div className="text-sm font-semibold text-gray-700 mb-3">
                    {provider?.provider?.name || `Sportsbook ${idx + 1}`}
                  </div>
                  <div className="space-y-3">
                    {/* Spread */}
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="text-xs mb-4 text-gray-500 font-medium">Spread</div>
                        <div className="text-sm text-gray-700 font-medium">{homeTeam?.team?.abbreviation || 'H'}</div>
                      </div>
                      <div className="text-lg font-semibold">
                        {provider?.spread !== undefined && provider.spread !== null
                          ? provider.spread !== 0 
                            ? (provider.spread > 0 ? '+' : '') + provider.spread 
                            : 'PK'
                          : '-'}
                      </div>
                    </div>
                    
                    {/* Over/Under */}
                    <div className="flex justify-between items-center border-t pt-3">
                      <div className="text-xs text-gray-500 font-medium">O/U</div>
                      <div className="text-lg font-semibold">
                        {provider?.overUnder !== undefined && provider.overUnder !== null
                          ? provider.overUnder
                          : '-'}
                      </div>
                    </div>
                    
                    {/* Moneyline Home */}
                    <div className="flex justify-between items-center border-t pt-3">
                      <div>
                        <div className="text-xs mb-4 text-gray-500 font-medium">Moneyline</div>
                        <div className="text-sm text-gray-700 font-medium">{homeTeam?.team?.abbreviation || 'H'}</div>
                      </div>
                      <div className="text-lg font-semibold">
                        {provider?.homeTeamOdds?.moneyLine !== undefined
                          ? (provider.homeTeamOdds.moneyLine > 0 ? '+' : '') + provider.homeTeamOdds.moneyLine
                          : '-'}
                      </div>
                    </div>
                    
                    {/* Moneyline Away */}
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-700 font-medium">{awayTeam?.team?.abbreviation || 'A'}</div>
                      <div className="text-lg font-semibold">
                        {provider?.awayTeamOdds?.moneyLine !== undefined
                          ? (provider.awayTeamOdds.moneyLine > 0 ? '+' : '') + provider.awayTeamOdds.moneyLine
                          : '-'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            ) : (
              <p className="text-sm text-gray-600">No betting lines are currently available for this NFL game.</p>
            )}
            <p className="text-xs text-gray-500 mt-3">Lines from various sportsbooks. Always verify with official source.</p>
            </div>
          </div>
        )}
      </div>



        {/* Drives Summary */}
        {drives && drives.current && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Current Drive</h3>
            <div className="text-sm space-y-1">
              {drives.current.team && (
                <div className="flex items-center mb-2">
                  {drives.current.team.logo && (
                    <img 
                      src={drives.current.team.logo} 
                      alt={drives.current.team.name || 'Team'} 
                      className="w-6 h-6 mr-2"
                      onError={(e) => { e.target.style.display = 'none'; }}
                    />
                  )}
                  <span className="font-medium">{String(drives.current.team.abbreviation || 'Team')} Drive</span>
                </div>
              )}
              <p><span className="font-medium">Plays:</span> {String(drives.current.plays || 0)}</p>
              <p><span className="font-medium">Yards:</span> {String(drives.current.yards || 0)}</p>
              <p><span className="font-medium">Time:</span> {String(drives.current.timeElapsed?.displayValue || drives.current.timeElapsed || 'N/A')}</p>
            </div>
          </div>
        )}

        {/* Broadcasts */}
        {/* Removed: Broadcast Information section to make room for Win Probability */}

      {/* Player Box Score */}
      {boxscore?.players && Array.isArray(boxscore.players) && boxscore.players.some(pg => pg?.statistics?.[0]?.athletes?.length > 0) && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-300">
          <h3 className="text-lg font-semibold mb-3 font-oswald">Player Box Score</h3>
          <div className="overflow-x-auto">
            {boxscore.players.map((playerGroup, groupIdx) => {
              const stats = playerGroup?.statistics?.[0];
              const players = stats?.athletes || [];
              
              if (players.length === 0) return null;
              
              return (
                <div key={groupIdx} className="mb-6">
                  <h4 className="text-sm font-semibold mb-2 text-gray-700">{String(playerGroup?.team?.displayName || 'Team')}</h4>
                  <table className="w-full text-xs md:text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 pr-4">Player</th>
                        {stats?.labels && Array.isArray(stats.labels) && stats.labels.map((label, idx) => (
                          <th key={idx} className="text-center px-2 py-2 whitespace-nowrap text-xs">
                            {label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {players.map((playerEntry, playerIdx) => (
                        <tr 
                          key={playerIdx} 
                          className="border-b hover:bg-gray-100 cursor-pointer transition-colors"
                          onClick={() => {
                            // Get the team info for fetching roster data
                            const teamId = playerGroup?.team?.id || '';
                            onPlayerClick(
                              {
                                id: playerEntry?.athlete?.id,
                                athlete: playerEntry?.athlete,
                                playerGroupIdx: groupIdx
                              },
                              teamId,
                              playerEntry?.stats
                            );
                          }}
                        >
                          <td className="py-2 pr-4">
                            <p className="font-medium">
                              {String(playerEntry?.athlete?.displayName || 'Unknown')}
                              {playerEntry?.athlete?.position?.abbreviation && (
                                <span className="text-xs text-gray-500 ml-2">({String(playerEntry.athlete.position.abbreviation)})</span>
                              )}
                            </p>
                          </td>
                          {Array.isArray(playerEntry?.stats) && playerEntry.stats.map((stat, statIdx) => (
                            <td key={statIdx} className="text-center px-2 py-2 text-xs">{stat || '0'}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Recent News */}
      {news?.articles && Array.isArray(news.articles) && news.articles.length > 0 && (
        <div className="mt-6 bg-gray-50 rounded-lg p-4  border border-gray-300">
          <h3 className="text-lg font-semibold mb-3">Recent News</h3>
          <div className="space-y-3">
            {news.articles.slice(0, 3).map((article, idx) => (
              <div key={idx} className="border-b border-gray-200 pb-3 last:border-b-0">
                <h4 className="font-medium text-sm mb-1">
                  {article?.links?.web?.href ? (
                    <a 
                      href={article.links.web.href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {article?.headline || 'No Title'}
                    </a>
                  ) : (
                    <span>{article?.headline || 'No Title'}</span>
                  )}
                </h4>
                <p className="text-xs text-gray-600">{article?.description || 'No description available.'}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
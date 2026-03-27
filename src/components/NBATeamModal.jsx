import { useState, useEffect } from "react";
import PlayerDetailsModal from "./PlayerDetailsModal";

export default function NBATeamModal({ team, isOpen, onClose, season }) {
  const [roster, setRoster] = useState([]);
  const [teamStats, setTeamStats] = useState([]);
  const [teamRecord, setTeamRecord] = useState(team?.record || '');
  const [loading, setLoading] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [showPlayerModal, setShowPlayerModal] = useState(false);

  // Reset data when team changes
  useEffect(() => {
    if (isOpen && team?.id) {
      setRoster([]);
      setTeamStats([]);
      setTeamRecord(team?.record || '');
      setSelectedPlayer(null);
      setShowPlayerModal(false);
    }
  }, [team?.id, isOpen]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // Fetch team details for stats
      const teamResponse = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team.id}`
      );
      
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        
        // Extract stats from the team data
        if (teamData?.team?.stats) {
          setTeamStats(teamData.team.stats);
        }
        
        // Extract record if available, or construct from stats
        if (teamData?.team?.record) {
          // Handle record.items array structure
          let recordArray = teamData.team.record.items || teamData.team.record;
          if (Array.isArray(recordArray) && recordArray.length > 0) {
            const totalRecord = recordArray.find(rec => rec.type === 'total') || recordArray[0];
            if (totalRecord?.summary) {
              setTeamRecord(totalRecord.summary);
            }
          }
        } else if (teamData?.team?.stats) {
          // Try to construct from stats
          const wins = teamData.team.stats.find(s => s.label === 'Wins')?.displayValue || '0';
          const losses = teamData.team.stats.find(s => s.label === 'Losses')?.displayValue || '0';
          if (wins && losses) {
            setTeamRecord(`${wins}-${losses}`);
          }
        }
      }

      // Fetch roster
      const rosterResponse = await fetch(
        `https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams/${team.id}/roster`
      );
      
      if (rosterResponse.ok) {
        const rosterData = await rosterResponse.json();
        
        if (rosterData?.athletes) {
          setRoster(rosterData.athletes);
        }
      }
    } catch (error) {
      console.error('Error fetching NBA team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer({
      id: player.id,
      athlete: {
        displayName: player.displayName,
        jersey: player.jersey,
        position: player.position,
        headshot: player.headshot,
        college: player.college,
        birth: player.birth
      }
    });
    setShowPlayerModal(true);
  };

  if (!isOpen) return null;

  // Load data when modal opens
  if (roster.length === 0 && !loading) {
    fetchTeamData();
  }

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-orange-600 text-white p-6 border-2 border-gray-300 shadow-md rounded-tl-lg rounded-tr-lg">
          <button
            onClick={onClose}
            className="float-right text-white  bg-black hover:opacity-80 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
          
          <div className="flex items-center gap-4">
            {/* Team Logo */}
            {team.logo && (
              <img 
                src={team.logo}
                alt={team.name}
                className="w-16 h-16 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            )}
            
            {/* Team Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-oswald mb-1">
                {team.name}
              </h1>
              <p className="text-lg font-roboto-condensed">
                {team.abbreviation} • {teamRecord}
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Season Stats */}
          {teamStats.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 font-oswald">Season Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {teamStats.map((stat, idx) => (
                  <div key={idx} className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600 font-roboto-condensed uppercase tracking-wide mb-1">
                      {stat.label}
                    </p>
                    <p className="text-lg md:text-xl font-bold text-orange-600 font-oswald">
                      {stat.displayValue}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <h2 className="text-2xl font-bold mb-4 font-oswald">Roster</h2>
          
          {loading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            </div>
          ) : roster.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {roster.map((player) => (
                <div 
                  key={player.id}
                  onClick={() => handlePlayerClick(player)}
                  className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-lg hover:border-orange-300 transition-all cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    {/* Player Headshot */}
                    {player.headshot?.href ? (
                      <img 
                        src={player.headshot.href}
                        alt={player.displayName}
                        className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                        onError={(e) => { e.target.style.display = 'none'; }}
                      />
                    ) : (
                      <div className="w-12 h-12 bg-orange-200 rounded-lg flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-bold text-orange-800">
                          #{player.jersey || '?'}
                        </span>
                      </div>
                    )}
                    
                    {/* Player Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm md:text-base text-gray-800 truncate font-oswald">
                        {player.displayName}
                      </h3>
                      <p className="text-xs md:text-sm text-gray-600 font-roboto-condensed">
                        #{player.jersey} • {player.position?.abbreviation || player.position?.name || 'N/A'}
                      </p>
                      {player.experience?.years !== undefined && (
                        <p className="text-xs text-gray-500 font-roboto-condensed">
                          {player.experience.years > 0 ? `${player.experience.years} year${player.experience.years !== 1 ? 's' : ''}` : 'Rookie'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-center py-8">No roster data available</p>
          )}
        </div>
      </div>

      {/* Player Details Modal */}
      <PlayerDetailsModal
        isOpen={showPlayerModal}
        onClose={() => {
          setShowPlayerModal(false);
          setSelectedPlayer(null);
        }}
        player={selectedPlayer}
        sport="nba"
        teamId={team.id}
        gameStats={[]}
      />
    </div>
  );
}

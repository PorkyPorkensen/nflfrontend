import React, { useState, useEffect } from 'react';
import PlayerDetailsModal from "./components/PlayerDetailsModal";

const TeamModal = ({ team, isOpen, onClose, season }) => {
  const [teamDetails, setTeamDetails] = useState(null);
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
      setTeamDetails(null);
      setSelectedPlayer(null);
      setShowPlayerModal(false);
    }
  }, [team?.id, isOpen]);

  const fetchTeamData = async () => {
    setLoading(true);
    try {
      // Fetch detailed team information
      const teamResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team.id}`);
      if (teamResponse.ok) {
        const teamData = await teamResponse.json();
        const details = teamData.team || teamData;
        setTeamDetails(details);
        
        // Extract stats if available
        if (details?.stats) {
          setTeamStats(details.stats);
        }
        
        // Extract record
        if (details?.record?.items && Array.isArray(details.record.items)) {
          const totalRecord = details.record.items.find(rec => rec.type === 'total') || details.record.items[0];
          if (totalRecord?.summary) {
            setTeamRecord(totalRecord.summary);
          }
        } else if (team.record) {
          setTeamRecord(team.record);
        }
      }

      // Fetch team roster
      const rosterResponse = await fetch(`https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/${team.id}/roster`);
      if (rosterResponse.ok) {
        const rosterData = await rosterResponse.json();
        
        let rosterArray = [];
        if (rosterData.athletes) {
          rosterArray = rosterData.athletes;
        } else if (rosterData.roster) {
          rosterArray = rosterData.roster;
        } else if (rosterData.items) {
          rosterArray = rosterData.items;
        } else if (Array.isArray(rosterData)) {
          rosterArray = rosterData;
        }
        
        setRoster(rosterArray);
      }
    } catch (error) {
      console.error('Error fetching team data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerClick = (player) => {
    setSelectedPlayer({
      id: player.id || `${player.jersey}-${player.displayName || player.name}`,
      displayName: player.displayName || player.name,
      jersey: player.jersey,
      position: player.position,
      headshot: player.headshot,
      college: player.college,
      birth: player.birth,
      fullPlayerData: player // Pass the full player object for matching
    });
    setShowPlayerModal(true);
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  // Load data when modal opens
  if (roster.length === 0 && !loading) {
    fetchTeamData();
  }



  const formatRecord = () => {
    // First try the record property directly
    if (team.record) return team.record;
    
    // Then try stats array
    if (team.stats) {
      const wins = team.stats.find(s => s.name === 'wins')?.value || 0;
      const losses = team.stats.find(s => s.name === 'losses')?.value || 0;
      const ties = team.stats.find(s => s.name === 'ties')?.value || 0;
      return ties > 0 ? `${wins}-${losses}-${ties}` : `${wins}-${losses}`;
    }
    
    return 'N/A';
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6 border-2 border-gray-300 shadow-md rounded-tl-lg rounded-tr-lg">
          <button
            onClick={onClose}
            className="float-right text-white bg-black hover:opacity-80 text-2xl font-bold leading-none"
            aria-label="Close"
          >
            ×
          </button>
          
          <div className="flex items-center gap-4">
            {/* Team Logo */}
            {team.logo || team.logos?.[0]?.href ? (
              <img 
                src={team.logo || team.logos?.[0]?.href}
                alt={team.name}
                className="w-16 h-16 object-contain"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div className="w-16 h-16 bg-blue-400 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">{team.abbreviation}</span>
              </div>
            )}
            
            {/* Team Info */}
            <div>
              <h1 className="text-3xl md:text-4xl font-bold font-oswald mb-1">
                {team.name}
              </h1>
              <p className="text-lg font-roboto-condensed">
                {team.abbreviation} • Record: <span className="font-roboto-mono">{teamRecord}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Team Details */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4 font-oswald">Team Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 font-roboto-condensed mb-1">Location</p>
                <p className="text-lg font-bold text-blue-600">{typeof team.location === 'string' ? team.location : (team.location?.name || team.name)}</p>
              </div>
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-gray-600 font-roboto-condensed mb-1">Conference</p>
                <p className="text-lg font-bold text-blue-600">{typeof team.conference === 'string' ? team.conference : (team.conference?.name || 'N/A')}</p>
              </div>
              {teamDetails?.venue && (
                <>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 font-roboto-condensed mb-1">Stadium</p>
                    <p className="text-lg font-bold text-blue-600">{teamDetails.venue?.fullName || teamDetails.venue?.name || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <p className="text-sm text-gray-600 font-roboto-condensed mb-1">Capacity</p>
                    <p className="text-lg font-bold text-blue-600">{typeof teamDetails.venue.capacity === 'number' ? teamDetails.venue.capacity.toLocaleString() : 'N/A'}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Season Stats */}
          {teamStats.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4 font-oswald">Season Stats</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {teamStats.map((stat, idx) => {
                  const label = typeof stat.label === 'string' ? stat.label : (typeof stat.displayName === 'string' ? stat.displayName : (typeof stat.name === 'string' ? stat.name : ''));
                  const value = typeof stat.displayValue === 'string' ? stat.displayValue : (typeof stat.value === 'string' ? stat.value : (stat.value !== undefined ? String(stat.value) : 'N/A'));
                  return (
                    <div key={idx} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <p className="text-xs text-gray-600 font-roboto-condensed uppercase tracking-wide mb-1">
                        {label}
                      </p>
                      <p className="text-lg md:text-xl font-bold text-blue-600 font-oswald">
                        {value}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Roster */}
          <div>
            <h2 className="text-2xl font-bold mb-4 font-oswald">Roster</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : roster.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {roster.map((item, index) => {
                  // Handle both flat roster and nested structures
                  const players = item.items || [item];
                  return players.map((player, playerIndex) => (
                    <div 
                      key={`${index}-${playerIndex}`}
                      onClick={() => handlePlayerClick(player)}
                      className="bg-gray-50 p-4 rounded-lg border border-gray-200 hover:shadow-lg hover:border-blue-300 transition-all cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        {/* Player Headshot */}
                        {player.headshot?.href ? (
                          <img 
                            src={player.headshot.href}
                            alt={typeof player.displayName === 'string' ? player.displayName : (typeof player.name === 'string' ? player.name : 'Player')}
                            className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                            onError={(e) => { e.target.style.display = 'none'; }}
                          />
                        ) : (
                          <div className="w-12 h-12 bg-blue-200 rounded-lg flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-blue-800">
                              #{player.jersey || '?'}
                            </span>
                          </div>
                        )}
                        
                        {/* Player Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm md:text-base text-gray-800 truncate font-oswald">
                            {typeof player.displayName === 'string' ? player.displayName : (typeof player.name === 'string' ? player.name : '')}
                          </h3>
                          <p className="text-xs md:text-sm text-gray-600 font-roboto-condensed">
                            #{player.jersey || '?'} • {typeof player.position === 'string' ? player.position : (player.position?.abbreviation || player.position?.name || 'N/A')}
                          </p>
                          {(player.college || player.experience?.years !== undefined) && (
                            <p className="text-xs text-gray-500 font-roboto-condensed">
                              {typeof player.college === 'string' ? player.college : (player.college?.name || '')}
                              {(typeof player.college === 'string' ? player.college : player.college?.name) && player.experience?.years !== undefined ? ' • ' : ''}
                              {player.experience?.years !== undefined ? (player.experience.years > 0 ? `${player.experience.years} yr${player.experience.years !== 1 ? 's' : ''}` : 'Rookie') : ''}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ));
                })}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-8">No roster data available</p>
            )}
          </div>
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
        sport="nfl"
        teamId={team.id}
        gameStats={[]}
      />
    </div>
  );
};

export default TeamModal;
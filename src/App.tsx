import { useState, useEffect } from 'react';
import { BoxSection, TeamCaptainSection, TeamSection, ScoreInputModal, PlayerSelector, MenuComponent } from './components';
import type { Player, GameSession, TeamPlayerData } from './types';
import { playerService } from './services/PlayerService';
import { sessionService } from './services/SessionService';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const [teamData, setTeamData] = useState<TeamPlayerData[]>([]);
  
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  useEffect(() => {
    loadPlayersAndSession();
  }, []);

  const loadPlayersAndSession = () => {
    const allPlayers = playerService.getAllPlayers();
    setPlayers(allPlayers);

    let currentSession = sessionService.getCurrentSession();
    if (!currentSession || currentSession.isComplete) {
      currentSession = sessionService.createNewSession();
    }
    setSession(currentSession);

    if (currentSession.gameMode === 'game') {
      updateTeamData(currentSession);
    }
  };

  const updateTeamData = (currentSession: GameSession) => {
    const teamData: TeamPlayerData[] = currentSession.teamPlayerIds.map((playerId, index) => ({
      id: index + 1,
      playerId,
      sittingOut: currentSession.playersSittingOut[playerId] || false
    }));
    setTeamData(teamData);
  };

  const refreshPlayers = () => {
    const allPlayers = playerService.getAllPlayers();
    setPlayers(allPlayers);
  };

  const canBeginChouette = session?.boxPlayerId && session?.teamCaptainPlayerId;

  const handleBeginChouette = () => {
    if (canBeginChouette && session) {
      const teamPlayerIds = teamData.map(t => t.playerId);
      const updatedSession = sessionService.startGame(
        session, 
        session.boxPlayerId!, 
        session.teamCaptainPlayerId!, 
        teamPlayerIds
      );
      setSession(updatedSession);
      updateTeamData(updatedSession);
    }
  };

  const handleGameComplete = () => {
    setIsScoreModalOpen(true);
  };

  const handleScoreModalCancel = () => {
    setIsScoreModalOpen(false);
  };

  const handleScoreModalSubmit = (scores: { [playerName: string]: number }) => {
    if (!session) return;

    const playerIdToScoreMap: { [playerId: string]: number } = {};
    
    Object.entries(scores).forEach(([playerName, score]) => {
      const player = players.find(p => p.name === playerName);
      if (player) {
        playerIdToScoreMap[player.id] = score;
      }
    });

    const updatedSession = sessionService.updateScores(session, playerIdToScoreMap);

    const boxPlayer = players.find(p => p.id === updatedSession.boxPlayerId);
    const teamCaptainPlayer = players.find(p => p.id === updatedSession.teamCaptainPlayerId);
    
    if (!boxPlayer || !teamCaptainPlayer) return;

    const boxScore = playerIdToScoreMap[boxPlayer.id] || 0;
    const teamCaptainScore = playerIdToScoreMap[teamCaptainPlayer.id] || 0;
    
    let newBoxPlayerId = updatedSession.boxPlayerId!;
    let newTeamCaptainPlayerId = updatedSession.teamCaptainPlayerId!;
    let newTeamPlayerIds = [...updatedSession.teamPlayerIds];

    const activeTeamPlayerIds = newTeamPlayerIds.filter(playerId => 
      !updatedSession.playersSittingOut[playerId]
    );
    const inactiveTeamPlayerIds = newTeamPlayerIds.filter(playerId => 
      updatedSession.playersSittingOut[playerId]
    );

    if (boxScore > 0) {
      if (activeTeamPlayerIds.length > 0) {
        const newTeamCaptainId = activeTeamPlayerIds[0];
        newTeamCaptainPlayerId = newTeamCaptainId;
        
        newTeamPlayerIds = activeTeamPlayerIds.slice(1)
          .concat([updatedSession.teamCaptainPlayerId!])
          .concat(inactiveTeamPlayerIds);
      }
    } else if (teamCaptainScore > 0) {
      if (activeTeamPlayerIds.length > 0) {
        newBoxPlayerId = updatedSession.teamCaptainPlayerId!;
        newTeamCaptainPlayerId = activeTeamPlayerIds[0];
        
        newTeamPlayerIds = activeTeamPlayerIds.slice(1)
          .concat([updatedSession.boxPlayerId!])
          .concat(inactiveTeamPlayerIds);
      }
    }

    const finalSession = sessionService.updatePlayerPositions(
      updatedSession, 
      newBoxPlayerId, 
      newTeamCaptainPlayerId, 
      newTeamPlayerIds
    );
    
    setSession(finalSession);
    updateTeamData(finalSession);
    setIsScoreModalOpen(false);
  };

  const handleEndChouette = () => {
    if (!session) return;

    const { finalScores, newSession } = sessionService.endChouette(session);
    
    playerService.updatePlayerScores(finalScores);
    
    setSession(newSession);
    setTeamData([]);
    refreshPlayers();
  };

  const toggleSittingOut = (playerType: 'box' | 'teamCaptain') => {
    if (!session) return;

    const playerId = playerType === 'box' ? session.boxPlayerId : session.teamCaptainPlayerId;
    if (!playerId) return;

    const updatedSession = sessionService.toggleSittingOut(session, playerId);
    setSession(updatedSession);
  };

  const handleBoxPlayerSelect = (playerId: string) => {
    if (!session) return;
    const updatedSession = { ...session, boxPlayerId: playerId || null };
    sessionService.updateSession(updatedSession);
    setSession(updatedSession);
    refreshPlayers();
  };

  const handleTeamCaptainPlayerSelect = (playerId: string) => {
    if (!session) return;
    const updatedSession = { ...session, teamCaptainPlayerId: playerId || null };
    sessionService.updateSession(updatedSession);
    setSession(updatedSession);
    refreshPlayers();
  };

  const handleTeamPlayersChange = (newTeamData: TeamPlayerData[]) => {
    setTeamData(newTeamData);
    if (session) {
      const teamPlayerIds = newTeamData.map(t => t.playerId);
      const updatedSession = { ...session, teamPlayerIds };
      sessionService.updateSession(updatedSession);
      setSession(updatedSession);
    }
  };

  const getPlayerById = (id: string | null): Player | null => {
    if (!id) return null;
    return players.find(p => p.id === id) || null;
  };

  const getTeamPlayers = () => {
    return teamData.map(t => {
      const player = getPlayerById(t.playerId);
      return player ? {
        id: t.id,
        name: player.name,
        score: session?.currentChouetteScores[player.id] || 0,
        sittingOut: t.sittingOut
      } : null;
    }).filter(Boolean) as Array<{
      id: number;
      name: string;
      score: number;
      sittingOut: boolean;
    }>;
  };

  const getPlayerForDisplay = (playerId: string | null) => {
    if (!playerId || !session) return null;
    const player = getPlayerById(playerId);
    if (!player) return null;

    return {
      name: player.name,
      score: session.currentChouetteScores[player.id] || 0,
      sittingOut: session.playersSittingOut[player.id] || false
    };
  };

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen bg-gray-100 p-4 ipad-landscape:p-6">
      <div className="h-full max-w-7xl mx-auto">
        <header className="mb-6 relative">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="absolute top-0 right-0 text-xs text-gray-400 hover:text-gray-600 hover:underline cursor-pointer"
          >
            Clear Storage
          </button>
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Chouette Scoreboard
          </h1>
        </header>
        
        <div className="flex gap-6 h-5/6">
          <div className="w-1/2 flex flex-col gap-4">
            <div className="flex-1">
              {session.gameMode === 'setup' ? (
                <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col justify-center">
                  <div className="text-center">
                    <h2 className="text-sm font-medium text-gray-400 mb-3">BOX</h2>
                    <PlayerSelector
                      players={players}
                      selectedPlayerId={session.boxPlayerId || undefined}
                      onPlayerSelect={handleBoxPlayerSelect}
                      placeholder="Select Box Player"
                      colorScheme="slate"
                    />
                  </div>
                </div>
              ) : (
                <BoxSection 
                  className="h-full" 
                  gameMode={session.gameMode}
                  player={getPlayerForDisplay(session.boxPlayerId)}
                  onToggleSittingOut={() => toggleSittingOut('box')}
                />
              )}
            </div>
            
            <div className="flex items-center justify-center py-2">
              <div className="w-full h-px bg-gray-300"></div>
              <span className="px-4 text-2xl font-bold text-gray-600 bg-gray-100">VS</span>
              <div className="w-full h-px bg-gray-300"></div>
            </div>
            
            <div className="flex-1">
              {session.gameMode === 'setup' ? (
                <div className="bg-white rounded-lg shadow-lg p-6 h-full flex flex-col justify-center">
                  <div className="text-center">
                    <h2 className="text-sm font-medium text-gray-400 mb-3">TEAM CAPTAIN</h2>
                    <PlayerSelector
                      players={players}
                      selectedPlayerId={session.teamCaptainPlayerId || undefined}
                      onPlayerSelect={handleTeamCaptainPlayerSelect}
                      placeholder="Select Team Captain Player"
                      colorScheme="emerald"
                    />
                  </div>
                </div>
              ) : (
                <TeamCaptainSection 
                  className="h-full" 
                  gameMode={session.gameMode}
                  player={getPlayerForDisplay(session.teamCaptainPlayerId)}
                  onToggleSittingOut={() => toggleSittingOut('teamCaptain')}
                />
              )}
            </div>
          </div>
          
          <div className="w-1/2">
            <TeamSection 
              className="h-full" 
              gameMode={session.gameMode}
              teamPlayers={getTeamPlayers()}
              onTeamPlayersChange={handleTeamPlayersChange}
              players={players}
              onPlayersChanged={refreshPlayers}
            />
          </div>
        </div>

        {session.gameMode === 'setup' && canBeginChouette && (
          <button
            onClick={handleBeginChouette}
            className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors touch-manipulation text-xl"
          >
            Begin Chouette
          </button>
        )}
        
        {session.gameMode === 'game' && (
          <>
            <MenuComponent onEndChouette={handleEndChouette} />
            <button
              onClick={handleGameComplete}
              className="fixed bottom-8 right-8 bg-orange-500 hover:bg-orange-600 text-white py-4 px-4 rounded-full shadow-lg transition-colors touch-manipulation text-4xl w-16 h-16 flex items-center justify-center"
            >
              +
            </button>
          </>
        )}

        <ScoreInputModal
          isOpen={isScoreModalOpen}
          boxPlayer={getPlayerForDisplay(session.boxPlayerId)}
          captainPlayer={getPlayerForDisplay(session.teamCaptainPlayerId)}
          queuePlayers={getTeamPlayers()}
          onCancel={handleScoreModalCancel}
          onSubmit={handleScoreModalSubmit}
        />
      </div>
    </div>
  );
}

export default App;
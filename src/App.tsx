import { useState, useEffect, useCallback } from 'react';
import { BoxSection, TeamCaptainSection, TeamSection, ScoreInputModal, PlayerSelector, MenuComponent } from './components';
import type { Player, GameSession, TeamPlayerData } from './types';
import { playerService } from './services/PlayerService';
import { sessionService } from './services/SessionService';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const [teamData, setTeamData] = useState<TeamPlayerData[]>([]);
  
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMenuExpanded, setIsMenuExpanded] = useState(false);

  const loadPlayersAndSession = useCallback(() => {
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
  }, []);

  useEffect(() => {
    loadPlayersAndSession();
  }, [loadPlayersAndSession]);

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

  const handleMenuExpandedChange = (expanded: boolean) => {
    setIsMenuExpanded(expanded);
    setIsSidebarExpanded(expanded);
  };

  const handleScoreModalCancel = () => {
    setIsScoreModalOpen(false);
  };

  const handleScoreModalSubmit = (scores: { [playerName: string]: number }, finalSittingOutState?: { [playerName: string]: boolean }) => {
    if (!session) return;

    const playerIdToScoreMap: { [playerId: string]: number } = {};
    
    Object.entries(scores).forEach(([playerName, score]) => {
      const player = players.find(p => p.name === playerName);
      if (player) {
        playerIdToScoreMap[player.id] = score;
      }
    });

    // Apply absolute sitting out state - CRITICAL: This must happen before rotation logic
    const sessionWithSittingOutChanges = { ...session };
    
    if (finalSittingOutState && Object.keys(finalSittingOutState).length > 0) {
      // Apply absolute sitting out state for all players
      sessionWithSittingOutChanges.playersSittingOut = { ...session.playersSittingOut };
      
      Object.entries(finalSittingOutState).forEach(([playerName, isSittingOut]) => {
        const player = players.find(p => p.name === playerName);
        if (player) {
          sessionWithSittingOutChanges.playersSittingOut[player.id] = isSittingOut;
        }
      });
      
      // Save the session with sitting out state
      sessionService.updateSession(sessionWithSittingOutChanges);
    }

    const updatedSession = sessionService.updateScores(sessionWithSittingOutChanges, playerIdToScoreMap);

    const boxPlayer = players.find(p => p.id === updatedSession.boxPlayerId);
    const teamCaptainPlayer = players.find(p => p.id === updatedSession.teamCaptainPlayerId);
    
    if (!boxPlayer || !teamCaptainPlayer) return;

    const boxScore = playerIdToScoreMap[boxPlayer.id] || 0;
    const teamCaptainScore = playerIdToScoreMap[teamCaptainPlayer.id] || 0;
    
    let newBoxPlayerId = updatedSession.boxPlayerId!;
    let newTeamCaptainPlayerId = updatedSession.teamCaptainPlayerId!;
    let newTeamPlayerIds = [...updatedSession.teamPlayerIds];

    // Separate active and sitting out players while preserving original positions
    const activeTeamPlayerIds = newTeamPlayerIds.filter(playerId => 
      !updatedSession.playersSittingOut[playerId]
    );
    
    // Create a map of original positions for sitting out players
    const sittingOutPositions = new Map<string, number>();
    newTeamPlayerIds.forEach((playerId, index) => {
      if (updatedSession.playersSittingOut[playerId]) {
        sittingOutPositions.set(playerId, index);
      }
    });

    if (boxScore > 0) {
      // Box won - Team Captain becomes Box, first active team player becomes Captain
      if (activeTeamPlayerIds.length > 0) {
        const newTeamCaptainId = activeTeamPlayerIds[0];
        newTeamCaptainPlayerId = newTeamCaptainId;
        
        // Rebuild the team list preserving sitting out players in original positions
        newTeamPlayerIds = rebuildTeamListSimple(
          activeTeamPlayerIds.slice(1), // remaining active team players
          [updatedSession.teamCaptainPlayerId!], // old captain goes to team
          sittingOutPositions
        );
      }
    } else if (teamCaptainScore > 0) {
      // Team won - Team Captain becomes Box, first active team member becomes Captain
      if (activeTeamPlayerIds.length > 0) {
        newBoxPlayerId = updatedSession.teamCaptainPlayerId!;
        
        const newTeamCaptainId = activeTeamPlayerIds[0];
        newTeamCaptainPlayerId = newTeamCaptainId;
        
        // Rebuild the team list preserving sitting out players in original positions
        newTeamPlayerIds = rebuildTeamListSimple(
          activeTeamPlayerIds.slice(1), // remaining active team players after captain
          [updatedSession.boxPlayerId!], // old box goes to team
          sittingOutPositions
        );
      }
    }

    // Helper function that rebuilds team list while preserving sitting out players in original positions
    function rebuildTeamListSimple(
      remainingActivePlayers: string[],
      newActivePlayersToAdd: string[],
      sittingOutPositions: Map<string, number>
    ): string[] {
      const originalLength = updatedSession.teamPlayerIds.length;
      const result: string[] = [];
      
      // Build the active player queue: remaining + new additions
      const activePlayerQueue = [...remainingActivePlayers, ...newActivePlayersToAdd];
      let activeIndex = 0;
      
      // Go through each original position and either place sitting out player or next active player
      for (let position = 0; position < originalLength; position++) {
        // Check if this position has a sitting out player
        const sittingOutPlayerId = Array.from(sittingOutPositions.entries()).find(([, pos]) => pos === position)?.[0];
        
        if (sittingOutPlayerId) {
          // Keep the sitting out player in their original position
          result[position] = sittingOutPlayerId;
        } else if (activeIndex < activePlayerQueue.length) {
          // Fill with next active player
          result[position] = activePlayerQueue[activeIndex];
          activeIndex++;
        }
      }
      
      // Add any remaining active players to the end
      while (activeIndex < activePlayerQueue.length) {
        result.push(activePlayerQueue[activeIndex]);
        activeIndex++;
      }
      
      return result.filter(id => id);
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
    <div className="h-screen bg-gray-100">
      <div 
        className={`h-full bg-gray-100 transition-all duration-300 ${
          session.gameMode === 'game' 
            ? isSidebarExpanded 
              ? 'ml-64 pl-4 pr-4' 
              : 'ml-16 pl-4 pr-4'
            : 'pl-4 pr-4'
        } ipad-landscape:pl-6 ipad-landscape:pr-6`}
        style={{
          width: session.gameMode === 'game' 
            ? isSidebarExpanded 
              ? 'calc(100vw - 256px)' 
              : 'calc(100vw - 64px)'
            : '100vw'
        }}
      >
        <header className="mb-6">
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
                  onToggleSittingOut={undefined}
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
                  onToggleSittingOut={undefined}
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

        {/* Clear Storage - Development utility positioned outside main grid */}
        <div className="mt-4 text-right">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="text-xs text-gray-400 hover:text-gray-600 hover:underline cursor-pointer"
          >
            Clear Storage
          </button>
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
          <MenuComponent 
            onEndChouette={handleEndChouette} 
            onAddGame={handleGameComplete}
            onExpandedChange={handleMenuExpandedChange}
            isExpanded={isMenuExpanded}
          />
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
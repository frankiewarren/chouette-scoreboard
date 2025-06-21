import { useState, useEffect } from 'react';
import { BoxSection, CaptainSection, QueueSection, ScoreInputModal, PlayerSelector, MenuComponent } from './components';
import type { Player, GameSession, QueuePlayerData } from './types';
import { playerService } from './services/PlayerService';
import { sessionService } from './services/SessionService';

function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [session, setSession] = useState<GameSession | null>(null);
  const [queueData, setQueueData] = useState<QueuePlayerData[]>([]);
  
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
      updateQueueData(currentSession);
    }
  };

  const updateQueueData = (currentSession: GameSession) => {
    const queueData: QueuePlayerData[] = currentSession.queuePlayerIds.map((playerId, index) => ({
      id: index + 1,
      playerId,
      sittingOut: currentSession.playersSittingOut[playerId] || false
    }));
    setQueueData(queueData);
  };

  const refreshPlayers = () => {
    const allPlayers = playerService.getAllPlayers();
    setPlayers(allPlayers);
  };

  const canBeginChouette = session?.boxPlayerId && session?.captainPlayerId;

  const handleBeginChouette = () => {
    if (canBeginChouette && session) {
      const queuePlayerIds = queueData.map(q => q.playerId);
      const updatedSession = sessionService.startGame(
        session, 
        session.boxPlayerId!, 
        session.captainPlayerId!, 
        queuePlayerIds
      );
      setSession(updatedSession);
      updateQueueData(updatedSession);
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
    const captainPlayer = players.find(p => p.id === updatedSession.captainPlayerId);
    
    if (!boxPlayer || !captainPlayer) return;

    const boxScore = playerIdToScoreMap[boxPlayer.id] || 0;
    const captainScore = playerIdToScoreMap[captainPlayer.id] || 0;
    
    let newBoxPlayerId = updatedSession.boxPlayerId!;
    let newCaptainPlayerId = updatedSession.captainPlayerId!;
    let newQueuePlayerIds = [...updatedSession.queuePlayerIds];

    const activeQueuePlayerIds = newQueuePlayerIds.filter(playerId => 
      !updatedSession.playersSittingOut[playerId]
    );
    const inactiveQueuePlayerIds = newQueuePlayerIds.filter(playerId => 
      updatedSession.playersSittingOut[playerId]
    );

    if (boxScore > 0) {
      if (activeQueuePlayerIds.length > 0) {
        const newCaptainId = activeQueuePlayerIds[0];
        newCaptainPlayerId = newCaptainId;
        
        newQueuePlayerIds = activeQueuePlayerIds.slice(1)
          .concat([updatedSession.captainPlayerId!])
          .concat(inactiveQueuePlayerIds);
      }
    } else if (captainScore > 0) {
      if (activeQueuePlayerIds.length > 0) {
        newBoxPlayerId = updatedSession.captainPlayerId!;
        newCaptainPlayerId = activeQueuePlayerIds[0];
        
        newQueuePlayerIds = activeQueuePlayerIds.slice(1)
          .concat([updatedSession.boxPlayerId!])
          .concat(inactiveQueuePlayerIds);
      }
    }

    const finalSession = sessionService.updatePlayerPositions(
      updatedSession, 
      newBoxPlayerId, 
      newCaptainPlayerId, 
      newQueuePlayerIds
    );
    
    setSession(finalSession);
    updateQueueData(finalSession);
    setIsScoreModalOpen(false);
  };

  const handleEndChouette = () => {
    if (!session) return;

    const { finalScores, newSession } = sessionService.endChouette(session);
    
    playerService.updatePlayerScores(finalScores);
    
    setSession(newSession);
    setQueueData([]);
    refreshPlayers();
  };

  const toggleSittingOut = (playerType: 'box' | 'captain') => {
    if (!session) return;

    const playerId = playerType === 'box' ? session.boxPlayerId : session.captainPlayerId;
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

  const handleCaptainPlayerSelect = (playerId: string) => {
    if (!session) return;
    const updatedSession = { ...session, captainPlayerId: playerId || null };
    sessionService.updateSession(updatedSession);
    setSession(updatedSession);
    refreshPlayers();
  };

  const handleQueuePlayersChange = (newQueueData: QueuePlayerData[]) => {
    setQueueData(newQueueData);
    if (session) {
      const queuePlayerIds = newQueueData.map(q => q.playerId);
      const updatedSession = { ...session, queuePlayerIds };
      sessionService.updateSession(updatedSession);
      setSession(updatedSession);
    }
  };

  const getPlayerById = (id: string | null): Player | null => {
    if (!id) return null;
    return players.find(p => p.id === id) || null;
  };

  const getQueuePlayers = () => {
    return queueData.map(q => {
      const player = getPlayerById(q.playerId);
      return player ? {
        id: q.id,
        name: player.name,
        score: session?.currentChouetteScores[player.id] || 0,
        sittingOut: q.sittingOut
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
            className="absolute top-0 left-0 text-xs text-gray-400 hover:text-gray-600 hover:underline cursor-pointer"
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
                    <h2 className="text-lg font-semibold text-gray-600 mb-4">BOX</h2>
                    <PlayerSelector
                      players={players}
                      selectedPlayerId={session.boxPlayerId || undefined}
                      onPlayerSelect={handleBoxPlayerSelect}
                      placeholder="Select Box Player"
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
                    <h2 className="text-lg font-semibold text-gray-600 mb-4">CAPTAIN</h2>
                    <PlayerSelector
                      players={players}
                      selectedPlayerId={session.captainPlayerId || undefined}
                      onPlayerSelect={handleCaptainPlayerSelect}
                      placeholder="Select Captain Player"
                    />
                  </div>
                </div>
              ) : (
                <CaptainSection 
                  className="h-full" 
                  gameMode={session.gameMode}
                  player={getPlayerForDisplay(session.captainPlayerId)}
                  onToggleSittingOut={() => toggleSittingOut('captain')}
                />
              )}
            </div>
          </div>
          
          <div className="w-1/2">
            <QueueSection 
              className="h-full" 
              gameMode={session.gameMode}
              queuePlayers={getQueuePlayers()}
              onQueuePlayersChange={handleQueuePlayersChange}
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
              className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors touch-manipulation text-xl"
            >
              Game Complete
            </button>
          </>
        )}

        <ScoreInputModal
          isOpen={isScoreModalOpen}
          boxPlayer={getPlayerForDisplay(session.boxPlayerId)}
          captainPlayer={getPlayerForDisplay(session.captainPlayerId)}
          queuePlayers={getQueuePlayers()}
          onCancel={handleScoreModalCancel}
          onSubmit={handleScoreModalSubmit}
        />
      </div>
    </div>
  );
}

export default App;
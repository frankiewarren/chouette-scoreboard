import { useState } from 'react';
import { BoxSection, CaptainSection, QueueSection, ScoreInputModal } from './components'

type GameMode = 'setup' | 'game';

interface Player {
  name: string;
  score: number;
  sittingOut: boolean;
}

interface QueuePlayer {
  id: number;
  name: string;
  score: number;
  sittingOut: boolean;
}

function App() {
  const [gameMode, setGameMode] = useState<GameMode>('setup');
  const [boxPlayerName, setBoxPlayerName] = useState<string>("");
  const [captainPlayerName, setCaptainPlayerName] = useState<string>("");
  
  // Game mode state
  const [boxPlayer, setBoxPlayer] = useState<Player | null>(null);
  const [captainPlayer, setCaptainPlayer] = useState<Player | null>(null);
  const [queuePlayers, setQueuePlayers] = useState<QueuePlayer[]>([]);
  
  // Modal state
  const [isScoreModalOpen, setIsScoreModalOpen] = useState(false);

  const canBeginChouette = boxPlayerName && captainPlayerName;

  const handleBeginChouette = () => {
    if (canBeginChouette) {
      // Initialize players with scores
      setBoxPlayer({
        name: boxPlayerName,
        score: 0,
        sittingOut: false
      });
      setCaptainPlayer({
        name: captainPlayerName,
        score: 0,
        sittingOut: false
      });
      setGameMode('game');
    }
  };

  const handleGameComplete = () => {
    setIsScoreModalOpen(true);
  };

  const handleScoreModalCancel = () => {
    setIsScoreModalOpen(false);
  };

  const handleScoreModalSubmit = (scores: { [playerName: string]: number }) => {
    console.log('Submitted scores:', scores);
    
    // 1. Update player scores
    const updatedBoxPlayer = boxPlayer ? {
      ...boxPlayer,
      score: boxPlayer.score + (scores[boxPlayer.name] || 0)
    } : null;

    const updatedCaptainPlayer = captainPlayer ? {
      ...captainPlayer,
      score: captainPlayer.score + (scores[captainPlayer.name] || 0)
    } : null;

    const updatedQueuePlayers = queuePlayers.map(player => ({
      ...player,
      score: player.score + (scores[player.name] || 0)
    }));

    // 2. Determine winner and implement rotation logic
    const boxScore = scores[boxPlayer?.name || ''] || 0;
    const captainScore = scores[captainPlayer?.name || ''] || 0;
    
    let newBoxPlayer = updatedBoxPlayer;
    let newCaptainPlayer = updatedCaptainPlayer;
    let newQueuePlayers = [...updatedQueuePlayers];

    // Get active queue players (not sitting out) for rotation
    const activeQueuePlayers = newQueuePlayers.filter(p => !p.sittingOut);
    const inactiveQueuePlayers = newQueuePlayers.filter(p => p.sittingOut);

    if (boxScore > 0) {
      // Box player won: Box stays, Captain moves to back of queue, next queue player becomes Captain
      if (newCaptainPlayer && activeQueuePlayers.length > 0) {
        // Add current captain to back of queue with new ID
        const maxId = Math.max(0, ...newQueuePlayers.map(p => p.id));
        const captainAsQueuePlayer = {
          id: maxId + 1,
          name: newCaptainPlayer.name,
          score: newCaptainPlayer.score,
          sittingOut: false
        };
        
        // Remove first active queue player to become captain
        const newCaptainFromQueue = activeQueuePlayers[0];
        newCaptainPlayer = {
          name: newCaptainFromQueue.name,
          score: newCaptainFromQueue.score,
          sittingOut: false
        };
        
        // Update queue: remove new captain, add old captain to back
        newQueuePlayers = newQueuePlayers
          .filter(p => p.id !== newCaptainFromQueue.id)
          .concat([captainAsQueuePlayer])
          .concat(inactiveQueuePlayers);
      }
    } else if (captainScore > 0) {
      // Captain won: Captain becomes new Box, old Box goes to back of queue, next queue player becomes Captain
      if (newBoxPlayer && newCaptainPlayer && activeQueuePlayers.length > 0) {
        // Captain becomes box
        newBoxPlayer = {
          name: newCaptainPlayer.name,
          score: newCaptainPlayer.score,
          sittingOut: false
        };
        
        // Add old box to back of queue
        const maxId = Math.max(0, ...newQueuePlayers.map(p => p.id));
        const boxAsQueuePlayer = {
          id: maxId + 1,
          name: updatedBoxPlayer!.name,
          score: updatedBoxPlayer!.score,
          sittingOut: false
        };
        
        // Next queue player becomes captain
        const newCaptainFromQueue = activeQueuePlayers[0];
        newCaptainPlayer = {
          name: newCaptainFromQueue.name,
          score: newCaptainFromQueue.score,
          sittingOut: false
        };
        
        // Update queue: remove new captain, add old box to back
        newQueuePlayers = newQueuePlayers
          .filter(p => p.id !== newCaptainFromQueue.id)
          .concat([boxAsQueuePlayer])
          .concat(inactiveQueuePlayers);
      }
    }
    // If neither Box nor Captain won (both have 0 or negative scores), no rotation occurs

    // 3. Update game state
    setBoxPlayer(newBoxPlayer);
    setCaptainPlayer(newCaptainPlayer);
    setQueuePlayers(newQueuePlayers);
    setIsScoreModalOpen(false);
  };

  const toggleSittingOut = (playerType: 'box' | 'captain') => {
    if (playerType === 'box' && boxPlayer) {
      setBoxPlayer({ ...boxPlayer, sittingOut: !boxPlayer.sittingOut });
    } else if (playerType === 'captain' && captainPlayer) {
      setCaptainPlayer({ ...captainPlayer, sittingOut: !captainPlayer.sittingOut });
    }
  };

  return (
    <div className="h-screen bg-gray-100 p-4 ipad-landscape:p-6">
      <div className="h-full max-w-7xl mx-auto">
        <header className="mb-6">
          <h1 className="text-4xl font-bold text-center text-gray-800">
            Chouette Scoreboard
          </h1>
        </header>
        
        {/* Main Layout: True Horizontal Split - 50% Left | 50% Right */}
        <div className="flex gap-6 h-5/6">
          
          {/* Left Half: Current Game (Box + VS + Captain) */}
          <div className="w-1/2 flex flex-col gap-4">
            {/* Box Player - Top of Left Half */}
            <div className="flex-1">
              <BoxSection 
                className="h-full" 
                gameMode={gameMode}
                player={boxPlayer}
                onPlayerAdd={setBoxPlayerName}
                onToggleSittingOut={() => toggleSittingOut('box')}
              />
            </div>
            
            {/* VS Separator */}
            <div className="flex items-center justify-center py-2">
              <div className="w-full h-px bg-gray-300"></div>
              <span className="px-4 text-2xl font-bold text-gray-600 bg-gray-100">VS</span>
              <div className="w-full h-px bg-gray-300"></div>
            </div>
            
            {/* Captain Player - Bottom of Left Half */}
            <div className="flex-1">
              <CaptainSection 
                className="h-full" 
                gameMode={gameMode}
                player={captainPlayer}
                onPlayerAdd={setCaptainPlayerName}
                onToggleSittingOut={() => toggleSittingOut('captain')}
              />
            </div>
          </div>
          
          {/* Right Half: Spectator Queue (Full Height) */}
          <div className="w-1/2">
            <QueueSection 
              className="h-full" 
              gameMode={gameMode}
              queuePlayers={queuePlayers}
              onQueuePlayersChange={setQueuePlayers}
            />
          </div>
        </div>

        {/* Floating Action Button */}
        {gameMode === 'setup' && canBeginChouette && (
          <button
            onClick={handleBeginChouette}
            className="fixed bottom-8 right-8 bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors touch-manipulation text-xl"
          >
            Begin Chouette
          </button>
        )}
        
        {gameMode === 'game' && (
          <button
            onClick={handleGameComplete}
            className="fixed bottom-8 right-8 bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-full shadow-lg transition-colors touch-manipulation text-xl"
          >
            Game Complete
          </button>
        )}

        {/* Score Input Modal */}
        <ScoreInputModal
          isOpen={isScoreModalOpen}
          boxPlayer={boxPlayer}
          captainPlayer={captainPlayer}
          queuePlayers={queuePlayers}
          onCancel={handleScoreModalCancel}
          onSubmit={handleScoreModalSubmit}
        />
      </div>
    </div>
  )
}

export default App

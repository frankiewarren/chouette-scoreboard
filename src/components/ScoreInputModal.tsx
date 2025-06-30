import { useState, useEffect } from 'react';

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

interface ScoreInputModalProps {
  isOpen: boolean;
  boxPlayer: Player | null;
  captainPlayer: Player | null;
  queuePlayers: QueuePlayer[];
  onCancel: () => void;
  onSubmit: (scores: { [playerName: string]: number }, finalSittingOutState?: { [playerName: string]: boolean }) => void;
}

// Doubling cube progression values including gammons (2x) and backgammons (3x)
const CUBE_VALUES = [
  -192, -128, -96, -64, -48, -32, -24, -16, -12, -8, -6, -4, -3, -2, -1,
  1, 2, 3, 4, 6, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192
];
const DEFAULT_VALUE = 1;

export const ScoreInputModal = ({
  isOpen,
  boxPlayer,
  captainPlayer,
  queuePlayers,
  onCancel,
  onSubmit
}: ScoreInputModalProps) => {
  const [scores, setScores] = useState<{ [playerName: string]: number }>({});
  const [sittingOut, setSittingOut] = useState<{ [playerName: string]: boolean }>({});

  // Get all team players (captain + queue players) including sitting out players
  const getTeamPlayers = () => {
    const players = [];
    
    // Team Captain first
    if (captainPlayer) {
      players.push({ 
        name: captainPlayer.name, 
        role: 'Team Captain',
        initialSittingOut: captainPlayer.sittingOut,
        canToggleSittingOut: false // Captain cannot sit out
      });
    }
    
    // Team players in queue order (include all players)
    queuePlayers
      .sort((a, b) => a.id - b.id) // Ensure queue order
      .forEach(player => {
        players.push({ 
          name: player.name, 
          role: `Team #${player.id}`,
          initialSittingOut: player.sittingOut,
          canToggleSittingOut: true // Team players can sit out
        });
      });
    
    return players;
  };

  const teamPlayers = getTeamPlayers();

  // Initialize scores and sitting out state when modal opens
  useEffect(() => {
    if (isOpen) {
      const initialScores: { [playerName: string]: number } = {};
      const initialSittingOut: { [playerName: string]: boolean } = {};
      
      teamPlayers.forEach(player => {
        const inherited = player.initialSittingOut || false;
        // Sitting out players have score locked to 0, active players start with default
        initialScores[player.name] = inherited ? 0 : DEFAULT_VALUE;
        initialSittingOut[player.name] = inherited;
      });
      
      setScores(initialScores);
      setSittingOut(initialSittingOut);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Calculate Box score (negative sum of active team players' scores only)
  const teamScoreSum = Object.entries(scores).reduce((sum, [playerName, score]) => {
    // Only include scores from players who are not sitting out
    return sittingOut[playerName] ? sum : sum + score;
  }, 0);
  const boxScore = -teamScoreSum;

  // Doubling cube navigation functions
  const moveToNextHigherValue = (currentValue: number): number => {
    const currentIndex = CUBE_VALUES.indexOf(currentValue);
    if (currentIndex === -1) return DEFAULT_VALUE;
    return currentIndex < CUBE_VALUES.length - 1 ? CUBE_VALUES[currentIndex + 1] : currentValue;
  };

  const moveToNextLowerValue = (currentValue: number): number => {
    const currentIndex = CUBE_VALUES.indexOf(currentValue);
    if (currentIndex === -1) return DEFAULT_VALUE;
    return currentIndex > 0 ? CUBE_VALUES[currentIndex - 1] : currentValue;
  };

  const toggleSittingOut = (playerName: string) => {
    const player = teamPlayers.find(p => p.name === playerName);
    if (!player || !player.canToggleSittingOut) {
      return; // Don't allow toggle for Box and Captain
    }
    
    setSittingOut(prev => {
      const newSittingOut = !prev[playerName];
      // If player is now sitting out, set their score to 0
      if (newSittingOut) {
        setScores(prevScores => ({
          ...prevScores,
          [playerName]: 0
        }));
      } else {
        // If player is no longer sitting out, set to default value
        setScores(prevScores => ({
          ...prevScores,
          [playerName]: DEFAULT_VALUE
        }));
      }
      return {
        ...prev,
        [playerName]: newSittingOut
      };
    });
  };

  const incrementScore = (playerName: string) => {
    // Don't allow score changes for sitting out players
    if (sittingOut[playerName]) return;
    
    setScores(prev => ({
      ...prev,
      [playerName]: moveToNextHigherValue(prev[playerName] || DEFAULT_VALUE)
    }));
  };

  const decrementScore = (playerName: string) => {
    // Don't allow score changes for sitting out players
    if (sittingOut[playerName]) return;
    
    setScores(prev => ({
      ...prev,
      [playerName]: moveToNextLowerValue(prev[playerName] || DEFAULT_VALUE)
    }));
  };

  const canIncrement = (score: number) => score < 192;
  const canDecrement = (score: number) => score > -192;

  const handleSubmit = () => {
    if (teamPlayers.length > 0 && boxPlayer) {
      // Include Box player score in submission
      const allScores = {
        ...scores,
        [boxPlayer.name]: boxScore
      };
      
      // Send absolute sitting out state for all players
      const finalSittingOutState: { [playerName: string]: boolean } = {};
      teamPlayers.forEach(player => {
        finalSittingOutState[player.name] = sittingOut[player.name];
      });
      
      onSubmit(allScores, finalSittingOutState);
    }
  };

  const handleCancel = () => {
    setScores({});
    setSittingOut({});
    onCancel();
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.75)' }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="p-6 pb-4 flex-shrink-0">
          <h2 className="text-2xl font-bold text-center">Enter Game Score</h2>
        </div>
        
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto px-6 pt-2">
          {teamPlayers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No active team players to score
            </div>
          ) : (
            <>
              {/* Team Players Scoring Section */}
              <div className="space-y-6 mb-8">
                {teamPlayers.map((player) => {
                  const playerScore = scores[player.name] || DEFAULT_VALUE;
                  const isPlayerSittingOut = sittingOut[player.name];
                  
                  return (
                    <div key={player.name} className="flex items-center justify-between">
                      <div className="flex-1 pr-4">
                        <button
                          onClick={() => toggleSittingOut(player.name)}
                          disabled={!player.canToggleSittingOut}
                          className={`text-left w-full ${player.canToggleSittingOut ? 'cursor-pointer hover:bg-gray-50 rounded p-1 -m-1' : 'cursor-not-allowed'}`}
                          type="button"
                        >
                          <div className={`font-semibold text-lg ${isPlayerSittingOut ? 'text-gray-400' : 'text-gray-800'}`}>
                            {player.name}
                            {!player.canToggleSittingOut && isPlayerSittingOut && ' (cannot sit out)'}
                          </div>
                          <div className={`text-sm ${isPlayerSittingOut ? 'text-gray-400' : 'text-gray-500'}`}>
                            {isPlayerSittingOut ? 'Sitting out' : player.role}
                          </div>
                        </button>
                      </div>
                      
                      {/* Score controls - disabled for sitting out players */}
                      <div className="flex items-center gap-3">
                        {isPlayerSittingOut ? (
                          // Locked state for sitting out players
                          <>
                            <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-lg font-bold text-xl flex items-center justify-center">
                              −
                            </div>
                            <div className="w-20 text-center">
                              <div className="text-2xl font-bold text-gray-400">0</div>
                            </div>
                            <div className="w-12 h-12 bg-gray-200 text-gray-400 rounded-lg font-bold text-xl flex items-center justify-center">
                              +
                            </div>
                          </>
                        ) : (
                          // Active controls for playing players
                          <>
                            <button
                              onClick={() => decrementScore(player.name)}
                              disabled={!canDecrement(playerScore)}
                              className="w-12 h-12 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl flex items-center justify-center touch-manipulation transition-colors"
                              type="button"
                            >
                              −
                            </button>
                            
                            <div className="w-20 text-center">
                              <div className="text-2xl font-bold text-gray-800">
                                {playerScore > 0 ? `+${playerScore}` : playerScore}
                              </div>
                            </div>
                            
                            <button
                              onClick={() => incrementScore(player.name)}
                              disabled={!canIncrement(playerScore)}
                              className="w-12 h-12 bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-bold text-xl flex items-center justify-center touch-manipulation transition-colors"
                              type="button"
                            >
                              +
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Box Player Auto-calculated Score Display */}
              {boxPlayer && (
                <div className="mb-6">
                  <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg">
                    <div className="flex-1">
                      <div className="font-semibold text-lg">{boxPlayer.name}</div>
                      <div className="text-sm text-gray-500">
                        Box {boxPlayer.sittingOut ? '(cannot sit out)' : ''}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-slate-700">
                        {boxScore > 0 ? `+${boxScore}` : boxScore}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Fixed action buttons at bottom */}
        <div className="p-6 pt-4 flex-shrink-0">
          <div className="flex gap-4">
            <button
              onClick={handleCancel}
              className="flex-1 py-4 px-4 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-400 transition-colors touch-manipulation text-lg"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={teamPlayers.length === 0 || !boxPlayer}
              className="flex-1 py-4 px-4 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors touch-manipulation text-lg"
            >
              Submit Score
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
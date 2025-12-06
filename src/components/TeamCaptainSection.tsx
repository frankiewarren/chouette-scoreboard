interface Player {
  name: string;
  score: number;
  sittingOut: boolean;
}

interface TeamCaptainSectionProps {
  className?: string;
  player: Player;
  onToggleSittingOut?: () => void;
}

export const TeamCaptainSection = ({
  className = "",
  player,
  onToggleSittingOut
}: TeamCaptainSectionProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 h-full flex flex-col justify-center ${className}`}>
      <div className="text-center">
        <h2 className="text-sm font-medium text-gray-400 mb-3">TEAM CAPTAIN</h2>

        <div
          onClick={onToggleSittingOut}
          className={`w-full rounded-lg p-8 text-2xl font-bold cursor-pointer transition-colors touch-manipulation ${
            player.sittingOut
              ? "bg-gray-400 text-gray-600"
              : "bg-emerald-700 text-white hover:bg-emerald-800"
          }`}
        >
          <div>{player.name}</div>
          <div className="text-lg font-medium mt-2">
            Score: <span className={
              player.score > 0 ? "text-emerald-200" :
              player.score < 0 ? "text-red-200" :
              "text-gray-300"
            }>{player.score}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import { ChevronRight, ChevronLeft, Plus, X } from 'lucide-react';

interface MenuComponentProps {
  onEndChouette: () => void;
  onAddGame: () => void;
}

export const MenuComponent = ({ onEndChouette, onAddGame }: MenuComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEndChouette = () => {
    onEndChouette();
    setIsExpanded(false);
  };

  const handleAddGame = () => {
    onAddGame();
    setIsExpanded(false);
  };

  return (
    <>
      {/* Always visible sidebar - no backdrop overlay */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isExpanded ? 'w-80' : 'w-16'
        }`}
      >
        {/* Toggle button with directional arrows */}
        <button
          onClick={toggleExpanded}
          className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation mt-4 mx-auto border border-gray-200"
        >
          {isExpanded ? (
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          ) : (
            <ChevronRight className="w-5 h-5 text-gray-600" />
          )}
        </button>

        {/* Menu content - only visible when expanded */}
        {isExpanded && (
          <div className="flex flex-col h-full justify-between p-6 pt-8">
            {/* Top section - Add Game */}
            <div className="space-y-4">
              <button
                onClick={handleAddGame}
                className="w-full py-4 px-6 bg-orange-500 text-white rounded-lg font-semibold hover:bg-orange-600 transition-colors touch-manipulation text-lg flex items-center justify-center gap-3"
              >
                <Plus className="w-5 h-5" />
                Add Game
              </button>
            </div>

            {/* Bottom section - End Chouette */}
            <div className="space-y-4 pb-8">
              <button
                onClick={handleEndChouette}
                className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors touch-manipulation text-lg flex items-center justify-center gap-3"
              >
                <X className="w-5 h-5" />
                End Chouette
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
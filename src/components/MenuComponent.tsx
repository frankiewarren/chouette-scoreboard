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
      {/* Always visible sidebar with consistent background */}
      <div 
        className={`fixed top-0 left-0 h-full bg-gray-100 border-r border-gray-200 transition-all duration-300 ease-in-out z-40 ${
          isExpanded ? 'w-64' : 'w-16'
        }`}
      >
        {/* Collapsed State: Vertical stack of functional icons */}
        {!isExpanded && (
          <div className="flex flex-col items-center pt-4 space-y-4">
            {/* Add Game Icon */}
            <button
              onClick={handleAddGame}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
              title="Add Game"
            >
              <Plus className="w-5 h-5 text-gray-600" />
            </button>

            {/* Expand Icon */}
            <button
              onClick={toggleExpanded}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
              title="Expand Menu"
            >
              <ChevronRight className="w-5 h-5 text-gray-600" />
            </button>

            {/* End Chouette Icon */}
            <button
              onClick={handleEndChouette}
              className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
              title="End Chouette"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>
        )}

        {/* Expanded State: Icon + label rows */}
        {isExpanded && (
          <div className="pt-4 px-3">
            {/* Add Game Row */}
            <button
              onClick={handleAddGame}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation text-left"
            >
              <Plus className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Add Game</span>
            </button>

            {/* Collapse Row */}
            <button
              onClick={toggleExpanded}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation text-left mt-1"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">Collapse</span>
            </button>

            {/* End Chouette Row */}
            <button
              onClick={handleEndChouette}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation text-left mt-1"
            >
              <X className="w-5 h-5 text-gray-600" />
              <span className="text-gray-700 font-medium">End Chouette</span>
            </button>
          </div>
        )}
      </div>
    </>
  );
};
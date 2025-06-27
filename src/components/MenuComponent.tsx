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
        {/* Collapsed State: Improved UX layout */}
        {!isExpanded && (
          <div className="flex flex-col h-full pt-4 px-3">
            {/* Top: Expand icon */}
            <div className="flex justify-center">
              <button
                onClick={toggleExpanded}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                title="Expand Menu"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Gap */}
            <div className="mt-2" />

            {/* Menu Section */}
            <div className="space-y-1">
              <div className="flex justify-center">
                <button
                  onClick={handleAddGame}
                  className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                  title="Add Game"
                >
                  <div className="bg-[#C96442] rounded-md p-2">
                    <Plus className="w-4 h-4 text-white" />
                  </div>
                </button>
              </div>
              {/* Future menu items will be added here */}
            </div>

            {/* Spacer to push End to bottom */}
            <div className="flex-1" />

            {/* Bottom: End Chouette - separated to prevent accidental taps */}
            <div className="flex justify-center pb-4">
              <button
                onClick={handleEndChouette}
                className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-200 transition-colors touch-manipulation"
                title="End Chouette"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>
        )}

        {/* Expanded State: Same layout structure with labels */}
        {isExpanded && (
          <div className="flex flex-col h-full pt-4 px-3">
            {/* Top: Collapse */}
            <div>
              <button
                onClick={toggleExpanded}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation text-left"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">Collapse</span>
              </button>
            </div>

            {/* Gap */}
            <div className="mt-2" />

            {/* Menu Section */}
            <div className="space-y-1">
              <button
                onClick={handleAddGame}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation text-left"
              >
                <div className="bg-[#C96442] rounded-md p-2">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <span className="text-[#C96442] font-medium">Add Game</span>
              </button>
              {/* Future menu items will be added here */}
            </div>

            {/* Spacer to push End to bottom */}
            <div className="flex-1" />

            {/* Bottom: End Chouette - pinned to bottom */}
            <div className="pb-4">
              <button
                onClick={handleEndChouette}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-200 transition-colors touch-manipulation text-left"
              >
                <X className="w-5 h-5 text-gray-600" />
                <span className="text-gray-700 font-medium">End Chouette</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
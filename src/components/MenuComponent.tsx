import { useState } from 'react';

interface MenuComponentProps {
  onEndChouette: () => void;
}

export const MenuComponent = ({ onEndChouette }: MenuComponentProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  const handleEndChouette = () => {
    onEndChouette();
    setIsExpanded(false);
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsExpanded(false);
    }
  };

  return (
    <>
      {/* Backdrop - only shows when expanded */}
      {isExpanded && (
        <div 
          className="fixed inset-0 z-30 bg-black bg-opacity-50"
          onClick={handleBackdropClick}
        />
      )}

      {/* Always visible sidebar */}
      <div 
        className={`fixed top-0 left-0 h-full bg-white shadow-xl transition-all duration-300 ease-in-out z-40 ${
          isExpanded ? 'w-80' : 'w-16'
        }`}
      >
        {/* Hamburger button - always visible in sidebar */}
        <button
          onClick={toggleExpanded}
          className="w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation mt-4 mx-auto"
        >
          <div className="w-6 h-6 flex flex-col justify-center items-center">
            <div className="w-full h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-full h-0.5 bg-gray-600 mb-1"></div>
            <div className="w-full h-0.5 bg-gray-600"></div>
          </div>
        </button>

        {/* Menu content - only visible when expanded */}
        {isExpanded && (
          <div className="p-6 pt-8">
            <div className="space-y-4">
              <button
                onClick={handleEndChouette}
                className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors touch-manipulation text-lg"
              >
                End Chouette
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
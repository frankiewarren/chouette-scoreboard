import { useState } from 'react';

interface MenuComponentProps {
  onEndChouette: () => void;
}

export const MenuComponent = ({ onEndChouette }: MenuComponentProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleEndChouette = () => {
    onEndChouette();
    setIsOpen(false);
  };

  const handleOutsideClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setIsOpen(false);
    }
  };

  return (
    <>
      <button
        onClick={toggleMenu}
        className="fixed top-4 right-4 z-50 w-12 h-12 bg-white rounded-lg shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors touch-manipulation"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <div className="w-full h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-full h-0.5 bg-gray-600 mb-1"></div>
          <div className="w-full h-0.5 bg-gray-600"></div>
        </div>
      </button>

      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={handleOutsideClick}
        >
          <div 
            className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
              isOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6 pt-20">
              <div className="space-y-4">
                <button
                  onClick={handleEndChouette}
                  className="w-full py-4 px-6 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors touch-manipulation text-lg"
                >
                  End Chouette
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
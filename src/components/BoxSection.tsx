interface BoxSectionProps {
  className?: string;
}

export const BoxSection = ({ className = "" }: BoxSectionProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Box & Captain</h2>
      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
          Box Player
        </div>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center text-gray-500">
          Captain
        </div>
      </div>
    </div>
  );
};
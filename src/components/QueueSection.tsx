interface QueueSectionProps {
  className?: string;
}

export const QueueSection = ({ className = "" }: QueueSectionProps) => {
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <h2 className="text-2xl font-bold mb-4">Queue</h2>
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map((i) => (
          <div 
            key={i} 
            className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center text-gray-500"
          >
            Player {i}
          </div>
        ))}
      </div>
    </div>
  );
};
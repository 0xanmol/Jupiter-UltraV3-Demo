'use client';

interface FeatureBadgeProps {
  icon: React.ReactNode;
  label: string;
  description: string;
  stat?: string;
  color?: 'green' | 'blue' | 'purple' | 'yellow';
  children?: React.ReactNode; // For custom tooltip content
}

export function FeatureBadge({ icon, label, description, stat, color = 'green', children }: FeatureBadgeProps) {
  const colorClasses = {
    green: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600',
    blue: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600',
    purple: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600',
    yellow: 'bg-gray-800 border-gray-700 text-white hover:bg-gray-750 hover:border-gray-600',
  };

  return (
    <div className="relative group">
      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${colorClasses[color]}`}>
        {icon}
        <span>{label}</span>
        {stat && <span className="text-gray-400">• {stat}</span>}
      </div>
      
      {/* Hover Tooltip */}
      <div className="absolute left-0 top-full mt-2 w-72 p-3 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 pointer-events-none">
        {children || (
          <p className="text-xs text-gray-300 leading-relaxed">{description}</p>
        )}
      </div>
    </div>
  );
}


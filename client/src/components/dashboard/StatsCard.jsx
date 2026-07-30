import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon, change, color = 'indigo' }) => {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const colorClasses = {
    indigo: 'bg-indigo-500/10 text-indigo-400',
    blue: 'bg-blue-500/10 text-blue-400',
    green: 'bg-green-500/10 text-green-400',
    red: 'bg-red-500/10 text-red-400',
    purple: 'bg-purple-500/10 text-purple-400',
    orange: 'bg-orange-500/10 text-orange-400',
    teal: 'bg-teal-500/10 text-teal-400',
    pink: 'bg-pink-500/10 text-pink-400',
  };

  const iconBg = colorClasses[color] || colorClasses.indigo;

  return (
    <div className="bg-gray-800 rounded-xl p-5 border border-gray-700 hover:border-gray-600 transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-gray-500 font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-100 tracking-tight">
            {value ?? '—'}
          </p>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-green-400' : isNegative ? 'text-red-400' : 'text-gray-400'
            }`}>
              {isPositive ? (
                <FiTrendingUp size={14} />
              ) : isNegative ? (
                <FiTrendingDown size={14} />
              ) : null}
              <span>{change}</span>
            </div>
          )}
        </div>
        {icon && (
          <div className={`p-3 rounded-lg ${iconBg}`}>
            {icon}
          </div>
        )}
      </div>
    </div>
  );
};

export default StatsCard;

import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

const StatsCard = ({ title, value, icon, change, color = 'brand' }) => {
  const isPositive = change?.startsWith('+');
  const isNegative = change?.startsWith('-');
  const colorClasses = {
    brand: 'bg-brand-soft text-brand',
    info: 'bg-info-soft text-info',
    success: 'bg-success-soft text-success',
    danger: 'bg-danger-soft text-danger',
    accent: 'bg-accent-soft text-accent',
    warning: 'bg-warning-soft text-warning',
  };

  const iconBg = colorClasses[color] || colorClasses.brand;

  return (
    <div className="bg-card rounded-xl p-5 border border-line hover:border-line-strong transition-all">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-ink-muted font-medium">{title}</p>
          <p className="text-3xl font-bold text-ink tracking-tight">
            {value ?? '—'}
          </p>
          {change && (
            <div className={`flex items-center gap-1 text-xs font-medium ${
              isPositive ? 'text-success' : isNegative ? 'text-danger' : 'text-ink-secondary'
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

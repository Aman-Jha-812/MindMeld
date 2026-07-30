import { useState } from 'react';

const sizeMap = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
};

const bgColors = [
  'bg-red-500',
  'bg-blue-500',
  'bg-green-500',
  'bg-yellow-500',
  'bg-purple-500',
  'bg-pink-500',
  'bg-indigo-500',
  'bg-teal-500',
  'bg-orange-500',
  'bg-cyan-500',
];

const getInitials = (name) => {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '?';
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

const getColorFromName = (name) => {
  if (!name) return bgColors[0];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return bgColors[Math.abs(hash) % bgColors.length];
};

const Avatar = ({ src, name, size = 'md', className = '', onClick }) => {
  const [imgError, setImgError] = useState(false);
  const dimension = sizeMap[size] || sizeMap.md;
  const imgSrc = typeof src === 'string' ? src : src?.url;

  if (imgSrc && !imgError) {
    return (
      <img
        src={imgSrc}
        alt={name || 'Avatar'}
        className={`${dimension} rounded-full object-cover flex-shrink-0 ${className}`}
        onError={() => setImgError(true)}
        onClick={onClick}
      />
    );
  }

  const initials = getInitials(name);
  const bgColor = getColorFromName(name);

  return (
    <div
      className={`${dimension} rounded-full ${bgColor} flex items-center justify-center text-white font-medium flex-shrink-0 ${onClick ? 'cursor-pointer' : ''} ${className}`}
      onClick={onClick}
      title={name}
    >
      {initials}
    </div>
  );
};

export default Avatar;

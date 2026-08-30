import React from 'react';
import { FoodDietType } from '../../types';

interface VegBadgeProps {
  type: FoodDietType;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const VegBadge: React.FC<VegBadgeProps> = ({ type, size = 'md', showLabel = false }) => {
  const isVeg = type === 'veg' || type === 'vegan';
  const isEgg = type === 'egg';

  const sizeClasses = {
    sm: 'w-3.5 h-3.5 border',
    md: 'w-4 h-4 border-2',
    lg: 'w-5 h-5 border-2'
  }[size];

  const innerSizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-2.5 h-2.5'
  }[size];

  const borderColor = isVeg ? 'border-emerald-600' : isEgg ? 'border-amber-600' : 'border-rose-600';
  const fillColor = isVeg ? 'bg-emerald-600' : isEgg ? 'bg-amber-600' : 'bg-rose-600';

  return (
    <div className="inline-flex items-center gap-1.5">
      <div
        id={`veg-badge-${type}`}
        className={`flex items-center justify-center rounded-[3px] bg-white ${borderColor} ${sizeClasses} shadow-xs`}
        title={isVeg ? 'Vegetarian' : isEgg ? 'Egg' : 'Non-Vegetarian'}
      >
        {isVeg ? (
          <div className={`rounded-full ${fillColor} ${innerSizeClasses}`} />
        ) : isEgg ? (
          <div className={`rounded-full ${fillColor} ${innerSizeClasses}`} />
        ) : (
          <div
            className={`w-0 h-0 border-x-transparent ${
              size === 'sm'
                ? 'border-x-[3px] border-b-[5px] border-b-rose-600'
                : 'border-x-[4px] border-b-[7px] border-b-rose-600'
            }`}
          />
        )}
      </div>
      {showLabel && (
        <span className={`text-xs font-semibold ${isVeg ? 'text-emerald-700' : isEgg ? 'text-amber-700' : 'text-rose-700'}`}>
          {isVeg ? 'VEG' : isEgg ? 'EGG' : 'NON-VEG'}
        </span>
      )}
    </div>
  );
};

import React from 'react';

/**
 * Icon component to display achievement icons with different states
 */
interface AchievementIconProps {
  icon: string;
  unlocked: boolean;
}

const AchievementIcon: React.FC<AchievementIconProps> = ({ icon, unlocked }) => {
  // Map icon types to emoji representations
  const iconMap: Record<string, string> = {
    'trade': '💹',
    'trades': '📊',
    'diversify': '🔄',
    'timer': '⏱️',
    'profit': '💰',
    'money': '💵',
    'collection': '🗃️',
    'trophy': '🏆',
    'crystal-ball': '🔮',
    'speed': '⚡',
    'calendar': '📅',
    'brain': '🧠',
    'focus': '🎯',
    'news': '📰',
    'recovery': '📈'
  };

  return (
    <div className={`achievement-badge ${unlocked ? 'unlocked' : 'locked'}`}>
      {iconMap[icon] || '🎮'}
    </div>
  );
};

export default AchievementIcon;
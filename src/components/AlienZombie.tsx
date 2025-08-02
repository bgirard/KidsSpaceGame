import React from 'react';
import { AlienZombie as AlienZombieType, ZOMBIE_CONFIG } from '../types/GameTypes';
import './AlienZombie.css';

interface AlienZombieProps {
  zombie: AlienZombieType;
  isAttacking?: boolean;
}

const AlienZombie: React.FC<AlienZombieProps> = ({ zombie, isAttacking = false }) => {
  const config = ZOMBIE_CONFIG[zombie.type];
  const healthPercentage = (zombie.health / zombie.maxHealth) * 100;
  
  return (
    <div 
      className={`alien-zombie ${zombie.state} ${isAttacking ? 'attacking' : ''}`}
      style={{
        left: zombie.position.x,
        top: zombie.position.y,
        '--zombie-color': config.color
      } as React.CSSProperties}
    >
      <div className="zombie-icon">{config.emoji}</div>
      <div className="health-bar">
        <div 
          className="health-fill"
          style={{ 
            backgroundColor: healthPercentage > 50 ? '#4CAF50' : healthPercentage > 25 ? '#FF9800' : '#f44336',
            width: `${healthPercentage}%`
          }}
        />
      </div>
      {zombie.state === 'attacking' && (
        <div className="attack-indicator">💥</div>
      )}
    </div>
  );
};

export default AlienZombie;
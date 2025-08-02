import React from 'react';
import { BossZombie as BossZombieType, BOSS_CONFIG } from '../types/GameTypes';
import './BossZombie.css';

interface BossZombieProps {
  boss: BossZombieType;
  isAttacking?: boolean;
}

const BossZombie: React.FC<BossZombieProps> = ({ boss, isAttacking = false }) => {
  const phaseConfig = BOSS_CONFIG.phases[boss.phase];
  const healthPercentage = (boss.health / boss.maxHealth) * 100;
  
  return (
    <div 
      className={`boss-zombie phase-${boss.phase} ${boss.state} ${isAttacking ? 'attacking' : ''}`}
      style={{
        left: boss.position.x,
        top: boss.position.y,
        '--boss-color': phaseConfig.color
      } as React.CSSProperties}
    >
      <div className="boss-icon">{phaseConfig.emoji}</div>
      <div className="boss-health-bar">
        <div 
          className="boss-health-fill"
          style={{ 
            backgroundColor: healthPercentage > 50 ? '#4CAF50' : healthPercentage > 25 ? '#FF9800' : '#f44336',
            width: `${healthPercentage}%`
          }}
        />
      </div>
      <div className="boss-phase-indicator">
        <span className="phase-text">Phase {boss.phase}</span>
        <span className="phase-name">{phaseConfig.name}</span>
      </div>
      {boss.state === 'phase_transition' && (
        <div className="phase-transition-effect">
          <div className="transition-glow"></div>
          <div className="transition-text">PHASE {boss.phase} ACTIVATED!</div>
        </div>
      )}
      {isAttacking && (
        <div className="boss-attack-indicator">
          {boss.phase === 1 && '💥'}
          {boss.phase === 2 && '🔫'}
          {boss.phase === 3 && '🌊'}
          {boss.phase === 4 && '⚡'}
        </div>
      )}
    </div>
  );
};

export default BossZombie;
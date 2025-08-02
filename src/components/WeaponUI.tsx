import React from 'react';
import { WeaponState } from '../types/GameTypes';
import './WeaponUI.css';

interface WeaponUIProps {
  weaponState: WeaponState;
  energyPercentage: number;
}

const WeaponUI: React.FC<WeaponUIProps> = ({ weaponState, energyPercentage }) => {
  return (
    <div className="weapon-ui">
      <div className="weapon-section">
        <div className="weapon-label">
          <span className="weapon-icon">⚡</span>
          <span>Energy</span>
        </div>
        <div className="weapon-bar-container">
          <div className="weapon-bar energy">
            <div 
              className="energy-fill"
              style={{ 
                width: `${energyPercentage}%`,
                backgroundColor: energyPercentage > 50 ? '#FFD700' : energyPercentage > 25 ? '#FF9800' : '#f44336'
              }}
            />
          </div>
          <span className="weapon-text">{Math.floor(weaponState.energy)}/{weaponState.maxEnergy}</span>
        </div>
      </div>
      
      <div className="weapons-info">
        <div className="weapon-controls">
          <div className="weapon-control">
            <span className="control-key">SPACE</span>
            <span className="control-weapon">🔫 Laser (5 energy)</span>
          </div>
          <div className="weapon-control">
            <span className="control-key">F</span>
            <span className="control-weapon">🔥 Flame (3 energy)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WeaponUI;
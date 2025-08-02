import React from 'react';
import { HealthState } from '../hooks/useHealthSystem';
import './HealthUI.css';

interface HealthUIProps {
  health: HealthState;
  healthPercentage: number;
  shieldPercentage: number;
}

const HealthUI: React.FC<HealthUIProps> = ({ health, healthPercentage, shieldPercentage }) => {
  return (
    <div className="health-ui">
      <div className="health-section">
        <div className="health-label">
          <span className="health-icon">❤️</span>
          <span>Health</span>
        </div>
        <div className="health-bar-container">
          <div className="health-bar health">
            <div 
              className="health-fill"
              style={{ 
                width: `${healthPercentage}%`,
                backgroundColor: healthPercentage > 60 ? '#4CAF50' : healthPercentage > 30 ? '#FF9800' : '#f44336'
              }}
            />
          </div>
          <span className="health-text">{health.current}/{health.max}</span>
        </div>
      </div>
      
      <div className="health-section">
        <div className="health-label">
          <span className="health-icon">🛡️</span>
          <span>Shield</span>
        </div>
        <div className="health-bar-container">
          <div className="health-bar shield">
            <div 
              className="shield-fill"
              style={{ 
                width: `${shieldPercentage}%`,
                backgroundColor: '#2196F3'
              }}
            />
          </div>
          <span className="health-text">{Math.floor(health.shield)}/{health.maxShield}</span>
        </div>
      </div>
    </div>
  );
};

export default HealthUI;
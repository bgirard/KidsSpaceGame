import React from 'react';
import { Projectile as ProjectileType, WeaponType } from '../types/GameTypes';
import './Projectile.css';

interface ProjectileProps {
  projectile: ProjectileType;
}

const Projectile: React.FC<ProjectileProps> = ({ projectile }) => {
  const fadePercentage = (projectile.lifetime / projectile.maxLifetime) * 100;
  
  return (
    <div 
      className={`projectile ${projectile.type}`}
      style={{
        left: projectile.position.x,
        top: projectile.position.y,
        width: projectile.size,
        height: projectile.size,
        opacity: fadePercentage / 100
      }}
    >
      {projectile.type === WeaponType.LASER ? '●' : '🔥'}
    </div>
  );
};

export default Projectile;
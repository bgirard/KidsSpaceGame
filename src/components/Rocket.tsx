import React from 'react';
import './Rocket.css';

interface RocketProps {
  x: number;
  y: number;
  angle: number;
}

const Rocket: React.FC<RocketProps> = ({ x, y, angle }) => {
  return (
    <div 
      className="rocket"
      style={{
        left: x,
        top: y,
        transform: `translate(-50%, -50%) rotate(${angle - 45}deg)`
      }}
    >
      🚀
    </div>
  );
};

export default Rocket;
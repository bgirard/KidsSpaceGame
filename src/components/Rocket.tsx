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
        transform: `rotate(${angle}deg)`
      }}
    >
      🚀
    </div>
  );
};

export default Rocket;
import React, { useState, useEffect, useCallback } from 'react';
import Rocket from './Rocket';
import './GameCanvas.css';

interface Position {
  x: number;
  y: number;
}

interface Velocity {
  vx: number;
  vy: number;
}

const GameCanvas: React.FC = () => {
  const [rocketPosition, setRocketPosition] = useState<Position>({ x: 400, y: 300 });
  const [rocketVelocity, setRocketVelocity] = useState<Velocity>({ vx: 0, vy: 0 });
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const THRUST_POWER = 0.5;
  const ROTATION_SPEED = 5;
  const FRICTION = 0.98;

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    setKeys(prev => new Set(prev).add(event.code));
  }, []);

  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    setKeys(prev => {
      const newKeys = new Set(prev);
      newKeys.delete(event.code);
      return newKeys;
    });
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  useEffect(() => {
    const gameLoop = setInterval(() => {
      setRocketPosition(prevPos => {
        setRocketVelocity(prevVel => {
          setRocketAngle(prevAngle => {
            let newAngle = prevAngle;
            let newVx = prevVel.vx;
            let newVy = prevVel.vy;

            if (keys.has('ArrowLeft') || keys.has('KeyA')) {
              newAngle -= ROTATION_SPEED;
            }
            if (keys.has('ArrowRight') || keys.has('KeyD')) {
              newAngle += ROTATION_SPEED;
            }
            if (keys.has('ArrowUp') || keys.has('KeyW')) {
              const radians = (newAngle - 90) * (Math.PI / 180);
              newVx += Math.cos(radians) * THRUST_POWER;
              newVy += Math.sin(radians) * THRUST_POWER;
            }

            newVx *= FRICTION;
            newVy *= FRICTION;

            setRocketVelocity({ vx: newVx, vy: newVy });
            return newAngle;
          });

          return prevVel;
        });

        let newX = prevPos.x + rocketVelocity.vx;
        let newY = prevPos.y + rocketVelocity.vy;

        if (newX < 0) newX = CANVAS_WIDTH;
        if (newX > CANVAS_WIDTH) newX = 0;
        if (newY < 0) newY = CANVAS_HEIGHT;
        if (newY > CANVAS_HEIGHT) newY = 0;

        return { x: newX, y: newY };
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [keys, rocketVelocity.vx, rocketVelocity.vy]);

  return (
    <div className="game-canvas">
      <div className="instructions">
        <p>Use WASD or Arrow Keys to control the rocket</p>
        <p>W/↑: Thrust | A/←: Rotate Left | D/→: Rotate Right</p>
      </div>
      <div className="space">
        <Rocket x={rocketPosition.x} y={rocketPosition.y} angle={rocketAngle} />
      </div>
    </div>
  );
};

export default GameCanvas;
import React, { useState, useEffect, useCallback } from 'react';
import Rocket from './Rocket';
import ResourceNode from './ResourceNode';
import ResourceUI from './ResourceUI';
import { Position, Velocity, ResourceNode as ResourceNodeType } from '../types/GameTypes';
import { useResourceManager } from '../hooks/useResourceManager';
import { generateResourceNodes, isWithinCollectionRange, updateResourceNodeRegeneration, collectFromNode } from '../utils/gameUtils';
import './GameCanvas.css';

const GameCanvas: React.FC = () => {
  const [rocketPosition, setRocketPosition] = useState<Position>({ x: 400, y: 300 });
  const [rocketVelocity, setRocketVelocity] = useState<Velocity>({ vx: 0, vy: 0 });
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [resourceNodes, setResourceNodes] = useState<ResourceNodeType[]>([]);
  const [collectedNodes, setCollectedNodes] = useState<Set<string>>(new Set());
  const { inventory, collectResource } = useResourceManager();

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;
  const THRUST_POWER = 0.5;
  const ROTATION_SPEED = 5;
  const FRICTION = 0.98;
  const COLLECTION_RATE = 2;

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
    const nodes = generateResourceNodes(15, CANVAS_WIDTH, CANVAS_HEIGHT);
    setResourceNodes(nodes);
  }, []);

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

      setResourceNodes(prevNodes => {
        const updatedNodes = prevNodes.map(node => {
          let updatedNode = updateResourceNodeRegeneration(node, 16);
          
          if (isWithinCollectionRange(rocketPosition, node.position) && node.amount > 0) {
            setCollectedNodes(prev => new Set(prev).add(node.id));
            const { node: harvestedNode, collected } = collectFromNode(updatedNode, COLLECTION_RATE / 60);
            if (collected > 0) {
              collectResource(node.type, collected);
            }
            return harvestedNode;
          } else {
            setCollectedNodes(prev => {
              const newSet = new Set(prev);
              newSet.delete(node.id);
              return newSet;
            });
          }
          
          return updatedNode;
        });
        
        return updatedNodes;
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [keys, rocketVelocity.vx, rocketVelocity.vy, rocketPosition, collectResource]);

  return (
    <div className="game-canvas">
      <ResourceUI inventory={inventory} />
      <div className="instructions">
        <p>Use WASD or Arrow Keys to control the rocket</p>
        <p>W/↑: Thrust | A/←: Rotate Left | D/→: Rotate Right | Fly near resources to collect them</p>
      </div>
      <div className="space">
        <Rocket x={rocketPosition.x} y={rocketPosition.y} angle={rocketAngle} />
        {resourceNodes.map(node => (
          <ResourceNode 
            key={node.id} 
            node={node} 
            isBeingCollected={collectedNodes.has(node.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameCanvas;
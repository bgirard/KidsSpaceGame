import React, { useState, useEffect, useCallback } from 'react';
import Rocket from './Rocket';
import ResourceNode from './ResourceNode';
import ResourceUI from './ResourceUI';
import AlienZombie from './AlienZombie';
import HealthUI from './HealthUI';
import { Position, Velocity, ResourceNode as ResourceNodeType, AlienZombie as AlienZombieType } from '../types/GameTypes';
import { useResourceManager } from '../hooks/useResourceManager';
import { useHealthSystem } from '../hooks/useHealthSystem';
import { generateResourceNodes, isWithinCollectionRange, updateResourceNodeRegeneration, collectFromNode, calculateDistance } from '../utils/gameUtils';
import { generateZombies, updateZombieAI, updateZombiePosition, canZombieAttack, zombieAttack } from '../utils/zombieUtils';
import './GameCanvas.css';

const GameCanvas: React.FC = () => {
  const [rocketPosition, setRocketPosition] = useState<Position>({ x: 400, y: 300 });
  const [rocketVelocity, setRocketVelocity] = useState<Velocity>({ vx: 0, vy: 0 });
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [resourceNodes, setResourceNodes] = useState<ResourceNodeType[]>([]);
  const [collectedNodes, setCollectedNodes] = useState<Set<string>>(new Set());
  const [zombies, setZombies] = useState<AlienZombieType[]>([]);
  const [attackingZombies, setAttackingZombies] = useState<Set<string>>(new Set());
  const { inventory, collectResource } = useResourceManager();
  const { health, takeDamage, rechargeShield, isDead, healthPercentage, shieldPercentage } = useHealthSystem();

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
    
    const initialZombies = generateZombies(8, CANVAS_WIDTH, CANVAS_HEIGHT, { x: 400, y: 300 });
    setZombies(initialZombies);
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
      
      setZombies(prevZombies => {
        return prevZombies.map(zombie => {
          if (zombie.health <= 0) return zombie;
          
          let updatedZombie = updateZombieAI(zombie, rocketPosition, 16);
          updatedZombie = updateZombiePosition(updatedZombie, 16, CANVAS_WIDTH, CANVAS_HEIGHT);
          
          if (canZombieAttack(updatedZombie)) {
            const distanceToRocket = calculateDistance(updatedZombie.position, rocketPosition);
            if (distanceToRocket <= updatedZombie.attackRange) {
              setAttackingZombies(prev => new Set(prev).add(zombie.id));
              takeDamage(updatedZombie.damage);
              updatedZombie = zombieAttack(updatedZombie);
              
              setTimeout(() => {
                setAttackingZombies(prev => {
                  const newSet = new Set(prev);
                  newSet.delete(zombie.id);
                  return newSet;
                });
              }, 300);
            }
          }
          
          return updatedZombie;
        });
      });
      
      if (health.shield < health.maxShield) {
        rechargeShield(0.2);
      }
    }, 16);

    return () => clearInterval(gameLoop);
  }, [keys, rocketVelocity.vx, rocketVelocity.vy, rocketPosition, collectResource, takeDamage, rechargeShield, health.shield, health.maxShield]);

  if (isDead) {
    return (
      <div className="game-canvas">
        <div className="game-over">
          <h1>💀 GAME OVER 💀</h1>
          <p>The alien zombies have destroyed your rocket!</p>
          <button onClick={() => window.location.reload()}>Restart Game</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-canvas">
      <HealthUI health={health} healthPercentage={healthPercentage} shieldPercentage={shieldPercentage} />
      <ResourceUI inventory={inventory} />
      <div className="instructions">
        <p>Use WASD or Arrow Keys to control the rocket</p>
        <p>W/↑: Thrust | A/←: Rotate Left | D/→: Rotate Right | Collect resources, avoid alien zombies!</p>
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
        {zombies.map(zombie => (
          <AlienZombie 
            key={zombie.id} 
            zombie={zombie} 
            isAttacking={attackingZombies.has(zombie.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default GameCanvas;
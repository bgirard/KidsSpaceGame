import React, { useState, useEffect, useCallback } from 'react';
import Rocket from './Rocket';
import ResourceNode from './ResourceNode';
import ResourceUI from './ResourceUI';
import AlienZombie from './AlienZombie';
import BossZombie from './BossZombie';
import HealthUI from './HealthUI';
import WeaponUI from './WeaponUI';
import Projectile from './Projectile';
import { Position, Velocity, ResourceNode as ResourceNodeType, AlienZombie as AlienZombieType, BossZombie as BossZombieType, BossProjectile, Projectile as ProjectileType, FlameParticle, WeaponType } from '../types/GameTypes';
import { useResourceManager } from '../hooks/useResourceManager';
import { useHealthSystem } from '../hooks/useHealthSystem';
import { useWeaponSystem } from '../hooks/useWeaponSystem';
import { generateResourceNodes, isWithinCollectionRange, updateResourceNodeRegeneration, collectFromNode, calculateDistance } from '../utils/gameUtils';
import { generateZombies, updateZombieAI, updateZombiePosition, canZombieAttack, zombieAttack, damageZombie } from '../utils/zombieUtils';
import { createBoss, updateBossPhase, updateBossAI, updateBossPosition, canBossAttack, bossAttack, createBossProjectile, updateBossProjectile, isBossProjectileExpired, damageBoss } from '../utils/bossUtils';
import { createProjectile, createFlameParticles, updateProjectile, updateFlameParticle, checkProjectileZombieCollision, checkFlameZombieCollision, isProjectileOutOfBounds, isFlameParticleExpired } from '../utils/weaponUtils';
import './GameCanvas.css';

const GameCanvas: React.FC = () => {
  const [rocketPosition, setRocketPosition] = useState<Position>({ x: 400, y: 300 });
  const [rocketVelocity, setRocketVelocity] = useState<Velocity>({ vx: 0, vy: 0 });
  const [rocketAngle, setRocketAngle] = useState<number>(0);
  const [keys, setKeys] = useState<Set<string>>(new Set());
  const [resourceNodes, setResourceNodes] = useState<ResourceNodeType[]>([]);
  const [collectedNodes, setCollectedNodes] = useState<Set<string>>(new Set());
  const [zombies, setZombies] = useState<AlienZombieType[]>([]);
  const [boss, setBoss] = useState<BossZombieType | null>(null);
  const [bossProjectiles, setBossProjectiles] = useState<BossProjectile[]>([]);
  const [attackingZombies, setAttackingZombies] = useState<Set<string>>(new Set());
  const [isBossAttacking, setIsBossAttacking] = useState<boolean>(false);
  const [projectiles, setProjectiles] = useState<ProjectileType[]>([]);
  const [flameParticles, setFlameParticles] = useState<FlameParticle[]>([]);
  const { inventory, collectResource } = useResourceManager();
  const { health, takeDamage, rechargeShield, isDead, healthPercentage, shieldPercentage } = useHealthSystem();
  const { weaponState, fireWeapon, rechargeEnergy, energyPercentage } = useWeaponSystem();

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
            
            if (keys.has('Space')) {
              if (fireWeapon(WeaponType.LASER)) {
                const newProjectile = createProjectile(
                  WeaponType.LASER,
                  rocketPosition,
                  newAngle,
                  `laser-${Date.now()}`
                );
                setProjectiles(prev => [...prev, newProjectile]);
              }
            }
            
            if (keys.has('KeyF')) {
              if (fireWeapon(WeaponType.FLAME)) {
                const newFlameParticles = createFlameParticles(
                  rocketPosition,
                  newAngle,
                  5
                );
                setFlameParticles(prev => [...prev, ...newFlameParticles]);
              }
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
        const updatedZombies: AlienZombieType[] = [];
        
        prevZombies.forEach(zombie => {
          if (zombie.health <= 0) {
            // Remove dead zombies from attacking set
            setAttackingZombies(prev => {
              const newSet = new Set(prev);
              newSet.delete(zombie.id);
              return newSet;
            });
            console.log('Removing dead zombie from game');
            return; // Don't add to updated array
          }
          
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
          
          updatedZombies.push(updatedZombie);
        });
        
        // Check if all zombies are dead and spawn boss
        if (updatedZombies.length === 0 && boss === null) {
          console.log('All zombies defeated! Spawning boss...');
          const newBoss = createBoss(CANVAS_WIDTH, CANVAS_HEIGHT, rocketPosition);
          setBoss(newBoss);
        }
        
        return updatedZombies;
      });
      
      // Update boss if it exists
      if (boss && boss.health > 0) {
        setBoss(prevBoss => {
          if (!prevBoss) return null;
          
          let updatedBoss = updateBossPhase(prevBoss);
          updatedBoss = updateBossAI(updatedBoss, rocketPosition, 16);
          updatedBoss = updateBossPosition(updatedBoss, 16, CANVAS_WIDTH, CANVAS_HEIGHT);
          
          if (canBossAttack(updatedBoss)) {
            const distanceToRocket = calculateDistance(updatedBoss.position, rocketPosition);
            if (distanceToRocket <= updatedBoss.attackRange) {
              setIsBossAttacking(true);
              
              // Different attack patterns based on phase
              if (updatedBoss.phase === 1) {
                // Phase 1: Direct damage
                takeDamage(updatedBoss.damage);
              } else if (updatedBoss.phase === 2 || updatedBoss.phase === 4) {
                // Phase 2 & 4: Shoot projectiles
                const projectile = createBossProjectile(updatedBoss, rocketPosition, 'energy_blast');
                setBossProjectiles(prev => [...prev, projectile]);
              } else if (updatedBoss.phase === 3 || updatedBoss.phase === 4) {
                // Phase 3 & 4: Area damage shockwave
                const shockwave = createBossProjectile(updatedBoss, rocketPosition, 'shockwave');
                setBossProjectiles(prev => [...prev, shockwave]);
              }
              
              updatedBoss = bossAttack(updatedBoss);
              
              setTimeout(() => {
                setIsBossAttacking(false);
              }, 500);
            }
          }
          
          return updatedBoss;
        });
      }
      
      if (health.shield < health.maxShield) {
        rechargeShield(0.2);
      }
      
      if (weaponState.energy < weaponState.maxEnergy) {
        rechargeEnergy(0.5);
      }
      
      setProjectiles(prevProjectiles => {
        const survivingProjectiles: ProjectileType[] = [];
        
        prevProjectiles.forEach(projectile => {
          const updatedProjectile = updateProjectile(projectile, 16);
          
          // Remove if out of bounds or expired
          if (isProjectileOutOfBounds(updatedProjectile, CANVAS_WIDTH, CANVAS_HEIGHT)) {
            return;
          }
          
          let hit = false;
          
          // Check collision with regular zombies
          setZombies(prevZombies => {
            return prevZombies.map(zombie => {
              if (checkProjectileZombieCollision(updatedProjectile, zombie) && zombie.health > 0) {
                hit = true;
                return damageZombie(zombie, updatedProjectile.damage);
              }
              return zombie;
            });
          });
          
          // Check collision with boss
          if (!hit && boss && boss.health > 0) {
            const distanceToBoss = calculateDistance(updatedProjectile.position, boss.position);
            if (distanceToBoss < 40) { // Boss has larger hit radius
              hit = true;
              setBoss(prevBoss => prevBoss ? damageBoss(prevBoss, updatedProjectile.damage) : null);
            }
          }
          
          // Only keep projectile if it didn't hit anything
          if (!hit) {
            survivingProjectiles.push(updatedProjectile);
          }
        });
        
        return survivingProjectiles;
      });
      
      setFlameParticles(prevParticles => {
        const updatedParticles = prevParticles
          .map(particle => updateFlameParticle(particle, 16))
          .filter(particle => {
            // Remove if expired, out of bounds, or very low opacity
            if (isFlameParticleExpired(particle) || 
                particle.position.x < 0 || particle.position.x > CANVAS_WIDTH ||
                particle.position.y < 0 || particle.position.y > CANVAS_HEIGHT ||
                particle.opacity <= 0.1) {
              return false;
            }
            
            // Check collision with zombies
            let shouldRemove = false;
            setZombies(prevZombies => {
              return prevZombies.map(zombie => {
                if (checkFlameZombieCollision(particle, zombie) && zombie.health > 0) {
                  shouldRemove = Math.random() < 0.7; // 70% chance to remove on hit
                  return damageZombie(zombie, particle.damage / 8);
                }
                return zombie;
              });
            });
            
            // Check collision with boss
            if (!shouldRemove && boss && boss.health > 0) {
              const distanceToBoss = calculateDistance(particle.position, boss.position);
              if (distanceToBoss < 45) { // Boss flame collision
                shouldRemove = Math.random() < 0.5; // 50% chance to remove on boss hit
                setBoss(prevBoss => prevBoss ? damageBoss(prevBoss, particle.damage / 10) : null);
              }
            }
            
            if (shouldRemove) return false;
            
            // Random chance to despawn over time (5% per frame)
            if (Math.random() < 0.05) return false;
            
            return true;
          });
        
        // Debug: log particle count changes
        if (prevParticles.length !== updatedParticles.length) {
          console.log(`Flame particles: ${prevParticles.length} -> ${updatedParticles.length}`);
        }
        
        return updatedParticles;
      });
      
      // Update boss projectiles
      setBossProjectiles(prevProjectiles => {
        return prevProjectiles
          .map(projectile => updateBossProjectile(projectile, 16))
          .filter(projectile => {
            if (isBossProjectileExpired(projectile, CANVAS_WIDTH, CANVAS_HEIGHT)) {
              return false;
            }
            
            // Check collision with rocket
            const distanceToRocket = calculateDistance(projectile.position, rocketPosition);
            if (distanceToRocket < 25) {
              takeDamage(projectile.damage);
              return false; // Remove projectile after hit
            }
            
            return true;
          });
      });
    }, 16);

    return () => clearInterval(gameLoop);
  }, [keys, rocketVelocity.vx, rocketVelocity.vy, rocketPosition, collectResource, takeDamage, rechargeShield, health.shield, health.maxShield, weaponState.energy, weaponState.maxEnergy, fireWeapon, rechargeEnergy, boss]);

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

  // Victory condition
  if (boss && boss.health <= 0) {
    return (
      <div className="game-canvas">
        <div className="victory">
          <h1>🎉 VICTORY! 🎉</h1>
          <p>You have defeated the Boss and saved the galaxy!</p>
          <div className="victory-stats">
            <p>Resources Collected:</p>
            <p>⚙️ Iron: {Math.floor(inventory.iron)}</p>
            <p>💎 Crystal: {Math.floor(inventory.crystal)}</p>
            <p>⚡ Energy: {Math.floor(inventory.energy)}</p>
            <p>🌟 Rare Metals: {Math.floor(inventory.rare_metals)}</p>
          </div>
          <button onClick={() => window.location.reload()}>Play Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="game-canvas">
      <HealthUI health={health} healthPercentage={healthPercentage} shieldPercentage={shieldPercentage} />
      <ResourceUI inventory={inventory} />
      <WeaponUI weaponState={weaponState} energyPercentage={energyPercentage} />
      <div className="instructions">
        <p>Use WASD or Arrow Keys to control the rocket</p>
        <p>W/↑: Thrust | A/←: Rotate Left | D/→: Rotate Right | SPACE: Laser | F: Flame</p>
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
        {zombies
          .filter(zombie => zombie.health > 0)
          .map(zombie => (
          <AlienZombie 
            key={zombie.id} 
            zombie={zombie} 
            isAttacking={attackingZombies.has(zombie.id)}
          />
        ))}
        {boss && boss.health > 0 && (
          <BossZombie 
            boss={boss} 
            isAttacking={isBossAttacking}
          />
        )}
        {projectiles.map(projectile => (
          <Projectile 
            key={projectile.id} 
            projectile={projectile}
          />
        ))}
        {flameParticles
          .filter(particle => particle.opacity > 0.1 && particle.lifetime > 0)
          .map(particle => (
          <div
            key={particle.id}
            className="flame-particle"
            style={{
              position: 'absolute',
              left: particle.position.x,
              top: particle.position.y,
              width: particle.size,
              height: particle.size,
              background: `radial-gradient(circle, rgba(255,69,0,${particle.opacity}) 0%, rgba(255,140,0,${particle.opacity * 0.7}) 50%, transparent 100%)`,
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 6,
              opacity: particle.opacity
            }}
          />
        ))}
        {bossProjectiles.map(projectile => (
          <div
            key={projectile.id}
            className={`boss-projectile ${projectile.type}`}
            style={{
              position: 'absolute',
              left: projectile.position.x,
              top: projectile.position.y,
              width: projectile.size,
              height: projectile.size,
              background: projectile.type === 'energy_blast' ? 
                'radial-gradient(circle, #FF4500 0%, #FF6500 50%, transparent 100%)' :
                projectile.type === 'shockwave' ?
                'radial-gradient(circle, rgba(153,50,204,0.6) 0%, rgba(153,50,204,0.3) 50%, transparent 100%)' :
                'radial-gradient(circle, #228B22 0%, #32CD32 50%, transparent 100%)',
              borderRadius: '50%',
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
              zIndex: 7,
              boxShadow: projectile.type === 'energy_blast' ? '0 0 10px #FF4500' :
                         projectile.type === 'shockwave' ? '0 0 15px #9932CC' :
                         '0 0 8px #228B22'
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default GameCanvas;
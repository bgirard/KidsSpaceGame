import { Position, AlienZombie, ZombieType, ZOMBIE_CONFIG } from '../types/GameTypes';
import { calculateDistance } from './gameUtils';

export const generateZombies = (count: number, canvasWidth: number, canvasHeight: number, rocketPosition: Position): AlienZombie[] => {
  const zombies: AlienZombie[] = [];
  const zombieTypes = Object.values(ZombieType);
  
  for (let i = 0; i < count; i++) {
    const type = zombieTypes[Math.floor(Math.random() * zombieTypes.length)];
    const config = ZOMBIE_CONFIG[type];
    
    let position: Position;
    do {
      position = {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight
      };
    } while (calculateDistance(position, rocketPosition) < 100);
    
    zombies.push({
      id: `zombie-${i}`,
      type,
      position,
      velocity: { vx: 0, vy: 0 },
      health: config.health,
      maxHealth: config.health,
      speed: config.speed,
      damage: config.damage,
      attackRange: config.attackRange,
      lastAttack: 0,
      attackCooldown: config.attackCooldown,
      target: null,
      state: 'idle'
    });
  }
  
  return zombies;
};

export const updateZombieAI = (zombie: AlienZombie, rocketPosition: Position, deltaTime: number): AlienZombie => {
  if (zombie.health <= 0) {
    return { ...zombie, state: 'dead' };
  }

  const distanceToRocket = calculateDistance(zombie.position, rocketPosition);
  const detectionRange = 150;
  
  let newState = zombie.state;
  let newTarget = zombie.target;
  let newVelocity = { ...zombie.velocity };
  
  if (distanceToRocket <= detectionRange) {
    newTarget = rocketPosition;
    
    if (distanceToRocket <= zombie.attackRange) {
      newState = 'attacking';
      newVelocity = { vx: 0, vy: 0 };
    } else {
      newState = 'chasing';
      
      const dx = rocketPosition.x - zombie.position.x;
      const dy = rocketPosition.y - zombie.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        newVelocity = {
          vx: (dx / distance) * zombie.speed,
          vy: (dy / distance) * zombie.speed
        };
      }
    }
  } else {
    newState = 'idle';
    newTarget = null;
    newVelocity = { vx: 0, vy: 0 };
  }
  
  return {
    ...zombie,
    state: newState,
    target: newTarget,
    velocity: newVelocity
  };
};

export const updateZombiePosition = (zombie: AlienZombie, deltaTime: number, canvasWidth: number, canvasHeight: number): AlienZombie => {
  if (zombie.state === 'dead' || zombie.state === 'attacking') {
    return zombie;
  }
  
  let newX = zombie.position.x + zombie.velocity.vx;
  let newY = zombie.position.y + zombie.velocity.vy;
  
  newX = Math.max(20, Math.min(canvasWidth - 20, newX));
  newY = Math.max(20, Math.min(canvasHeight - 20, newY));
  
  return {
    ...zombie,
    position: { x: newX, y: newY }
  };
};

export const canZombieAttack = (zombie: AlienZombie): boolean => {
  const now = Date.now();
  return zombie.state === 'attacking' && 
         zombie.health > 0 && 
         (now - zombie.lastAttack) >= zombie.attackCooldown;
};

export const zombieAttack = (zombie: AlienZombie): AlienZombie => {
  return {
    ...zombie,
    lastAttack: Date.now()
  };
};

export const damageZombie = (zombie: AlienZombie, damage: number): AlienZombie => {
  const newHealth = Math.max(0, zombie.health - damage);
  return {
    ...zombie,
    health: newHealth,
    state: newHealth <= 0 ? 'dead' : zombie.state
  };
};
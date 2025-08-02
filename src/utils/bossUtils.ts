import { Position, Velocity, BossZombie, BossProjectile, BOSS_CONFIG } from '../types/GameTypes';
import { calculateDistance } from './gameUtils';

export const createBoss = (canvasWidth: number, canvasHeight: number, rocketPosition: Position): BossZombie => {
  // Spawn boss away from rocket
  let bossPosition: Position;
  do {
    bossPosition = {
      x: Math.random() * canvasWidth,
      y: Math.random() * canvasHeight
    };
  } while (calculateDistance(bossPosition, rocketPosition) < 200);

  return {
    id: 'boss-zombie',
    position: bossPosition,
    velocity: { vx: 0, vy: 0 },
    health: BOSS_CONFIG.maxHealth,
    maxHealth: BOSS_CONFIG.maxHealth,
    phase: 1,
    speed: BOSS_CONFIG.phases[1].speed,
    damage: BOSS_CONFIG.phases[1].damage,
    attackRange: BOSS_CONFIG.phases[1].attackRange,
    lastAttack: 0,
    attackCooldown: BOSS_CONFIG.phases[1].attackCooldown,
    target: null,
    state: 'spawning',
    phaseTimer: 0,
    nextPhaseThreshold: BOSS_CONFIG.phases[1].healthThreshold
  };
};

export const updateBossPhase = (boss: BossZombie): BossZombie => {
  let newPhase = boss.phase;
  
  // Check if we need to transition to next phase based on health
  if (boss.health <= BOSS_CONFIG.phases[2].healthThreshold && boss.phase === 1) {
    newPhase = 2;
  } else if (boss.health <= BOSS_CONFIG.phases[3].healthThreshold && boss.phase === 2) {
    newPhase = 3;
  } else if (boss.health <= BOSS_CONFIG.phases[4].healthThreshold && boss.phase === 3) {
    newPhase = 4;
  }
  
  if (newPhase !== boss.phase) {
    const phaseConfig = BOSS_CONFIG.phases[newPhase];
    return {
      ...boss,
      phase: newPhase,
      speed: phaseConfig.speed,
      damage: phaseConfig.damage,
      attackRange: phaseConfig.attackRange,
      attackCooldown: phaseConfig.attackCooldown,
      state: 'phase_transition',
      phaseTimer: 1500, // Transition duration
      nextPhaseThreshold: newPhase < 4 ? BOSS_CONFIG.phases[newPhase + 1 as 2 | 3 | 4].healthThreshold : 0
    };
  }
  
  return boss;
};

export const updateBossAI = (boss: BossZombie, rocketPosition: Position, deltaTime: number): BossZombie => {
  if (boss.health <= 0) {
    return { ...boss, state: 'dead' };
  }
  
  // Handle phase transition
  if (boss.state === 'phase_transition') {
    const newPhaseTimer = boss.phaseTimer - deltaTime;
    if (newPhaseTimer <= 0) {
      return { ...boss, state: 'idle', phaseTimer: 0 };
    }
    return { ...boss, phaseTimer: newPhaseTimer };
  }
  
  const distanceToRocket = calculateDistance(boss.position, rocketPosition);
  const detectionRange = 300; // Boss has larger detection range
  
  let newState = boss.state;
  let newTarget = boss.target;
  let newVelocity = { ...boss.velocity };
  
  if (distanceToRocket <= detectionRange) {
    newTarget = rocketPosition;
    
    if (distanceToRocket <= boss.attackRange) {
      newState = 'attacking';
      newVelocity = { vx: 0, vy: 0 };
    } else {
      newState = 'moving';
      
      // Move towards rocket
      const dx = rocketPosition.x - boss.position.x;
      const dy = rocketPosition.y - boss.position.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      if (distance > 0) {
        newVelocity = {
          vx: (dx / distance) * boss.speed,
          vy: (dy / distance) * boss.speed
        };
      }
    }
  } else {
    newState = 'idle';
    newTarget = null;
    newVelocity = { vx: 0, vy: 0 };
  }
  
  return {
    ...boss,
    state: newState,
    target: newTarget,
    velocity: newVelocity
  };
};

export const updateBossPosition = (boss: BossZombie, deltaTime: number, canvasWidth: number, canvasHeight: number): BossZombie => {
  if (boss.state === 'attacking' || boss.state === 'phase_transition' || boss.state === 'dead') {
    return boss;
  }
  
  let newX = boss.position.x + boss.velocity.vx;
  let newY = boss.position.y + boss.velocity.vy;
  
  // Keep boss within bounds with some padding
  newX = Math.max(40, Math.min(canvasWidth - 40, newX));
  newY = Math.max(40, Math.min(canvasHeight - 40, newY));
  
  return {
    ...boss,
    position: { x: newX, y: newY }
  };
};

export const canBossAttack = (boss: BossZombie): boolean => {
  const now = Date.now();
  return boss.state === 'attacking' && 
         boss.health > 0 && 
         (now - boss.lastAttack) >= boss.attackCooldown;
};

export const bossAttack = (boss: BossZombie): BossZombie => {
  return {
    ...boss,
    lastAttack: Date.now()
  };
};

export const createBossProjectile = (
  boss: BossZombie,
  targetPosition: Position,
  projectileType: 'energy_blast' | 'poison_spit' | 'shockwave'
): BossProjectile => {
  const dx = targetPosition.x - boss.position.x;
  const dy = targetPosition.y - boss.position.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  
  const speed = projectileType === 'shockwave' ? 6 : 4;
  
  return {
    id: `boss-projectile-${Date.now()}`,
    position: { ...boss.position },
    velocity: {
      vx: distance > 0 ? (dx / distance) * speed : 0,
      vy: distance > 0 ? (dy / distance) * speed : 0
    },
    damage: boss.damage,
    lifetime: projectileType === 'shockwave' ? 800 : 1200,
    size: projectileType === 'shockwave' ? 20 : 12,
    type: projectileType
  };
};

export const updateBossProjectile = (projectile: BossProjectile, deltaTime: number): BossProjectile => {
  return {
    ...projectile,
    position: {
      x: projectile.position.x + projectile.velocity.vx,
      y: projectile.position.y + projectile.velocity.vy
    },
    lifetime: projectile.lifetime - deltaTime,
    size: projectile.type === 'shockwave' ? projectile.size + 0.5 : projectile.size // Shockwaves grow
  };
};

export const isBossProjectileExpired = (projectile: BossProjectile, canvasWidth: number, canvasHeight: number): boolean => {
  return (
    projectile.lifetime <= 0 ||
    projectile.position.x < 0 ||
    projectile.position.x > canvasWidth ||
    projectile.position.y < 0 ||
    projectile.position.y > canvasHeight
  );
};

export const damageBoss = (boss: BossZombie, damage: number): BossZombie => {
  const newHealth = Math.max(0, boss.health - damage);
  return {
    ...boss,
    health: newHealth,
    state: newHealth <= 0 ? 'dead' : boss.state
  };
};
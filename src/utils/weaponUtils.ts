import { Position, Projectile, FlameParticle, WeaponType, WEAPON_CONFIG, AlienZombie } from '../types/GameTypes';
import { calculateDistance } from './gameUtils';

export const createProjectile = (
  type: WeaponType,
  startPosition: Position,
  angle: number,
  id: string
): Projectile => {
  const config = WEAPON_CONFIG[type];
  const radians = (angle - 90) * (Math.PI / 180);
  
  return {
    id,
    type,
    position: { ...startPosition },
    velocity: {
      vx: Math.cos(radians) * config.speed,
      vy: Math.sin(radians) * config.speed
    },
    damage: config.damage,
    lifetime: config.lifetime,
    maxLifetime: config.lifetime,
    size: config.size
  };
};

export const createFlameParticles = (
  startPosition: Position,
  angle: number,
  count: number = 3
): FlameParticle[] => {
  const particles: FlameParticle[] = [];
  const config = WEAPON_CONFIG[WeaponType.FLAME];
  
  for (let i = 0; i < count; i++) {
    const spreadAngle = angle + (Math.random() - 0.5) * 60; // 60 degree spread
    const radians = (spreadAngle - 90) * (Math.PI / 180);
    const speed = config.speed * (0.7 + Math.random() * 0.6); // Varying speeds
    
    particles.push({
      id: `flame-${Date.now()}-${i}`,
      position: { 
        x: startPosition.x + (Math.random() - 0.5) * 10,
        y: startPosition.y + (Math.random() - 0.5) * 10
      },
      velocity: {
        vx: Math.cos(radians) * speed,
        vy: Math.sin(radians) * speed
      },
      size: config.size + Math.random() * 4,
      opacity: 0.8 + Math.random() * 0.2,
      lifetime: config.lifetime + Math.random() * 200,
      damage: config.damage
    });
  }
  
  return particles;
};

export const updateProjectile = (projectile: Projectile, deltaTime: number): Projectile => {
  return {
    ...projectile,
    position: {
      x: projectile.position.x + projectile.velocity.vx,
      y: projectile.position.y + projectile.velocity.vy
    },
    lifetime: projectile.lifetime - deltaTime
  };
};

export const updateFlameParticle = (particle: FlameParticle, deltaTime: number): FlameParticle => {
  return {
    ...particle,
    position: {
      x: particle.position.x + particle.velocity.vx,
      y: particle.position.y + particle.velocity.vy
    },
    velocity: {
      vx: particle.velocity.vx * 0.98, // Slow down over time
      vy: particle.velocity.vy * 0.98
    },
    lifetime: particle.lifetime - deltaTime,
    opacity: Math.max(0, particle.opacity - 0.01)
  };
};

export const checkProjectileZombieCollision = (
  projectile: Projectile,
  zombie: AlienZombie
): boolean => {
  if (zombie.health <= 0) return false;
  
  const distance = calculateDistance(projectile.position, zombie.position);
  const collisionRadius = projectile.size + 20; // Zombie hit radius
  
  return distance < collisionRadius;
};

export const checkFlameZombieCollision = (
  particle: FlameParticle,
  zombie: AlienZombie
): boolean => {
  if (zombie.health <= 0) return false;
  
  const distance = calculateDistance(particle.position, zombie.position);
  const collisionRadius = particle.size + 15; // Smaller than projectile for balance
  
  return distance < collisionRadius;
};

export const isProjectileOutOfBounds = (
  projectile: Projectile,
  canvasWidth: number,
  canvasHeight: number
): boolean => {
  return (
    projectile.position.x < 0 ||
    projectile.position.x > canvasWidth ||
    projectile.position.y < 0 ||
    projectile.position.y > canvasHeight ||
    projectile.lifetime <= 0
  );
};

export const isFlameParticleExpired = (particle: FlameParticle): boolean => {
  return particle.lifetime <= 0 || particle.opacity <= 0;
};
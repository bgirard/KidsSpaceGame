export interface Position {
  x: number;
  y: number;
}

export interface Velocity {
  vx: number;
  vy: number;
}

export enum ResourceType {
  IRON = 'iron',
  CRYSTAL = 'crystal',
  ENERGY = 'energy',
  RARE_METALS = 'rare_metals'
}

export interface ResourceNode {
  id: string;
  type: ResourceType;
  position: Position;
  amount: number;
  maxAmount: number;
  regenerationRate: number;
  lastHarvested: number;
}

export interface ResourceInventory {
  [ResourceType.IRON]: number;
  [ResourceType.CRYSTAL]: number;
  [ResourceType.ENERGY]: number;
  [ResourceType.RARE_METALS]: number;
}

export const RESOURCE_CONFIG = {
  [ResourceType.IRON]: {
    emoji: '⚙️',
    color: '#8B4513',
    glowColor: '#CD853F',
    name: 'Iron'
  },
  [ResourceType.CRYSTAL]: {
    emoji: '💎',
    color: '#4169E1',
    glowColor: '#87CEEB',
    name: 'Crystal'
  },
  [ResourceType.ENERGY]: {
    emoji: '⚡',
    color: '#FFD700',
    glowColor: '#FFFF00',
    name: 'Energy'
  },
  [ResourceType.RARE_METALS]: {
    emoji: '🌟',
    color: '#9932CC',
    glowColor: '#DA70D6',
    name: 'Rare Metals'
  }
};

export enum ZombieType {
  CRAWLER = 'crawler',
  HUNTER = 'hunter',
  BRUTE = 'brute',
  SPITTER = 'spitter'
}

export interface AlienZombie {
  id: string;
  type: ZombieType;
  position: Position;
  velocity: Velocity;
  health: number;
  maxHealth: number;
  speed: number;
  damage: number;
  attackRange: number;
  lastAttack: number;
  attackCooldown: number;
  target: Position | null;
  state: 'idle' | 'chasing' | 'attacking' | 'dead';
}

export const ZOMBIE_CONFIG = {
  [ZombieType.CRAWLER]: {
    emoji: '🧟',
    health: 30,
    speed: 0.8,
    damage: 10,
    attackRange: 25,
    attackCooldown: 2000,
    color: '#228B22',
    name: 'Crawler'
  },
  [ZombieType.HUNTER]: {
    emoji: '👽',
    health: 50,
    speed: 1.5,
    damage: 15,
    attackRange: 30,
    attackCooldown: 1500,
    color: '#FF4500',
    name: 'Hunter'
  },
  [ZombieType.BRUTE]: {
    emoji: '👹',
    health: 100,
    speed: 0.5,
    damage: 25,
    attackRange: 35,
    attackCooldown: 3000,
    color: '#8B0000',
    name: 'Brute'
  },
  [ZombieType.SPITTER]: {
    emoji: '🛸',
    health: 40,
    speed: 0.6,
    damage: 12,
    attackRange: 80,
    attackCooldown: 2500,
    color: '#9932CC',
    name: 'Spitter'
  }
};

export enum WeaponType {
  LASER = 'laser',
  FLAME = 'flame'
}

export interface Projectile {
  id: string;
  type: WeaponType;
  position: Position;
  velocity: Velocity;
  damage: number;
  lifetime: number;
  maxLifetime: number;
  size: number;
}

export interface FlameParticle {
  id: string;
  position: Position;
  velocity: Velocity;
  size: number;
  opacity: number;
  lifetime: number;
  damage: number;
}

export interface WeaponState {
  energy: number;
  maxEnergy: number;
  laserCooldown: number;
  flameCooldown: number;
  lastLaserFire: number;
  lastFlameUse: number;
}

export const WEAPON_CONFIG = {
  [WeaponType.LASER]: {
    energyCost: 5,
    damage: 25,
    cooldown: 200,
    speed: 8,
    lifetime: 1000,
    size: 3,
    color: '#00ffff',
    name: 'Laser'
  },
  [WeaponType.FLAME]: {
    energyCost: 3,
    damage: 15,
    cooldown: 100,
    speed: 4,
    lifetime: 400,
    size: 6,
    color: '#ff4500',
    name: 'Flamethrower'
  }
};
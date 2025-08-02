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
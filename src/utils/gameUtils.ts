import { Position, ResourceNode, ResourceType } from '../types/GameTypes';

export const generateResourceNodes = (count: number, canvasWidth: number, canvasHeight: number): ResourceNode[] => {
  const nodes: ResourceNode[] = [];
  const resourceTypes = Object.values(ResourceType);
  
  for (let i = 0; i < count; i++) {
    const type = resourceTypes[Math.floor(Math.random() * resourceTypes.length)];
    const maxAmount = 50 + Math.random() * 100;
    
    nodes.push({
      id: `resource-${i}`,
      type,
      position: {
        x: Math.random() * canvasWidth,
        y: Math.random() * canvasHeight
      },
      amount: maxAmount * 0.8 + Math.random() * maxAmount * 0.2,
      maxAmount,
      regenerationRate: 0.1 + Math.random() * 0.2,
      lastHarvested: 0
    });
  }
  
  return nodes;
};

export const calculateDistance = (pos1: Position, pos2: Position): number => {
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

export const isWithinCollectionRange = (rocketPos: Position, nodePos: Position, range: number = 30): boolean => {
  return calculateDistance(rocketPos, nodePos) < range;
};

export const updateResourceNodeRegeneration = (node: ResourceNode, deltaTime: number): ResourceNode => {
  if (node.amount < node.maxAmount) {
    return {
      ...node,
      amount: Math.min(node.maxAmount, node.amount + node.regenerationRate * deltaTime)
    };
  }
  return node;
};

export const collectFromNode = (node: ResourceNode, collectionRate: number = 5): { node: ResourceNode; collected: number } => {
  const collected = Math.min(node.amount, collectionRate);
  return {
    node: {
      ...node,
      amount: node.amount - collected,
      lastHarvested: Date.now()
    },
    collected
  };
};
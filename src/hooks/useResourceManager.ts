import { useState, useCallback } from 'react';
import { ResourceType, ResourceInventory } from '../types/GameTypes';

export const useResourceManager = () => {
  const [inventory, setInventory] = useState<ResourceInventory>({
    [ResourceType.IRON]: 0,
    [ResourceType.CRYSTAL]: 0,
    [ResourceType.ENERGY]: 0,
    [ResourceType.RARE_METALS]: 0
  });

  const collectResource = useCallback((type: ResourceType, amount: number) => {
    setInventory(prev => ({
      ...prev,
      [type]: prev[type] + amount
    }));
  }, []);

  const spendResource = useCallback((type: ResourceType, amount: number): boolean => {
    if (inventory[type] >= amount) {
      setInventory(prev => ({
        ...prev,
        [type]: prev[type] - amount
      }));
      return true;
    }
    return false;
  }, [inventory]);

  const hasResource = useCallback((type: ResourceType, amount: number): boolean => {
    return inventory[type] >= amount;
  }, [inventory]);

  return {
    inventory,
    collectResource,
    spendResource,
    hasResource
  };
};
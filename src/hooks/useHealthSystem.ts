import { useState, useCallback } from 'react';

export interface HealthState {
  current: number;
  max: number;
  shield: number;
  maxShield: number;
}

export const useHealthSystem = (initialHealth: number = 100, initialShield: number = 50) => {
  const [health, setHealth] = useState<HealthState>({
    current: initialHealth,
    max: initialHealth,
    shield: initialShield,
    maxShield: initialShield
  });

  const takeDamage = useCallback((damage: number) => {
    setHealth(prev => {
      let remainingDamage = damage;
      let newShield = prev.shield;
      let newHealth = prev.current;
      
      if (newShield > 0) {
        const shieldDamage = Math.min(remainingDamage, newShield);
        newShield -= shieldDamage;
        remainingDamage -= shieldDamage;
      }
      
      if (remainingDamage > 0) {
        newHealth = Math.max(0, newHealth - remainingDamage);
      }
      
      return {
        ...prev,
        current: newHealth,
        shield: newShield
      };
    });
  }, []);

  const heal = useCallback((amount: number) => {
    setHealth(prev => ({
      ...prev,
      current: Math.min(prev.max, prev.current + amount)
    }));
  }, []);

  const rechargeShield = useCallback((amount: number) => {
    setHealth(prev => ({
      ...prev,
      shield: Math.min(prev.maxShield, prev.shield + amount)
    }));
  }, []);

  const isDead = health.current <= 0;
  const healthPercentage = (health.current / health.max) * 100;
  const shieldPercentage = (health.shield / health.maxShield) * 100;

  return {
    health,
    takeDamage,
    heal,
    rechargeShield,
    isDead,
    healthPercentage,
    shieldPercentage
  };
};
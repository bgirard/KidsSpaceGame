import { useState, useCallback } from 'react';
import { WeaponState, WeaponType, WEAPON_CONFIG } from '../types/GameTypes';

export const useWeaponSystem = (initialEnergy: number = 100) => {
  const [weaponState, setWeaponState] = useState<WeaponState>({
    energy: initialEnergy,
    maxEnergy: initialEnergy,
    laserCooldown: 0,
    flameCooldown: 0,
    lastLaserFire: 0,
    lastFlameUse: 0
  });

  const canFireWeapon = useCallback((weaponType: WeaponType): boolean => {
    const config = WEAPON_CONFIG[weaponType];
    const now = Date.now();
    
    if (weaponState.energy < config.energyCost) {
      return false;
    }
    
    if (weaponType === WeaponType.LASER) {
      return (now - weaponState.lastLaserFire) >= config.cooldown;
    } else if (weaponType === WeaponType.FLAME) {
      return (now - weaponState.lastFlameUse) >= config.cooldown;
    }
    
    return false;
  }, [weaponState]);

  const fireWeapon = useCallback((weaponType: WeaponType) => {
    if (!canFireWeapon(weaponType)) {
      return false;
    }
    
    const config = WEAPON_CONFIG[weaponType];
    const now = Date.now();
    
    setWeaponState(prev => ({
      ...prev,
      energy: prev.energy - config.energyCost,
      lastLaserFire: weaponType === WeaponType.LASER ? now : prev.lastLaserFire,
      lastFlameUse: weaponType === WeaponType.FLAME ? now : prev.lastFlameUse
    }));
    
    return true;
  }, [canFireWeapon]);

  const rechargeEnergy = useCallback((amount: number) => {
    setWeaponState(prev => ({
      ...prev,
      energy: Math.min(prev.maxEnergy, prev.energy + amount)
    }));
  }, []);

  const consumeEnergy = useCallback((amount: number) => {
    setWeaponState(prev => ({
      ...prev,
      energy: Math.max(0, prev.energy - amount)
    }));
  }, []);

  const energyPercentage = (weaponState.energy / weaponState.maxEnergy) * 100;

  return {
    weaponState,
    canFireWeapon,
    fireWeapon,
    rechargeEnergy,
    consumeEnergy,
    energyPercentage
  };
};
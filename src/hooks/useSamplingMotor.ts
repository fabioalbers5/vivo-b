import { useState, useEffect } from 'react';
import { SamplingMotor } from '@/components/sampling/MotorSelector';

const STORAGE_KEY = 'vivo_sampling_motor';

export const useSamplingMotor = () => {
  const [selectedMotor, setSelectedMotor] = useState<SamplingMotor>(() => {
    // Carregar do localStorage na inicialização
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored && ['highest-value', 'top-suppliers', 'custom'].includes(stored)) {
        return stored as SamplingMotor;
      }
    }
    return 'custom'; // Default
  });

  // Persistir no localStorage quando mudar
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, selectedMotor);
    }
  }, [selectedMotor]);

  return {
    selectedMotor,
    setSelectedMotor
  };
};

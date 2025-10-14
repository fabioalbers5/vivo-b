import React, { createContext, useContext, useState, ReactNode } from 'react';
import { LegacyContract } from '@/hooks/useContractFilters';

interface SampleContextType {
  // Dados da amostra atual
  sampleContracts: LegacyContract[];
  sampleMetadata: {
    totalCount: number;
    appliedFilters: Record<string, unknown>;
    lastUpdated: Date;
    amostraId?: number;
  };
  
  // Analista responsável
  selectedAnalyst: string;
  setSelectedAnalyst: (analyst: string) => void;
  
  // Funções para gerenciar a amostra
  setSample: (contracts: LegacyContract[], filters: Record<string, unknown>, amostraId?: number) => void;
  clearSample: () => void;
  
  // Estado de carregamento
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

const SampleContext = createContext<SampleContextType | undefined>(undefined);

interface SampleProviderProps {
  children: ReactNode;
}

export const SampleProvider: React.FC<SampleProviderProps> = ({ children }) => {
  // Função para carregar dados do localStorage
  const loadFromStorage = () => {
    try {
      const storedContracts = localStorage.getItem('sampleContracts');
      const storedMetadata = localStorage.getItem('sampleMetadata');
      
      if (storedContracts && storedMetadata) {
        const contracts = JSON.parse(storedContracts);
        const metadata = JSON.parse(storedMetadata);
        
        return {
          contracts,
          metadata: {
            ...metadata,
            lastUpdated: new Date(metadata.lastUpdated)
          }
        };
      }
    } catch (error) {
      console.error('Erro ao carregar amostra do localStorage:', error);
    }
    
    return {
      contracts: [],
      metadata: {
        totalCount: 0,
        appliedFilters: {},
        lastUpdated: new Date(),
        amostraId: undefined
      }
    };
  };

  // Carregar dados iniciais do localStorage
  const initialData = loadFromStorage();
  
  const [sampleContracts, setSampleContracts] = useState<LegacyContract[]>(initialData.contracts);
  const [sampleMetadata, setSampleMetadata] = useState(initialData.metadata);
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const setSample = (contracts: LegacyContract[], filters: Record<string, unknown>, amostraId?: number) => {
    const metadata = {
      totalCount: contracts.length,
      appliedFilters: filters,
      lastUpdated: new Date(),
      amostraId
    };
    
    setSampleContracts(contracts);
    setSampleMetadata(metadata);
    
    // Salvar no localStorage
    try {
      localStorage.setItem('sampleContracts', JSON.stringify(contracts));
      localStorage.setItem('sampleMetadata', JSON.stringify(metadata));
    } catch (error) {
      console.error('Erro ao salvar amostra no localStorage:', error);
    }
  };

  const clearSample = () => {
    setSampleContracts([]);
    setSampleMetadata({
      totalCount: 0,
      appliedFilters: {},
      lastUpdated: new Date(),
      amostraId: undefined
    });
    
    // Limpar do localStorage
    try {
      localStorage.removeItem('sampleContracts');
      localStorage.removeItem('sampleMetadata');
    } catch (error) {
      console.error('Erro ao limpar amostra do localStorage:', error);
    }
  };

  const value: SampleContextType = {
    sampleContracts,
    sampleMetadata,
    selectedAnalyst,
    setSelectedAnalyst,
    setSample,
    clearSample,
    isLoading,
    setIsLoading
  };

  return (
    <SampleContext.Provider value={value}>
      {children}
    </SampleContext.Provider>
  );
};

export const useSample = () => {
  const context = useContext(SampleContext);
  if (context === undefined) {
    throw new Error('useSample must be used within a SampleProvider');
  }
  return context;
};

export default SampleContext;

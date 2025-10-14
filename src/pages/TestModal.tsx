import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Brain } from 'lucide-react';
import ContractAnalysisModal from '@/components/ContractAnalysisModal';

/**
 * Página de teste rápido para o modal
 * Adicione esta rota temporariamente em App.tsx para testar
 */
const TestModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="p-8 min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Teste do Modal de Análise de IA</h1>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
          <p className="text-gray-600 mb-6">
            Clique no botão abaixo para testar o modal corrigido com scroll funcional:
          </p>
          
          <Button 
            onClick={() => setIsOpen(true)}
            className="bg-purple-600 hover:bg-purple-700"
            size="lg"
          >
            <Brain className="h-5 w-5 mr-2" />
            Abrir Modal de Análise
          </Button>
          
          <div className="mt-6 p-4 bg-blue-50 rounded-lg text-left">
            <h3 className="font-semibold text-blue-900 mb-2">Melhorias implementadas:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✅ Modal com altura fixa (90% da tela)</li>
              <li>✅ Scroll funcional no conteúdo</li>
              <li>✅ Header e footer fixos</li>
              <li>✅ Cards mais compactos e responsivos</li>
              <li>✅ Bordas coloridas por status</li>
              <li>✅ Texto com quebra de linha</li>
              <li>✅ Botões responsivos</li>
            </ul>
          </div>
        </div>
      </div>

      <ContractAnalysisModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        contractId="TEST-001"
      />
    </div>
  );
};

export default TestModal;
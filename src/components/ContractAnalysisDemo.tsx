import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain } from 'lucide-react';
import ContractAnalysisModal from './ContractAnalysisModal';

/**
 * Componente de demonstração do Modal de Análise de IA
 * Use este componente para testar o modal de forma independente
 */
const ContractAnalysisDemo: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedContract, setSelectedContract] = useState('DEMO-001');

  const demoContracts = [
    { id: 'DEMO-001', name: 'Contrato de Manutenção Telecom' },
    { id: 'DEMO-002', name: 'Contrato de Suporte Técnico' },
    { id: 'DEMO-003', name: 'Contrato de Infraestrutura' },
  ];

  const openAnalysis = (contractId: string) => {
    setSelectedContract(contractId);
    setModalOpen(true);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-purple-600" />
            Demo - Modal de Análise de IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-600 mb-6">
            Clique em qualquer botão abaixo para testar o modal de análise de IA:
          </p>
          
          <div className="space-y-4">
            {demoContracts.map((contract) => (
              <div key={contract.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <h3 className="font-semibold">{contract.name}</h3>
                  <p className="text-sm text-slate-500">ID: {contract.id}</p>
                </div>
                <Button 
                  onClick={() => openAnalysis(contract.id)}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  <Brain className="h-4 w-4 mr-2" />
                  Ver Análise de IA
                </Button>
              </div>
            ))}
          </div>

          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Características do Modal:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• ✅ Responsivo e limitado a 90% da altura da tela</li>
              <li>• ✅ 16 campos de análise com indicadores visuais</li>
              <li>• ✅ Botões de evidência em cada campo (ícone de olho)</li>
              <li>• ✅ Sub-modal para visualização de evidências</li>
              <li>• ✅ Resumo estatístico com score de conformidade</li>
              <li>• ✅ Scroll automático quando necessário</li>
              <li>• ✅ Dados simulados demonstrando todos os status</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Análise */}
      <ContractAnalysisModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        contractId={selectedContract}
      />
    </div>
  );
};

export default ContractAnalysisDemo;
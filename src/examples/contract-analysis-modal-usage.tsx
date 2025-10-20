/**
 * EXEMPLO DE USO: ContractAnalysisModal com Status Individual por Pagamento
 * 
 * Este exemplo demonstra como usar o ContractAnalysisModal com controle
 * de status individual para cada pagamento, permitindo bloquear apenas
 * o pagamento que foi aprovado, devolvido ou rejeitado.
 */

import React, { useState } from 'react';
import ContractAnalysisModal from '@/components/ContractAnalysisModal';

// Tipo para o status de pagamento
type PaymentStatus = 'pending' | 'approved' | 'returned' | 'rejected';

// Interface para os dados do pagamento
interface Payment {
  id: string;
  contractId: string;
  status: PaymentStatus;
  // ... outros campos do pagamento
}

// Componente de exemplo
export const PaymentAnalysisExample: React.FC = () => {
  // Estado para controlar qual modal está aberto
  const [selectedPaymentId, setSelectedPaymentId] = useState<string | null>(null);
  
  // Estado para armazenar os status de cada pagamento
  // Em produção, isso viria do backend/Supabase
  const [paymentStatuses, setPaymentStatuses] = useState<Record<string, PaymentStatus>>({
    'CONTRATO-001': 'pending',
    'CONTRATO-002': 'pending',
    'CONTRATO-003': 'approved', // Este está bloqueado
    'CONTRATO-004': 'pending',
    'CONTRATO-005': 'returned', // Este está bloqueado
  });

  // Lista de pagamentos (mock)
  const payments: Payment[] = [
    { id: 'CONTRATO-001', contractId: 'CONTRATO-001', status: paymentStatuses['CONTRATO-001'] },
    { id: 'CONTRATO-002', contractId: 'CONTRATO-002', status: paymentStatuses['CONTRATO-002'] },
    { id: 'CONTRATO-003', contractId: 'CONTRATO-003', status: paymentStatuses['CONTRATO-003'] },
    { id: 'CONTRATO-004', contractId: 'CONTRATO-004', status: paymentStatuses['CONTRATO-004'] },
    { id: 'CONTRATO-005', contractId: 'CONTRATO-005', status: paymentStatuses['CONTRATO-005'] },
  ];

  // Handler para atualizar o status de um pagamento específico
  const handleStatusChange = async (contractId: string, newStatus: 'approved' | 'returned' | 'rejected') => {
    console.log(`Atualizando status do contrato ${contractId} para ${newStatus}`);

    // Atualizar o estado local
    setPaymentStatuses(prev => ({
      ...prev,
      [contractId]: newStatus
    }));

    // Em produção, você faria uma chamada ao backend/Supabase aqui:
    /*
    try {
      const { error } = await supabase
        .from('contratos_vivo')
        .update({ 
          status_pagamento: newStatus,
          data_atualizacao: new Date().toISOString(),
          // Adicionar outros campos conforme necessário
        })
        .eq('numero_contrato', contractId);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        // Reverter o estado local se houver erro
        setPaymentStatuses(prev => ({
          ...prev,
          [contractId]: prev[contractId] // Voltar ao status anterior
        }));
      } else {
        console.log('Status atualizado com sucesso no banco de dados');
      }
    } catch (err) {
      console.error('Erro ao atualizar status:', err);
    }
    */
  };

  // Handler para abrir o modal de um pagamento específico
  const handleOpenAnalysis = (contractId: string) => {
    setSelectedPaymentId(contractId);
  };

  // Handler para fechar o modal
  const handleCloseModal = () => {
    setSelectedPaymentId(null);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Análise de Pagamentos</h1>
      
      {/* Lista de pagamentos */}
      <div className="space-y-4">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className={`p-4 border rounded-lg flex items-center justify-between ${
              payment.status === 'approved' ? 'bg-green-50 border-green-200' :
              payment.status === 'returned' ? 'bg-orange-50 border-orange-200' :
              payment.status === 'rejected' ? 'bg-red-50 border-red-200' :
              'bg-white border-gray-200'
            }`}
          >
            <div>
              <p className="font-semibold">{payment.contractId}</p>
              <p className="text-sm text-gray-600">
                Status: {
                  payment.status === 'pending' ? 'Pendente' :
                  payment.status === 'approved' ? 'Aprovado' :
                  payment.status === 'returned' ? 'Devolvido' :
                  'Rejeitado'
                }
              </p>
            </div>
            <button
              onClick={() => handleOpenAnalysis(payment.contractId)}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Analisar
            </button>
          </div>
        ))}
      </div>

      {/* Modal de análise - apenas um por vez */}
      {selectedPaymentId && (
        <ContractAnalysisModal
          isOpen={true}
          onClose={handleCloseModal}
          contractId={selectedPaymentId}
          paymentStatus={paymentStatuses[selectedPaymentId]}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
};

/**
 * EXPLICAÇÃO DO FUNCIONAMENTO:
 * 
 * 1. Estado de Controle:
 *    - paymentStatuses: Record<string, PaymentStatus> mantém o status de cada pagamento
 *    - selectedPaymentId: string | null controla qual modal está aberto
 * 
 * 2. Fluxo de Atualização:
 *    - Usuário clica no botão "Analisar" → abre o modal com o status do pagamento
 *    - Usuário toma uma ação (Liberar/Devolver/Rejeitar) → handleStatusChange é chamado
 *    - handleStatusChange atualiza o estado local E o banco de dados
 *    - Modal se fecha e o status do pagamento é atualizado na lista
 * 
 * 3. Bloqueio Individual:
 *    - Cada pagamento tem seu próprio status
 *    - Quando status !== 'pending', o modal desabilita os controles
 *    - Banner visual indica o status bloqueado
 *    - Outros pagamentos permanecem editáveis
 * 
 * 4. Integração com Supabase (exemplo comentado):
 *    - Chamar supabase.from('contratos_vivo').update()
 *    - Atualizar campos: status_pagamento, data_atualizacao, etc.
 *    - Tratar erros e reverter estado se necessário
 * 
 * 5. Benefícios:
 *    - Controle granular por pagamento
 *    - Estado sincronizado com banco de dados
 *    - UX clara com indicadores visuais
 *    - Rastreabilidade de ações
 */

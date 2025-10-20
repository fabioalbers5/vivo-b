import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import JustificationModal from "./JustificationModal";
import ConfirmActionModal from "./ConfirmActionModal";
import { useToast } from "@/hooks/use-toast";
import { 
  Eye, 
  X, 
  FileText, 
  Building, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Info,
  Edit3,
  Save,
  RotateCcw,
  Check,
  Ban,
  Receipt,
  FileSpreadsheet,
  Calculator,
  Upload,
  FileDown,
  Undo2,
  Plus,
  Trash2
} from 'lucide-react';

interface ContractAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
  paymentStatus?: 'pending' | 'approved' | 'returned' | 'rejected';
  onStatusChange?: (contractId: string, status: 'approved' | 'returned' | 'rejected') => void;
}

interface AnalysisField {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  status?: 'compliant' | 'non-compliant' | 'warning' | 'neutral';
  hasEvidence?: boolean;
  isCustom?: boolean; // Novo: indica se é um campo adicionado pelo usuário
  customEvidence?: File; // Novo: evidência customizada
}

interface CustomFieldForm {
  label: string;
  value: string;
  evidence: File | null;
}

const ContractAnalysisModal: React.FC<ContractAnalysisModalProps> = ({
  isOpen,
  onClose,
  contractId,
  paymentStatus = 'pending',
  onStatusChange
}) => {
  const { toast } = useToast();
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  
  // Estados para correções
  const [editingField, setEditingField] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estado para evidências atualizadas
  const [updatedEvidences, setUpdatedEvidences] = useState<Record<string, File>>({});

  // Estados para modais de justificativa
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);

  // Estados para modais de confirmação
  const [approveModalOpen, setApproveModalOpen] = useState(false);

  // Estados para campos customizados
  const [customFields, setCustomFields] = useState<AnalysisField[]>([]);
  const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
  const [newFieldForm, setNewFieldForm] = useState<CustomFieldForm>({
    label: '',
    value: '',
    evidence: null
  });

  // Estados para geração de WP
  const [wpModalOpen, setWpModalOpen] = useState(false);
  const [selectedFieldsForWP, setSelectedFieldsForWP] = useState<Set<string>>(new Set());

  // Verificar se o pagamento está bloqueado
  const isLocked = paymentStatus !== 'pending';

  // Dados simulados da análise de IA
  const analysisData: AnalysisField[] = [
    {
      id: 'fornecedor',
      label: 'Fornecedor',
      value: 'EMPRESA EXEMPLO LTDA',
      icon: Building,
      status: 'neutral',
      hasEvidence: true
    },
    {
      id: 'cnpj',
      label: 'CNPJ',
      value: '12.345.678/0001-90',
      icon: FileText,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'doc_sap',
      label: 'Nº Doc SAP',
      value: 'SAP-2024-001234',
      icon: FileText,
      status: 'neutral',
      hasEvidence: true
    },
    {
      id: 'tipo_doc',
      label: 'Tipo de Doc',
      value: 'Contrato de Prestação de Serviços',
      icon: FileText,
      status: 'neutral',
      hasEvidence: true
    },
    {
      id: 'enquadramento',
      label: 'Enquadramento da Normativa',
      value: 'NCCP03 - Categoria A',
      icon: CheckCircle,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'objeto_contratual',
      label: 'Objeto Contratual',
      value: 'Serviços de manutenção e suporte técnico em infraestrutura de telecomunicações',
      icon: FileText,
      status: 'neutral',
      hasEvidence: true
    },
    {
      id: 'vigencia',
      label: 'Vigência',
      value: '12 meses (01/01/2024 a 31/12/2024)',
      icon: Calendar,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'reajuste',
      label: 'Reajuste',
      value: 'Anual conforme IPCA',
      icon: DollarSign,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'indice_reajuste',
      label: 'Índice de reajuste',
      value: 'IPCA - Índice Nacional de Preços ao Consumidor Amplo',
      icon: DollarSign,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'valor',
      label: 'Valor',
      value: 'R$ 150.000,00',
      icon: DollarSign,
      status: 'neutral',
      hasEvidence: true
    },
    {
      id: 'condicao_pagamento',
      label: 'Condição de pagamento',
      value: '30 dias após apresentação da nota fiscal',
      icon: DollarSign,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'normativa_nccp03',
      label: 'Está de acordo com a normativa NCCP03?',
      value: 'Sim - Todos os requisitos atendidos',
      icon: CheckCircle,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'ciclo_tesouraria',
      label: 'Ciclo de Tesouraria',
      value: '30 dias - Dentro do padrão estabelecido',
      icon: Calendar,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'clausula_anticorrupcao',
      label: 'Cláusula anticorrupção',
      value: 'Presente - Cláusula 15.2 do contrato',
      icon: CheckCircle,
      status: 'compliant',
      hasEvidence: true
    },
    {
      id: 'redir',
      label: 'Redir',
      value: 'Não aplicável para este tipo de contrato',
      icon: Info,
      status: 'neutral',
      hasEvidence: false
    },
    {
      id: 'nota_adicional',
      label: 'Nota adicional',
      value: 'Contrato em conformidade com todas as normativas vigentes. Recomenda-se revisão anual dos termos de reajuste.',
      icon: Info,
      status: 'neutral',
      hasEvidence: false
    }
  ];

  // Funções para gerenciar correções
  const handleEditField = (fieldId: string) => {
    setEditingField(fieldId);
    // Inicializar com o valor atual se não há correção
    if (!corrections[fieldId]) {
      const field = analysisData.find(f => f.id === fieldId);
      if (field) {
        setCorrections(prev => ({ ...prev, [fieldId]: field.value }));
      }
    }
  };

  const handleSaveCorrection = (fieldId: string) => {
    setEditingField(null);
    setHasChanges(true);
  };

  const handleCancelEdit = (fieldId: string) => {
    setEditingField(null);
    // Remover a correção se cancelar
    setCorrections(prev => {
      const newCorrections = { ...prev };
      delete newCorrections[fieldId];
      return newCorrections;
    });
  };

  const handleCorrectionChange = (fieldId: string, value: string) => {
    setCorrections(prev => ({ ...prev, [fieldId]: value }));
  };

  const resetAllCorrections = () => {
    setCorrections({});
    setEditingField(null);
    setHasChanges(false);
  };

  const saveAllCorrections = () => {
    // Aqui você pode enviar as correções para a API
    console.log('Correções salvas:', corrections);
    alert('Correções salvas com sucesso!');
    setHasChanges(false);
  };

  // Função para obter o valor atual (correção ou valor original)
  const getCurrentValue = (field: AnalysisField) => {
    return corrections[field.id] || field.value;
  };

  // Funções para gerenciar campos customizados
  const handleAddCustomField = () => {
    if (!newFieldForm.label.trim() || !newFieldForm.value.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e a descrição do campo.",
        variant: "destructive"
      });
      return;
    }

    const newField: AnalysisField = {
      id: `custom_${Date.now()}`,
      label: newFieldForm.label,
      value: newFieldForm.value,
      icon: FileText,
      status: 'neutral',
      hasEvidence: !!newFieldForm.evidence,
      isCustom: true,
      customEvidence: newFieldForm.evidence || undefined
    };

    setCustomFields(prev => [...prev, newField]);
    
    toast({
      title: "Campo adicionado",
      description: `O campo "${newFieldForm.label}" foi adicionado com sucesso.`,
    });

    // Resetar formulário e fechar modal
    setNewFieldForm({ label: '', value: '', evidence: null });
    setAddFieldModalOpen(false);
  };

  const handleRemoveCustomField = (fieldId: string) => {
    setCustomFields(prev => prev.filter(f => f.id !== fieldId));
    toast({
      title: "Campo removido",
      description: "O campo customizado foi removido.",
    });
  };

  const handleEvidenceUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setNewFieldForm(prev => ({ ...prev, evidence: file }));
    }
  };

  // Funções para devolução e rejeição
  const handleReturnPayment = (justification: string) => {
    console.log('Pagamento devolvido para contrato:', contractId);
    console.log('Justificativa:', justification);
    console.log('Correções aplicadas:', corrections);

    // Notificar o componente pai sobre a mudança de status
    if (onStatusChange) {
      onStatusChange(contractId, 'returned');
    }

    toast({
      title: "Pagamento Devolvido",
      description: `O pagamento do contrato ${contractId} foi devolvido ao responsável.`,
    });

    // Aqui você enviaria a justificativa para o backend
    // Backend enviaria o email para o responsável pelo pagamento

    onClose();
  };

  const handleRejectPayment = (justification: string) => {
    console.log('Pagamento rejeitado para contrato:', contractId);
    console.log('Justificativa:', justification);
    console.log('Correções aplicadas antes da rejeição:', corrections);

    // Notificar o componente pai sobre a mudança de status
    if (onStatusChange) {
      onStatusChange(contractId, 'rejected');
    }

    toast({
      title: "Pagamento Rejeitado",
      description: `O pagamento do contrato ${contractId} foi rejeitado e não será processado.`,
      variant: "destructive"
    });

    // Aqui você enviaria a justificativa para o backend
    // Backend enviaria o email para o responsável pelo pagamento

    onClose();
  };

  const handleApprovePayment = () => {
    console.log('Pagamento liberado para contrato:', contractId);
    console.log('Correções aplicadas:', corrections);
    console.log('Total de correções:', Object.keys(corrections).length);

    // Notificar o componente pai sobre a mudança de status
    if (onStatusChange) {
      onStatusChange(contractId, 'approved');
    }

    toast({
      title: "Pagamento Liberado",
      description: `O pagamento do contrato ${contractId} foi liberado com sucesso e será processado em breve.`,
      variant: "default"
    });

    onClose();
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'compliant':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'non-compliant':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      default:
        return <Info className="h-4 w-4 text-blue-600" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'compliant':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Conforme</Badge>;
      case 'non-compliant':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Não conforme</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Atenção</Badge>;
      default:
        return <Badge variant="outline">Neutro</Badge>;
    }
  };

  const handleEvidenceClick = (fieldLabel: string) => {
    setSelectedEvidence(fieldLabel);
  };

  const closeEvidence = () => {
    setSelectedEvidence(null);
  };

  const handleOpenWPModal = () => {
    // Selecionar todos os campos por padrão
    const allFields = [...analysisData, ...customFields];
    setSelectedFieldsForWP(new Set(allFields.map(f => f.id)));
    setWpModalOpen(true);
  };

  const toggleFieldSelection = (fieldId: string) => {
    setSelectedFieldsForWP(prev => {
      const newSet = new Set(prev);
      if (newSet.has(fieldId)) {
        newSet.delete(fieldId);
      } else {
        newSet.add(fieldId);
      }
      return newSet;
    });
  };

  const toggleSelectAll = () => {
    const allFields = [...analysisData, ...customFields];
    if (selectedFieldsForWP.size === allFields.length) {
      // Desselecionar todos
      setSelectedFieldsForWP(new Set());
    } else {
      // Selecionar todos
      setSelectedFieldsForWP(new Set(allFields.map(f => f.id)));
    }
  };

  const handleGenerateWP = () => {
    if (selectedFieldsForWP.size === 0) {
      toast({
        title: "Nenhum campo selecionado",
        description: "Por favor, selecione pelo menos um campo para incluir no WP.",
        variant: "destructive"
      });
      return;
    }

    // Filtrar apenas os campos selecionados
    const allFields = [...analysisData, ...customFields];
    const selectedFields = allFields.filter(f => selectedFieldsForWP.has(f.id));

    // Criar uma nova janela para o PDF
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Popup bloqueado",
        description: "Por favor, permita popups para gerar o WP.",
        variant: "destructive"
      });
      return;
    }

    // Preparar dados para o PDF
    const currentDate = new Date().toLocaleString('pt-BR');
    
    // HTML do documento
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>WP - Análise de Pagamento ${contractId}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 40px;
            line-height: 1.6;
            color: #333;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #660099;
            padding-bottom: 20px;
          }
          .header h1 {
            color: #660099;
            margin: 0;
            font-size: 24px;
          }
          .header p {
            color: #666;
            margin: 5px 0;
          }
          .info-section {
            margin-bottom: 20px;
          }
          .info-label {
            font-weight: bold;
            color: #660099;
            display: inline-block;
            width: 200px;
          }
          .info-value {
            color: #333;
          }
          .fields-section {
            margin-top: 30px;
          }
          .field-item {
            margin-bottom: 15px;
            padding: 10px;
            border-left: 3px solid #660099;
            background: #f9f9f9;
          }
          .field-label {
            font-weight: bold;
            color: #660099;
            margin-bottom: 5px;
          }
          .field-value {
            color: #333;
          }
          .field-status {
            display: inline-block;
            padding: 2px 8px;
            border-radius: 4px;
            font-size: 12px;
            margin-left: 10px;
          }
          .status-compliant {
            background: #d1f4e0;
            color: #1e7e34;
          }
          .status-non-compliant {
            background: #f8d7da;
            color: #721c24;
          }
          .status-warning {
            background: #fff3cd;
            color: #856404;
          }
          .status-neutral {
            background: #e9ecef;
            color: #495057;
          }
          .corrections-section {
            margin-top: 30px;
            padding: 20px;
            background: #fff9e6;
            border: 2px solid #ffc107;
            border-radius: 5px;
          }
          .footer {
            margin-top: 40px;
            text-align: center;
            color: #666;
            font-size: 12px;
            border-top: 1px solid #ddd;
            padding-top: 20px;
          }
          @media print {
            body { padding: 20px; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Work Package - Análise de Pagamento</h1>
          <p>Contrato: ${contractId}</p>
          <p>Data de Geração: ${currentDate}</p>
        </div>

        <div class="info-section">
          <div><span class="info-label">Contrato ID:</span> <span class="info-value">${contractId}</span></div>
          <div><span class="info-label">Total de Campos Incluídos:</span> <span class="info-value">${selectedFields.length}</span></div>
          <div><span class="info-label">Campos da IA:</span> <span class="info-value">${selectedFields.filter(f => !f.isCustom).length}</span></div>
          <div><span class="info-label">Campos Adicionados:</span> <span class="info-value">${selectedFields.filter(f => f.isCustom).length}</span></div>
          <div><span class="info-label">Correções Aplicadas:</span> <span class="info-value">${Object.keys(corrections).length}</span></div>
        </div>

        <div class="fields-section">
          <h2 style="color: #660099; border-bottom: 2px solid #660099; padding-bottom: 10px;">Campos Analisados</h2>
          ${selectedFields.map(field => {
            const currentValue = getCurrentValue(field);
            const isCorrected = corrections[field.id];
            const statusClass = field.status === 'compliant' ? 'status-compliant' : 
                               field.status === 'non-compliant' ? 'status-non-compliant' :
                               field.status === 'warning' ? 'status-warning' : 'status-neutral';
            const statusLabel = field.status === 'compliant' ? 'Conforme' : 
                               field.status === 'non-compliant' ? 'Não Conforme' :
                               field.status === 'warning' ? 'Atenção' : 'Neutro';
            
            return `
              <div class="field-item">
                <div class="field-label">
                  ${field.label}
                  <span class="field-status ${statusClass}">${statusLabel}</span>
                  ${field.isCustom ? '<span style="color: #0066cc; font-weight: bold;"> [CAMPO ADICIONADO]</span>' : ''}
                  ${isCorrected ? '<span style="color: #ffc107; font-weight: bold;"> [CORRIGIDO]</span>' : ''}
                </div>
                <div class="field-value">${currentValue}</div>
                ${isCorrected && !field.isCustom ? `<div style="color: #999; font-size: 12px; margin-top: 5px;">Valor original: ${field.value}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>

        ${Object.keys(corrections).length > 0 ? `
          <div class="corrections-section">
            <h3 style="color: #856404; margin-top: 0;">Resumo de Correções</h3>
            <p>Total de ${Object.keys(corrections).length} campo(s) foi(foram) corrigido(s) durante a análise.</p>
            ${Object.entries(corrections).map(([fieldId, value]) => {
              const field = selectedFields.find(f => f.id === fieldId);
              return field ? `<div>• <strong>${field.label}</strong>: ${value}</div>` : '';
            }).join('')}
          </div>
        ` : ''}

        <div class="footer">
          <p>Documento gerado automaticamente pelo sistema de análise de pagamentos</p>
          <p>© ${new Date().getFullYear()} - Todos os direitos reservados</p>
        </div>
      </body>
      </html>
    `;

    // Escrever o conteúdo na nova janela
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Aguardar carregamento e imprimir
    printWindow.onload = () => {
      printWindow.print();
    };

    // Fechar o modal de seleção de campos
    setWpModalOpen(false);
    
    // Toast de sucesso
    toast({
      title: "WP Gerado com Sucesso",
      description: `${selectedFields.length} campo(s) incluído(s) no documento.`,
    });
  };

  const handleUpdateEvidence = () => {
    // Criar input file invisível
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*,.pdf';
    
    input.onchange = (e: Event) => {
      const target = e.target as HTMLInputElement;
      const file = target.files?.[0];
      
      if (file && selectedEvidence) {
        setUpdatedEvidences(prev => ({
          ...prev,
          [selectedEvidence]: file
        }));
        setHasChanges(true);
        
        // Feedback visual
        console.log(`Evidência atualizada para "${selectedEvidence}":`, file.name);
        // Aqui você pode adicionar um toast ou notificação
      }
    };
    
    input.click();
  };

  return (
    <>
      {/* Modal Principal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <FileText className="h-6 w-6 text-purple-600" />
                Análise de IA - Pagamento {contractId}
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            
            {/* Ícones de Visualização de Documentos */}
            <div className="flex items-center gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs hover:bg-vivo-purple hover:text-white hover:border-vivo-purple"
                title="Visualizar Pagamento"
              >
                <DollarSign className="h-3.5 w-3.5 mr-1.5" />
                Pagamento
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs hover:bg-vivo-purple hover:text-white hover:border-vivo-purple"
                title="Visualizar Contrato"
              >
                <FileText className="h-3.5 w-3.5 mr-1.5" />
                Contrato
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs hover:bg-vivo-purple hover:text-white hover:border-vivo-purple"
                title="Visualizar Nota Fiscal"
              >
                <Receipt className="h-3.5 w-3.5 mr-1.5" />
                Nota Fiscal
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs hover:bg-vivo-purple hover:text-white hover:border-vivo-purple"
                title="Visualizar Cálculo de Memória"
              >
                <Calculator className="h-3.5 w-3.5 mr-1.5" />
                Cálculo de Memória
              </Button>
            </div>
            
            <p className="text-slate-600 mt-3">
              Resultados da análise automatizada por Inteligência Artificial
            </p>
          </DialogHeader>

          {/* Banner de Status Bloqueado */}
          {isLocked && (
            <div className={`flex-shrink-0 px-6 py-3 border-b ${
              paymentStatus === 'approved' ? 'bg-green-50 border-green-200' :
              paymentStatus === 'returned' ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center gap-2">
                {paymentStatus === 'approved' ? (
                  <>
                    <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-green-800">Pagamento Aprovado</p>
                      <p className="text-sm text-green-700">Este pagamento já foi liberado e não pode mais ser editado.</p>
                    </div>
                  </>
                ) : paymentStatus === 'returned' ? (
                  <>
                    <Undo2 className="h-5 w-5 text-orange-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-orange-800">Pagamento Devolvido</p>
                      <p className="text-sm text-orange-700">Este pagamento foi devolvido ao responsável e não pode mais ser editado.</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Ban className="h-5 w-5 text-red-600 flex-shrink-0" />
                    <div>
                      <p className="font-semibold text-red-800">Pagamento Rejeitado</p>
                      <p className="text-sm text-red-700">Este pagamento foi rejeitado e não pode mais ser editado.</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-2 py-4">
              {analysisData.map((field, index) => {
                const IconComponent = field.icon;
                return (
                  <Card key={index} className="transition-all hover:shadow-md border-l-2" style={{
                    borderLeftColor: field.status === 'compliant' ? '#10B981' : 
                                   field.status === 'non-compliant' ? '#EF4444' : 
                                   field.status === 'warning' ? '#F59E0B' : '#6B7280'
                  }}>
                    <CardContent className="p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="rounded p-1 bg-slate-50 flex-shrink-0">
                            <IconComponent className="h-3.5 w-3.5 text-slate-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1.5 mb-0.5">
                              <h3 className="font-medium text-slate-700 text-xs truncate">
                                {field.label}
                              </h3>
                              {getStatusIcon(field.status)}
                              {corrections[field.id] && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] px-1 py-0">
                                  Corrigido
                                </Badge>
                              )}
                            </div>
                            
                            <p className={`text-xs truncate ${
                              corrections[field.id] ? 'text-slate-700 font-medium' : 'text-slate-500'
                            }`}>
                              {getCurrentValue(field)}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          {/* Botão de edição */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditField(field.id)}
                            className="h-7 w-7 p-0 hover:bg-vivo-purple hover:text-white"
                            title="Editar campo"
                            disabled={isLocked}
                          >
                            <Edit3 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Campos Customizados Adicionados pelo Usuário */}
              {customFields.map((field, index) => {
                const IconComponent = field.icon;
                return (
                  <Card key={field.id} className="transition-all hover:shadow-md border-l-2 border-l-blue-500">
                    <CardContent className="p-2.5">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="rounded p-1 bg-blue-50 flex-shrink-0">
                            <IconComponent className="h-3.5 w-3.5 text-blue-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-0.5">
                              <p className="text-xs font-semibold text-slate-700">
                                {field.label}
                              </p>
                              <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200">
                                Campo Adicionado
                              </Badge>
                            </div>
                            <p className="text-xs text-slate-600 break-words">
                              {field.value}
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-1 flex-shrink-0">
                          {/* Botão de visualizar evidência */}
                          {field.hasEvidence && field.customEvidence && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedEvidence(`${field.label} (Custom)`)}
                              className="h-7 w-7 p-0 hover:bg-blue-50 hover:text-blue-600"
                              title="Ver evidência"
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                          )}
                          {/* Botão de remover campo customizado */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveCustomField(field.id)}
                            className="h-7 w-7 p-0 hover:bg-red-50 hover:text-red-600"
                            title="Remover campo"
                            disabled={isLocked}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}

              {/* Botão para adicionar novo campo */}
              {!isLocked && (
                <Card className="transition-all hover:shadow-md border-2 border-dashed border-slate-300 hover:border-vivo-purple cursor-pointer">
                  <CardContent className="p-4">
                    <Button
                      variant="ghost"
                      onClick={() => setAddFieldModalOpen(true)}
                      className="w-full flex items-center justify-center gap-2 text-slate-600 hover:text-vivo-purple"
                    >
                      <Plus className="h-4 w-4" />
                      <span className="text-sm font-medium">Adicionar Novo Campo</span>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Resumo da Análise */}
            <Card className="mt-6 border-purple-200 bg-purple-50">
              <CardHeader>
                <CardTitle className="text-purple-800 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Resumo da Análise
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {analysisData.filter(f => f.status === 'compliant').length}
                    </div>
                    <div className="text-sm text-slate-600">Itens Conformes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">
                      {analysisData.filter(f => f.status === 'non-compliant').length}
                    </div>
                    <div className="text-sm text-slate-600">Não Conformes</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {Object.keys(corrections).length}
                    </div>
                    <div className="text-sm text-slate-600">Correções Feitas</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {Math.round((analysisData.filter(f => f.status === 'compliant').length / analysisData.length) * 100)}%
                    </div>
                    <div className="text-sm text-slate-600">Score de Conformidade</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </ScrollArea>

            <div className="flex-shrink-0 p-6 pt-4 border-t bg-white">
              {/* Alerta de mudanças */}
              {hasChanges && (
                <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-2 text-orange-800 text-sm">
                    <AlertTriangle className="h-4 w-4" />
                    Você tem correções não salvas. Clique em "Salvar Correções" para aplicá-las.
                  </div>
                </div>
              )}
              
              <div className="flex flex-col gap-4">
                {/* Botões de correção */}
                {Object.keys(corrections).length > 0 && (
                  <div className="flex gap-2 justify-center">
                    <Button
                      variant="outline"
                      onClick={resetAllCorrections}
                      className="flex items-center gap-2 text-xs"
                    >
                      <RotateCcw className="h-3 w-3" />
                      Resetar Correções
                    </Button>
                    {hasChanges && (
                      <Button
                        onClick={saveAllCorrections}
                        className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2 text-xs"
                      >
                        <Save className="h-3 w-3" />
                        Salvar Correções
                      </Button>
                    )}
                  </div>
                )}
                
                {/* Botões principais de decisão */}
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={handleOpenWPModal}
                    className="border-vivo-purple text-vivo-purple hover:bg-vivo-purple hover:text-white flex items-center gap-2"
                    disabled={isLocked}
                  >
                    <FileDown className="h-4 w-4" />
                    Gerar WP
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setReturnModalOpen(true)}
                    className="border-orange-200 text-orange-700 hover:bg-orange-50 hover:border-orange-300 flex items-center gap-2"
                    disabled={isLocked}
                  >
                    <Undo2 className="h-4 w-4" />
                    Devolver Pagamento
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setRejectModalOpen(true)}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center gap-2"
                    disabled={isLocked}
                  >
                    <Ban className="h-4 w-4" />
                    Rejeitar Pagamento
                  </Button>
                  <Button 
                    onClick={() => setApproveModalOpen(true)}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    disabled={editingField !== null || isLocked}
                  >
                    <Check className="h-4 w-4" />
                    Liberar pagamento
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {selectedEvidence && (
        <Dialog open={!!selectedEvidence} onOpenChange={closeEvidence}>
          <DialogContent className="max-w-3xl h-[90vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
              <DialogTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                Evidência: {selectedEvidence?.replace(' (Custom)', '')}
                {selectedEvidence?.includes('(Custom)') && (
                  <Badge variant="outline" className="ml-2 bg-blue-50 text-blue-700 border-blue-200">
                    Campo Adicionado
                  </Badge>
                )}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full">
                {(() => {
                  // Verificar se é uma evidência de campo customizado
                  const isCustomField = selectedEvidence?.includes('(Custom)');
                  const fieldName = selectedEvidence?.replace(' (Custom)', '');
                  const customField = customFields.find(f => f.label === fieldName);
                  
                  if (isCustomField && customField?.customEvidence) {
                    // Exibir evidência customizada
                    const fileURL = URL.createObjectURL(customField.customEvidence);
                    const isImage = customField.customEvidence.type.startsWith('image/');
                    
                    return (
                      <div className="bg-slate-50 rounded-lg p-4 min-h-[400px]">
                        {isImage ? (
                          <img 
                            src={fileURL} 
                            alt={`Evidência de ${fieldName}`}
                            className="w-full h-auto rounded border border-slate-300"
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center min-h-[400px]">
                            <FileText className="h-16 w-16 text-slate-400 mb-4" />
                            <p className="text-sm text-slate-600 mb-2">Arquivo PDF</p>
                            <p className="text-xs text-slate-500">{customField.customEvidence.name}</p>
                            <Button
                              variant="outline"
                              className="mt-4"
                              onClick={() => {
                                const link = document.createElement('a');
                                link.href = fileURL;
                                link.download = customField.customEvidence!.name;
                                link.click();
                              }}
                            >
                              <FileDown className="h-4 w-4 mr-2" />
                              Baixar PDF
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  } else {
                    // Evidência padrão da IA
                    return (
                      <div className="bg-slate-50 rounded-lg p-4 min-h-[400px] flex items-center justify-center">
                        <div className="text-center text-slate-500">
                          <FileText className="h-16 w-16 mx-auto mb-4 text-slate-400" />
                          <h3 className="text-lg font-semibold mb-2">Evidência do Contrato</h3>
                          <p className="text-sm">
                            Aqui seria exibida a imagem/captura da seção do contrato<br />
                            referente ao campo "{selectedEvidence}"
                          </p>
                          <div className="mt-4 p-3 bg-white rounded border-2 border-dashed border-slate-300">
                            <p className="text-xs text-slate-400">
                              [Imagem da evidência será carregada aqui]
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  }
                })()}
              </ScrollArea>
            </div>
            
            <div className="flex-shrink-0 p-6 pt-4 border-t bg-white">
              <div className="flex justify-between items-center gap-2">
                <div className="text-sm text-slate-600">
                  {updatedEvidences[selectedEvidence] && (
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-4 w-4" />
                      <span>Nova evidência carregada: {updatedEvidences[selectedEvidence].name}</span>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={handleUpdateEvidence}
                    className="hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Atualizar evidência
                  </Button>
                  <Button variant="outline" onClick={closeEvidence}>
                    Fechar
                  </Button>
                  <Button className="bg-vivo-purple hover:bg-vivo-purple/90">
                    Download Evidência
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Edição */}
      {editingField !== null && (
        <Dialog open={editingField !== null} onOpenChange={() => handleCancelEdit(editingField)}>
          <DialogContent className="max-w-4xl w-[95vw] h-[80vh] flex flex-col p-0 overflow-hidden">
            <DialogHeader className="flex-shrink-0 px-4 pt-4 pb-3">
              <DialogTitle className="flex items-center gap-2">
                <Edit3 className="h-5 w-5 text-vivo-purple" />
                Editar Campo
              </DialogTitle>
            </DialogHeader>
            
            <ScrollArea className="flex-1 overflow-x-hidden">
              <div className="space-y-4 pb-4 px-4 w-full">
              {analysisData.find(f => f.id === editingField) && (() => {
                const field = analysisData.find(f => f.id === editingField)!;
                const IconComponent = field.icon;
                return (
                  <>
                    <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg w-full">
                      <div className="rounded-lg p-2 bg-white">
                        <IconComponent className="h-5 w-5 text-slate-600" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-700">{field.label}</h3>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Status: {getStatusBadge(field.status)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium text-slate-700">
                        Valor Original
                      </label>
                      <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 w-full overflow-auto">
                        <p className="text-sm text-slate-600 break-words">{field.value}</p>
                      </div>
                    </div>

                    <div className="space-y-2 w-full">
                      <label className="text-sm font-medium text-slate-700">
                        Novo Valor Corrigido
                      </label>
                      <Textarea
                        value={corrections[editingField] || field.value}
                        onChange={(e) => handleCorrectionChange(editingField, e.target.value)}
                        className="min-h-[120px] resize-none w-full !max-w-full box-border"
                        placeholder="Digite o valor corrigido..."
                      />
                      <p className="text-xs text-slate-500">
                        Esta correção será aplicada ao campo e marcada para revisão.
                      </p>
                    </div>

                    {field.hasEvidence && (
                      <div className="space-y-3 w-full">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                            <Eye className="h-4 w-4 text-blue-600" />
                            Evidência do Campo
                          </label>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUpdateEvidence}
                            className="h-8 text-xs hover:bg-orange-50 hover:text-orange-600 hover:border-orange-300"
                          >
                            <Upload className="h-3 w-3 mr-1.5" />
                            Atualizar
                          </Button>
                        </div>
                        
                        <div className="border rounded-lg overflow-hidden bg-slate-50 w-full">
                          <div className="p-4">
                            {updatedEvidences[field.label] ? (
                              <div className="space-y-3">
                                <div className="flex items-center gap-2 text-green-600 text-sm break-words">
                                  <CheckCircle className="h-4 w-4 flex-shrink-0" />
                                  <span className="break-words">Nova evidência carregada: {updatedEvidences[field.label].name}</span>
                                </div>
                                <div className="p-3 bg-white rounded border-2 border-dashed border-green-300">
                                  <p className="text-xs text-slate-400">
                                    [Visualização da nova evidência]
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className="text-sm text-slate-600">
                                  Captura da seção do contrato referente ao campo "{field.label}"
                                </p>
                                <div className="p-8 bg-white rounded border-2 border-dashed border-slate-300 flex items-center justify-center min-h-[200px]">
                                  <p className="text-xs text-slate-400">
                                    [Imagem da evidência será carregada aqui]
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}
              </div>
            </ScrollArea>

            <div className="flex-shrink-0 flex justify-end gap-2 px-4 py-3 border-t bg-white">
              <Button
                variant="outline"
                onClick={() => handleCancelEdit(editingField)}
              >
                Cancelar
              </Button>
              <Button
                onClick={() => handleSaveCorrection(editingField)}
                className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
              >
                <Save className="h-4 w-4" />
                Salvar Correção
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Modal de Seleção de Campos para WP */}
      <Dialog open={wpModalOpen} onOpenChange={setWpModalOpen}>
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-0">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2 text-xl">
              <FileDown className="h-5 w-5 text-vivo-purple" />
              Selecionar Campos para o WP
            </DialogTitle>
            <p className="text-sm text-slate-600 mt-2">
              Escolha os campos que deseja incluir no documento Work Package
            </p>
          </DialogHeader>

          {/* Barra de ações */}
          <div className="flex-shrink-0 px-6 py-3 border-b bg-slate-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSelectAll}
                  className="h-8"
                >
                  {selectedFieldsForWP.size === analysisData.length + customFields.length 
                    ? 'Desselecionar Todos' 
                    : 'Selecionar Todos'}
                </Button>
                <div className="text-sm text-slate-600">
                  <span className="font-semibold text-vivo-purple">
                    {selectedFieldsForWP.size}
                  </span>
                  {' '}de{' '}
                  <span className="font-semibold">
                    {analysisData.length + customFields.length}
                  </span>
                  {' '}campos selecionados
                </div>
              </div>
            </div>
          </div>

          {/* Lista de campos com scroll */}
          <ScrollArea className="flex-1 px-6">
            <div className="space-y-4 py-4">
                {/* Campos da IA */}
                {analysisData.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-vivo-purple" />
                      Campos Analisados pela IA ({analysisData.length})
                    </h3>
                    <div className="space-y-2">
                      {analysisData.map((field) => {
                        const IconComponent = field.icon;
                        const isSelected = selectedFieldsForWP.has(field.id);
                        
                        return (
                          <Card 
                            key={field.id}
                            className={`transition-all cursor-pointer hover:shadow-md ${
                              isSelected ? 'border-vivo-purple bg-purple-50' : 'border-slate-200'
                            }`}
                            onClick={() => toggleFieldSelection(field.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleFieldSelection(field.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="rounded p-1 bg-slate-100 flex-shrink-0">
                                      <IconComponent className="h-3.5 w-3.5 text-slate-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {field.label}
                                    </p>
                                    {field.status && (
                                      <Badge 
                                        variant="outline" 
                                        className={`text-[10px] px-1.5 py-0 h-4 ${
                                          field.status === 'compliant' ? 'bg-green-50 text-green-700 border-green-200' :
                                          field.status === 'non-compliant' ? 'bg-red-50 text-red-700 border-red-200' :
                                          field.status === 'warning' ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                                          'bg-slate-50 text-slate-700 border-slate-200'
                                        }`}
                                      >
                                        {field.status === 'compliant' ? 'Conforme' :
                                         field.status === 'non-compliant' ? 'Não Conforme' :
                                         field.status === 'warning' ? 'Atenção' : 'Neutro'}
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {getCurrentValue(field)}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Campos Customizados */}
                {customFields.length > 0 && (
                  <div>
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <Plus className="h-4 w-4 text-blue-600" />
                      Campos Adicionados ({customFields.length})
                    </h3>
                    <div className="space-y-2">
                      {customFields.map((field) => {
                        const IconComponent = field.icon;
                        const isSelected = selectedFieldsForWP.has(field.id);
                        
                        return (
                          <Card 
                            key={field.id}
                            className={`transition-all cursor-pointer hover:shadow-md ${
                              isSelected ? 'border-blue-500 bg-blue-50' : 'border-slate-200'
                            }`}
                            onClick={() => toggleFieldSelection(field.id)}
                          >
                            <CardContent className="p-3">
                              <div className="flex items-start gap-3">
                                <Checkbox
                                  checked={isSelected}
                                  onCheckedChange={() => toggleFieldSelection(field.id)}
                                  className="mt-0.5"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <div className="rounded p-1 bg-blue-100 flex-shrink-0">
                                      <IconComponent className="h-3.5 w-3.5 text-blue-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-slate-800">
                                      {field.label}
                                    </p>
                                    <Badge 
                                      variant="outline" 
                                      className="text-[10px] px-1.5 py-0 h-4 bg-blue-50 text-blue-700 border-blue-200"
                                    >
                                      Campo Adicionado
                                    </Badge>
                                  </div>
                                  <p className="text-xs text-slate-600 line-clamp-2">
                                    {field.value}
                                  </p>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>

          {/* Footer com botões */}
          <div className="flex-shrink-0 p-6 pt-4 border-t bg-white">
            <div className="flex justify-between items-center">
              <p className="text-sm text-slate-600">
                {selectedFieldsForWP.size === 0 ? (
                  <span className="text-orange-600 font-medium">
                    Selecione pelo menos um campo para continuar
                  </span>
                ) : (
                  <span>
                    <span className="font-semibold text-vivo-purple">{selectedFieldsForWP.size}</span>
                    {' '}campo(s) será(ão) incluído(s) no documento
                  </span>
                )}
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={() => setWpModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleGenerateWP}
                  disabled={selectedFieldsForWP.size === 0}
                  className="bg-vivo-purple hover:bg-purple-700 flex items-center gap-2"
                >
                  <FileDown className="h-4 w-4" />
                  Gerar WP
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Confirmação de Aprovação */}
      <ConfirmActionModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={handleApprovePayment}
        title="Confirmar Liberação de Pagamento"
        description={`Confirma a LIBERAÇÃO do pagamento do contrato ${contractId}?`}
        confirmText="Liberar Pagamento"
        hasWarning={hasChanges}
        warningMessage={`Você tem ${Object.keys(corrections).length} correção(ões) não salva(s). As correções serão aplicadas junto com a liberação.`}
      />

      {/* Modal de Justificativa para Devolução */}
      <JustificationModal
        isOpen={returnModalOpen}
        onClose={() => setReturnModalOpen(false)}
        onSubmit={handleReturnPayment}
        contractId={contractId}
        actionType="return"
      />

      {/* Modal de Justificativa para Rejeição */}
      <JustificationModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onSubmit={handleRejectPayment}
        contractId={contractId}
        actionType="reject"
      />

      {/* Modal para Adicionar Novo Campo */}
      <Dialog open={addFieldModalOpen} onOpenChange={setAddFieldModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <Plus className="h-5 w-5 text-vivo-purple" />
              Adicionar Novo Campo à Análise
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Título do Campo */}
            <div className="space-y-2">
              <Label htmlFor="field-label" className="text-sm font-medium">
                Título do Campo *
              </Label>
              <Input
                id="field-label"
                placeholder="Ex: Data de Assinatura, Valor do Reajuste, etc."
                value={newFieldForm.label}
                onChange={(e) => setNewFieldForm(prev => ({ ...prev, label: e.target.value }))}
                className="w-full"
              />
              <p className="text-xs text-slate-500">
                Dê um nome descritivo para identificar este campo.
              </p>
            </div>

            {/* Descrição/Valor do Campo */}
            <div className="space-y-2">
              <Label htmlFor="field-value" className="text-sm font-medium">
                Descrição/Valor *
              </Label>
              <Textarea
                id="field-value"
                placeholder="Descreva o conteúdo ou valor deste campo..."
                value={newFieldForm.value}
                onChange={(e) => setNewFieldForm(prev => ({ ...prev, value: e.target.value }))}
                className="w-full min-h-[100px] resize-none"
              />
              <p className="text-xs text-slate-500">
                Forneça informações detalhadas sobre este campo.
              </p>
            </div>

            {/* Upload de Evidência */}
            <div className="space-y-2">
              <Label htmlFor="field-evidence" className="text-sm font-medium">
                Evidência (Opcional)
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-vivo-purple transition-colors">
                <input
                  id="field-evidence"
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleEvidenceUpload}
                  className="hidden"
                />
                <label
                  htmlFor="field-evidence"
                  className="flex flex-col items-center justify-center cursor-pointer"
                >
                  <Upload className="h-10 w-10 text-slate-400 mb-2" />
                  <p className="text-sm font-medium text-slate-700 mb-1">
                    {newFieldForm.evidence ? newFieldForm.evidence.name : 'Clique para fazer upload'}
                  </p>
                  <p className="text-xs text-slate-500">
                    PNG, JPG ou PDF (máx. 10MB)
                  </p>
                </label>
              </div>
              {newFieldForm.evidence && (
                <div className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded">
                  <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-700 break-all">
                    Arquivo selecionado: {newFieldForm.evidence.name}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setNewFieldForm(prev => ({ ...prev, evidence: null }))}
                    className="ml-auto h-6 w-6 p-0 hover:bg-red-100"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button
              variant="outline"
              onClick={() => {
                setNewFieldForm({ label: '', value: '', evidence: null });
                setAddFieldModalOpen(false);
              }}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleAddCustomField}
              className="bg-vivo-purple hover:bg-purple-700 flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Adicionar Campo
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default ContractAnalysisModal;
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
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
  Upload
} from 'lucide-react';

interface ContractAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
}

interface AnalysisField {
  id: string;
  label: string;
  value: string;
  icon: React.ComponentType<any>;
  status?: 'compliant' | 'non-compliant' | 'warning' | 'neutral';
  hasEvidence?: boolean;
}

const ContractAnalysisModal: React.FC<ContractAnalysisModalProps> = ({
  isOpen,
  onClose,
  contractId
}) => {
  const [selectedEvidence, setSelectedEvidence] = useState<string | null>(null);
  
  // Estados para correções
  const [editingField, setEditingField] = useState<string | null>(null);
  const [corrections, setCorrections] = useState<Record<string, string>>({});
  const [hasChanges, setHasChanges] = useState(false);
  
  // Estado para evidências atualizadas
  const [updatedEvidences, setUpdatedEvidences] = useState<Record<string, File>>({});

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

          <div className="flex-1 overflow-hidden flex flex-col">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 py-4">
              {analysisData.map((field, index) => {
                const IconComponent = field.icon;
                return (
                  <Card key={index} className="transition-shadow hover:shadow-sm border-l-4" style={{
                    borderLeftColor: field.status === 'compliant' ? '#10B981' : 
                                   field.status === 'non-compliant' ? '#EF4444' : 
                                   field.status === 'warning' ? '#F59E0B' : '#6B7280'
                  }}>
                    <CardContent className="p-3">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1 min-w-0">
                          <div className="rounded-lg p-1.5 bg-slate-50 flex-shrink-0">
                            <IconComponent className="h-4 w-4 text-slate-600" />
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-semibold text-slate-700 text-sm truncate">
                                {field.label}
                              </h3>
                              {getStatusIcon(field.status)}
                              {corrections[field.id] && (
                                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                                  Corrigido
                                </Badge>
                              )}
                              {updatedEvidences[field.label] && (
                                <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                                  Evidência Atualizada
                                </Badge>
                              )}
                            </div>
                            
                            {/* Valor ou campo de edição */}
                            {editingField === field.id ? (
                              <div className="space-y-2">
                                <Textarea
                                  value={corrections[field.id] || field.value}
                                  onChange={(e) => handleCorrectionChange(field.id, e.target.value)}
                                  className="text-sm min-h-[60px] resize-none"
                                  placeholder="Digite a correção..."
                                />
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleSaveCorrection(field.id)}
                                    className="h-7 px-2 text-xs bg-green-600 hover:bg-green-700"
                                  >
                                    <Save className="h-3 w-3 mr-1" />
                                    Salvar
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleCancelEdit(field.id)}
                                    className="h-7 px-2 text-xs"
                                  >
                                    Cancelar
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <p className={`text-sm leading-relaxed break-words ${
                                  corrections[field.id] ? 'text-slate-700 font-medium' : 'text-slate-600'
                                }`}>
                                  {getCurrentValue(field)}
                                </p>
                                {corrections[field.id] && (
                                  <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border-l-2 border-blue-200">
                                    <strong>Original:</strong> {field.value}
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {field.status && field.status !== 'neutral' && (
                              <div className="mt-2">
                                {getStatusBadge(field.status)}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex gap-2 flex-shrink-0">
                          {/* Botão de edição */}
                          {editingField !== field.id && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditField(field.id)}
                              className="flex items-center gap-2 text-xs h-8 px-3"
                              title="Corrigir análise"
                            >
                              <Edit3 className="h-3 w-3" />
                              <span className="hidden sm:inline">Corrigir</span>
                            </Button>
                          )}
                          
                          {/* Botão de evidência */}
                          {field.hasEvidence && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEvidenceClick(field.label)}
                              className="flex items-center gap-2 text-xs h-8 px-3"
                              title="Ver evidência"
                            >
                              <Eye className="h-3 w-3" />
                              <span className="hidden sm:inline">Evidência</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
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
                    onClick={() => {
                      const confirmReject = confirm(
                        `Tem certeza que deseja REJEITAR o pagamento do contrato ${contractId}?\n\nEsta ação não poderá ser desfeita.`
                      );
                      if (confirmReject) {
                        console.log('Pagamento rejeitado para contrato:', contractId);
                        console.log('Correções aplicadas antes da rejeição:', corrections);
                        alert('Pagamento rejeitado com sucesso!\nO contrato foi marcado como não conforme para pagamento.');
                        onClose();
                      }
                    }}
                    className="border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300 flex items-center gap-2"
                  >
                    <Ban className="h-4 w-4" />
                    Rejeitar pagamento
                  </Button>
                  <Button 
                    onClick={() => {
                      if (hasChanges) {
                        const confirmWithChanges = confirm(
                          `Você tem correções não salvas.\n\nDeseja LIBERAR o pagamento do contrato ${contractId} com as correções aplicadas?`
                        );
                        if (!confirmWithChanges) return;
                      } else {
                        const confirmApprove = confirm(
                          `Confirma a LIBERAÇÃO do pagamento do contrato ${contractId}?\n\nO pagamento será processado após esta confirmação.`
                        );
                        if (!confirmApprove) return;
                      }
                      
                      console.log('Pagamento liberado para contrato:', contractId);
                      console.log('Correções aplicadas:', corrections);
                      console.log('Total de correções:', Object.keys(corrections).length);
                      
                      alert(`Pagamento liberado com sucesso!\n\nContrato: ${contractId}\nCorreções aplicadas: ${Object.keys(corrections).length}\n\nO pagamento será processado em breve.`);
                      onClose();
                    }}
                    className="bg-green-600 hover:bg-green-700 flex items-center gap-2"
                    disabled={editingField !== null} // Desabilita se estiver editando
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
                Evidência: {selectedEvidence}
              </DialogTitle>
            </DialogHeader>
            
            <div className="flex-1 overflow-hidden p-6">
              <ScrollArea className="h-full">
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
    </>
  );
};

export default ContractAnalysisModal;
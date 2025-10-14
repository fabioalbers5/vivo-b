import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Info
} from 'lucide-react';

interface ContractAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  contractId: string;
}

interface AnalysisField {
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

  // Dados simulados da análise de IA
  const analysisData: AnalysisField[] = [
    {
      label: 'Fornecedor',
      value: 'EMPRESA EXEMPLO LTDA',
      icon: Building,
      status: 'neutral',
      hasEvidence: true
    },
    {
      label: 'CNPJ',
      value: '12.345.678/0001-90',
      icon: FileText,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Nº Doc SAP',
      value: 'SAP-2024-001234',
      icon: FileText,
      status: 'neutral',
      hasEvidence: true
    },
    {
      label: 'Tipo de Doc',
      value: 'Contrato de Prestação de Serviços',
      icon: FileText,
      status: 'neutral',
      hasEvidence: true
    },
    {
      label: 'Enquadramento da Normativa',
      value: 'NCCP03 - Categoria A',
      icon: CheckCircle,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Objeto Contratual',
      value: 'Serviços de manutenção e suporte técnico em infraestrutura de telecomunicações',
      icon: FileText,
      status: 'neutral',
      hasEvidence: true
    },
    {
      label: 'Vigência',
      value: '12 meses (01/01/2024 a 31/12/2024)',
      icon: Calendar,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Reajuste',
      value: 'Anual conforme IPCA',
      icon: DollarSign,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Índice de reajuste',
      value: 'IPCA - Índice Nacional de Preços ao Consumidor Amplo',
      icon: DollarSign,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Valor',
      value: 'R$ 150.000,00',
      icon: DollarSign,
      status: 'neutral',
      hasEvidence: true
    },
    {
      label: 'Condição de pagamento',
      value: '30 dias após apresentação da nota fiscal',
      icon: DollarSign,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Está de acordo com a normativa NCCP03?',
      value: 'Sim - Todos os requisitos atendidos',
      icon: CheckCircle,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Ciclo de Tesouraria',
      value: '30 dias - Dentro do padrão estabelecido',
      icon: Calendar,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Cláusula anticorrupção',
      value: 'Presente - Cláusula 15.2 do contrato',
      icon: CheckCircle,
      status: 'compliant',
      hasEvidence: true
    },
    {
      label: 'Redir',
      value: 'Não aplicável para este tipo de contrato',
      icon: Info,
      status: 'neutral',
      hasEvidence: false
    },
    {
      label: 'Nota adicional',
      value: 'Contrato em conformidade com todas as normativas vigentes. Recomenda-se revisão anual dos termos de reajuste.',
      icon: Info,
      status: 'neutral',
      hasEvidence: false
    }
  ];

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

  return (
    <>
      {/* Modal Principal */}
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="flex-shrink-0 p-6 pb-4 border-b">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <FileText className="h-6 w-6 text-purple-600" />
                Análise de IA - Contrato {contractId}
              </DialogTitle>
              <DialogClose asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <X className="h-4 w-4" />
                </Button>
              </DialogClose>
            </div>
            <p className="text-slate-600 mt-2">
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
                            </div>
                            
                            <p className="text-slate-600 text-sm leading-relaxed break-words">
                              {field.value}
                            </p>
                            
                            {field.status && field.status !== 'neutral' && (
                              <div className="mt-2">
                                {getStatusBadge(field.status)}
                              </div>
                            )}
                          </div>
                        </div>

                        {field.hasEvidence && (
                          <div className="flex-shrink-0">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEvidenceClick(field.label)}
                              className="flex items-center gap-2 text-xs h-8 px-3"
                            >
                              <Eye className="h-3 w-3" />
                              <span className="hidden sm:inline">Ver Evidência</span>
                              <span className="sm:hidden">Evidência</span>
                            </Button>
                          </div>
                        )}
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                    <div className="text-2xl font-bold text-purple-600">95%</div>
                    <div className="text-sm text-slate-600">Score de Conformidade</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            </ScrollArea>

            <div className="flex-shrink-0 p-6 pt-4 border-t bg-white">
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Fechar
                </Button>
                <Button className="bg-purple-600 hover:bg-purple-700">
                  Gerar Relatório PDF
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Evidência */}
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
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={closeEvidence}>
                  Fechar
                </Button>
                <Button>
                  Download Evidência
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
};

export default ContractAnalysisModal;
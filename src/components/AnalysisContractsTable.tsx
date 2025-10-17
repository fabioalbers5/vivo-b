import React, { useState, useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  FileText, 
  Brain, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  ArrowUp, 
  ArrowDown,
  Eye
} from "lucide-react";
import { LegacyContract } from "@/hooks/useContractFilters";
import EditSampleModal from "./EditSampleModal";

interface AnalysisPayment extends LegacyContract {
  analysisStatus?: 'pending' | 'in_progress' | 'completed' | 'rejected';
  isUrgent?: boolean;
  analyst?: string;
  analysisStartDate?: string;
}

interface AnalysisContractsTableProps {
  contracts: LegacyContract[];
  onViewContract?: (contractId: string) => void;
  onAnalyzeContract?: (contractId: string) => void;
}

const AnalysisContractsTable: React.FC<AnalysisContractsTableProps> = ({ 
  contracts,
  onViewContract,
  onAnalyzeContract
}) => {
  const [samplePayments, setSamplePayments] = useState<AnalysisPayment[]>(contracts as AnalysisPayment[]);
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [visibleCount, setVisibleCount] = useState(20);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<AnalysisPayment | null>(null);

  // Atualizar quando os contratos mudarem
  React.useEffect(() => {
    setSamplePayments(contracts as AnalysisPayment[]);
  }, [contracts]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortValue = (payment: AnalysisPayment, column: string): any => {
    switch (column) {
      case 'number':
        return payment.number;
      case 'supplier':
        return payment.supplier?.toLowerCase() || '';
      case 'flowType':
        return (payment.flowType || payment.type || '')?.toLowerCase();
      case 'dueDate':
        return new Date(payment.dueDate).getTime();
      case 'contractDueDate':
        return payment.contractDueDate ? new Date(payment.contractDueDate).getTime() : 0;
      case 'paymentDueDate':
        return payment.paymentDueDate ? new Date(payment.paymentDueDate).getTime() : 0;
      case 'treasuryCycle':
        return payment.treasuryCycle || '';
      case 'paymentValue':
        return payment.paymentValue || 0;
      case 'value':
        return payment.value || 0;
      case 'risk':
        const riskOrder: Record<string, number> = { 'Alto': 3, 'Médio': 2, 'Baixo': 1 };
        return riskOrder[payment.risk || ''] || 0;
      case 'status':
        return payment.status?.toLowerCase() || '';
      case 'alertType':
        return payment.alertType?.toLowerCase() || '';
      case 'fine':
        return payment.fine || 0;
      case 'analyst':
        return payment.analyst?.toLowerCase() || '';
      case 'analysisStatus':
        const statusOrder: Record<string, number> = { 
          'completed': 4, 
          'in_progress': 3, 
          'pending': 2, 
          'rejected': 1 
        };
        return statusOrder[payment.analysisStatus || ''] || 0;
      case 'analysisStartDate':
        return payment.analysisStartDate ? new Date(payment.analysisStartDate).getTime() : 0;
      default:
        return '';
    }
  };

  const sortedPayments = useMemo(() => {
    return [...samplePayments].sort((a, b) => {
      if (sortColumn) {
        const aValue = getSortValue(a, sortColumn);
        const bValue = getSortValue(b, sortColumn);
        
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
      return 0;
    });
  }, [samplePayments, sortColumn, sortDirection]);

  const currentPayments = sortedPayments.slice(0, visibleCount);
  const hasMore = visibleCount < sortedPayments.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, sortedPayments.length));
  };

  const SortableHeader = ({ column, children, className = "" }: { column: string; children: React.ReactNode; className?: string }) => {
    const isActive = sortColumn === column;
    
    return (
      <TableHead 
        className={`bg-gray-50 py-0 text-xs text-center z-30 cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
        style={{ height: '24px', lineHeight: '1.2' }}
        onClick={() => handleSort(column)}
      >
        <div className="flex items-center justify-center gap-1">
          <span>{children}</span>
          {isActive ? (
            sortDirection === 'asc' ? (
              <ArrowUp className="h-3 w-3 text-blue-600" />
            ) : (
              <ArrowDown className="h-3 w-3 text-blue-600" />
            )
          ) : (
            <ArrowUpDown className="h-3 w-3 text-gray-400" />
          )}
        </div>
      </TableHead>
    );
  };

  const getRiskBadge = (risk: string) => {
    const riskConfig: Record<string, { className: string }> = {
      'Alto': { className: 'bg-red-50 text-red-800 border-red-200' },
      'Médio': { className: 'bg-orange-50 text-orange-800 border-orange-200' },
      'Baixo': { className: 'bg-green-50 text-green-800 border-green-200' }
    };

    const config = riskConfig[risk];
    const className = config ? config.className : 'bg-gray-50 text-gray-800 border-gray-200';

    return (
      <Badge variant="outline" className={`${className} text-xs whitespace-nowrap`}>
        {risk}
      </Badge>
    );
  };

  const getAnalysisStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string }> = {
      'pending': { label: 'Pendente', className: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
      'in_progress': { label: 'Em Análise', className: 'bg-blue-100 text-blue-800 border-blue-200' },
      'completed': { label: 'Concluído', className: 'bg-green-100 text-green-800 border-green-200' },
      'rejected': { label: 'Rejeitado', className: 'bg-red-100 text-red-800 border-red-200' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <Badge variant="outline" className={`${config.className} text-xs whitespace-nowrap`}>
        {config.label}
      </Badge>
    );
  };

  const handleViewDocument = (paymentId: string) => {
    if (onViewContract) {
      onViewContract(paymentId);
    }
  };

  const handleAnalyze = (paymentId: string) => {
    if (onAnalyzeContract) {
      onAnalyzeContract(paymentId);
    }
  };

  const handleEdit = (paymentId: string) => {
    const payment = samplePayments.find(p => {
      const pId = p.id || `${p.number}-${p.supplier}`;
      return pId === paymentId;
    });
    
    if (payment) {
      setSelectedPayment(payment);
      setIsEditModalOpen(true);
    }
  };

  const handleSaveEdit = (updatedPayment: LegacyContract) => {
    setSamplePayments(samplePayments.map(p => {
      const pId = p.id || `${p.number}-${p.supplier}`;
      const updatedId = updatedPayment.id || `${updatedPayment.number}-${updatedPayment.supplier}`;
      return pId === updatedId ? { ...p, ...updatedPayment } : p;
    }));
    setIsEditModalOpen(false);
    setSelectedPayment(null);
  };

  const handleDelete = (paymentId: string) => {
    console.log('Excluir:', paymentId);
    setSamplePayments(samplePayments.filter(p => {
      const pId = p.id || `${p.number}-${p.supplier}`;
      return pId !== paymentId;
    }));
  };

  const handleToggleUrgent = (paymentId: string) => {
    setSamplePayments(samplePayments.map(p => {
      const pId = p.id || `${p.number}-${p.supplier}`;
      return pId === paymentId 
        ? { ...p, isUrgent: !p.isUrgent }
        : p;
    }));
  };

  return (
    <>
      <div 
        className="border rounded-lg bg-white flex flex-col" 
        style={{ 
          height: '264px', 
          minHeight: '264px', 
          maxHeight: '264px', 
          overflow: 'hidden',
          position: 'relative'
        }}
      >
        <div 
          className="flex-1 overflow-auto relative" 
          style={{ 
            height: '264px',
            maxHeight: '264px',
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'auto',
            position: 'relative'
          }}
          onScroll={(e) => {
            const target = e.currentTarget;
            if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5 && hasMore) {
              loadMore();
            }
          }}
        >
          <Table className="w-full relative min-w-[1810px]" style={{ tableLayout: 'fixed', height: 'auto', position: 'relative' }}>
            <TableHeader className="sticky top-0 z-50 bg-gray-50 shadow-sm [&_th]:sticky [&_th]:top-0">
              <TableRow className="!h-6" style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}>
                <TableHead className="w-[120px] bg-gray-50 py-0 text-xs text-center sticky left-0 z-50 border-r border-gray-300 shadow-sm" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
                <SortableHeader column="number" className="min-w-[140px]">Número do Pagamento</SortableHeader>
                <SortableHeader column="supplier" className="min-w-[180px]">Fornecedor</SortableHeader>
                <SortableHeader column="flowType" className="min-w-[120px]">Tipo de Fluxo</SortableHeader>
                <SortableHeader column="paymentDueDate" className="min-w-[140px]">Vencimento do Pagamento</SortableHeader>
                <SortableHeader column="contractDueDate" className="min-w-[140px]">Vencimento do Contrato</SortableHeader>
                <SortableHeader column="treasuryCycle" className="min-w-[130px]">Ciclo de Tesouraria</SortableHeader>
                <SortableHeader column="analyst" className="min-w-[150px]">Analista Responsável</SortableHeader>
                <SortableHeader column="analysisStartDate" className="min-w-[150px]">Data Início da Análise</SortableHeader>
                <SortableHeader column="analysisStatus" className="min-w-[120px]">Status da Análise</SortableHeader>
                <SortableHeader column="paymentValue" className="min-w-[130px]">Valor do Pagamento</SortableHeader>
                <SortableHeader column="alertType" className="min-w-[120px]">Tipo de Alerta</SortableHeader>
                <SortableHeader column="risk" className="min-w-[80px]">Risco</SortableHeader>
                <SortableHeader column="fine" className="min-w-[120px]">Valor da Multa</SortableHeader>
              </TableRow>
            </TableHeader>

            <TableBody>
              {currentPayments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento na amostra
                  </TableCell>
                </TableRow>
              ) : (
                currentPayments.map((payment) => {
                  const paymentId = payment.id || `${payment.number}-${payment.supplier}`;
                  
                  return (
                    <TableRow 
                      key={paymentId} 
                      className={`hover:bg-muted/50 !h-6 transition-colors duration-200 ${
                        payment.isUrgent 
                          ? 'bg-red-100/70 hover:bg-red-200/60' 
                          : ''
                      }`} 
                      style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}
                    >
                      <TableCell className={`py-0 sticky left-0 z-30 border-r border-gray-200 shadow-sm ${payment.isUrgent ? 'bg-red-100/70 hover:bg-red-200/60' : 'bg-white'}`} style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        <div className="flex items-center gap-1">
                          <Checkbox
                            checked={payment.isUrgent || false}
                            onCheckedChange={() => handleToggleUrgent(paymentId)}
                            className={`h-3 w-3 ${payment.isUrgent ? 'border-red-500 data-[state=checked]:bg-red-600' : ''}`}
                            title={payment.isUrgent ? "Remover urgência" : "Marcar como urgente"}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleAnalyze(paymentId)}
                            className="h-4 w-4 p-0 hover:bg-green-50 hover:text-green-600"
                            title="Ver análise de IA"
                          >
                            <Brain className="h-2 w-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleViewDocument(paymentId)}
                            className="h-4 w-4 p-0 hover:bg-blue-50 hover:text-blue-600"
                            title="Visualizar documento"
                          >
                            <Eye className="h-2 w-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(paymentId)}
                            className="h-4 w-4 p-0 hover:bg-yellow-50 hover:text-yellow-600"
                            title="Editar"
                          >
                            <Edit className="h-2 w-2" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(paymentId)}
                            className="h-4 w-4 p-0 hover:bg-red-50 hover:text-red-600"
                            title="Excluir"
                          >
                            <Trash2 className="h-2 w-2" />
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{payment.number}</TableCell>
                      <TableCell className="font-medium max-w-[180px] truncate py-0 text-xs" title={payment.supplier} style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.supplier}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.flowType || payment.type || '-'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.paymentDueDate ? formatDate(payment.paymentDueDate) : (payment.dueDate ? formatDate(payment.dueDate) : '-')}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.contractDueDate ? formatDate(payment.contractDueDate) : '-'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.treasuryCycle ? (
                          <Badge 
                            variant="outline" 
                            className={`text-xs whitespace-nowrap ${
                              payment.treasuryCycle === 'Sim' 
                                ? 'bg-green-50 text-green-800 border-green-200' 
                                : 'bg-gray-50 text-gray-800 border-gray-200'
                            }`}
                          >
                            {payment.treasuryCycle}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.analyst || '-'}
                      </TableCell>
                      <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.analysisStartDate ? formatDate(payment.analysisStartDate) : '-'}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.analysisStatus ? getAnalysisStatusBadge(payment.analysisStatus) : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.paymentValue ? (
                          formatCurrency(payment.paymentValue)
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.alertType ? (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-xs whitespace-nowrap">
                            {payment.alertType}
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.risk ? getRiskBadge(payment.risk) : '-'}
                      </TableCell>
                      <TableCell className="font-medium text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                        {payment.fine ? (
                          formatCurrency(payment.fine)
                        ) : (
                          <span className="text-muted-foreground text-xs">-</span>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })
              )}

              {hasMore && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-2 text-xs text-muted-foreground">
                    Role para carregar mais...
                  </TableCell>
                </TableRow>
              )}
              
              {!hasMore && currentPayments.length > 0 && (
                <TableRow>
                  <TableCell colSpan={14} className="text-center py-2 text-xs text-muted-foreground">
                    Mostrando todos os {samplePayments.length} pagamentos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Edit Modal */}
      {selectedPayment && (
        <EditSampleModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedPayment(null);
          }}
          payment={selectedPayment}
          onSave={handleSaveEdit}
        />
      )}
    </>
  );
};

export default AnalysisContractsTable;

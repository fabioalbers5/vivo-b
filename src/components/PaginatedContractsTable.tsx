import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, Brain } from "lucide-react";
import { LegacyContract } from "@/hooks/useContractFilters";

interface PaginatedContractsTableProps {
  contracts: LegacyContract[];
  onViewContract: (contractId: string) => void;
  onAnalyzeContract?: (contractId: string) => void;
  isLoading?: boolean;
  filteredContracts?: LegacyContract[];
  showFilteredResults?: boolean;
}

const PaginatedContractsTable = ({ 
  contracts, 
  onViewContract, 
  onAnalyzeContract, 
  isLoading = false, 
  filteredContracts, 
  showFilteredResults = false 
}: PaginatedContractsTableProps) => {
  const [visibleCount, setVisibleCount] = useState(20);
  const [selectedContracts, setSelectedContracts] = useState<Set<string>>(new Set());

  // Use filtered contracts when filters are active, otherwise show all available contracts
  const displayContracts = showFilteredResults ? (filteredContracts || []) : (contracts || []);

  // Reset visible count and selection when contracts change
  useEffect(() => {
    setVisibleCount(20);
    setSelectedContracts(new Set());
  }, [displayContracts]);

  // Ordenar contratos: selecionados primeiro, depois por valor de pagamento (maior primeiro)
  const sortedContracts = useMemo(() => {
    return [...displayContracts].sort((a, b) => {
      // Usar o ID real do contrato ou criar um ID baseado em propriedades únicas
      const aId = a.id || `${a.number}-${a.supplier}`;
      const bId = b.id || `${b.number}-${b.supplier}`;
      
      const aSelected = selectedContracts.has(aId);
      const bSelected = selectedContracts.has(bId);
      
      // Contratos selecionados sempre no topo
      if (aSelected && !bSelected) return -1;
      if (!aSelected && bSelected) return 1;
      
      // Se ambos selecionados ou ambos não selecionados, ordenar por valor de pagamento (maior primeiro)
      const aValue = a.paymentValue || a.value || 0;
      const bValue = b.paymentValue || b.value || 0;
      return bValue - aValue;
    });
  }, [displayContracts, selectedContracts]);

  // Load more items for infinite scroll
  const currentContracts = sortedContracts.slice(0, visibleCount);
  const hasMore = visibleCount < sortedContracts.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, sortedContracts.length));
  };


  const isPartialSelected = selectedContracts.size > 0 && selectedContracts.size < currentContracts.length;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
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

  const getStatusBadge = (status: LegacyContract['status']) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; className: string }> = {
      paid: { label: 'Pago', variant: 'default', className: 'bg-status-paid text-white' },
      pending: { label: 'Pendente', variant: 'default', className: 'bg-status-pending text-white' },
      overdue: { label: 'Vencido', variant: 'destructive', className: 'bg-status-overdue text-white' },
      processing: { label: 'Processando', variant: 'default', className: 'bg-status-processing text-white' }
    };

    const config = statusConfig[status];
    if (config) {
      return (
        <Badge variant={config.variant} className={`${config.className} text-xs whitespace-nowrap`}>
          {config.label}
        </Badge>
      );
    }

    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs whitespace-nowrap">
        {status}
      </Badge>
    );
  };



  if (displayContracts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Fixed Section Header */}
        <div className="flex items-center justify-between mb-2 bg-white z-30 sticky top-0 py-1">
          <h2 className="text-lg font-semibold">
            {showFilteredResults ? "Contratos Filtrados (0)" : "Todos os Contratos (0)"}
          </h2>
          {isLoading && (
            <div className="text-xs text-muted-foreground">
              Carregando...
            </div>
          )}
        </div>

        <div className="border rounded-lg p-4 text-center bg-white">
          <p className="text-muted-foreground">
            {showFilteredResults ? "Nenhum contrato encontrado com os filtros aplicados." : "Nenhum contrato encontrado."}
          </p>
          {showFilteredResults && (
            <p className="text-sm text-muted-foreground mt-2">
              Tente ajustar os filtros ou limpar todos para ver todos os contratos.
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Section Header */}
      <div className="flex items-center justify-between mb-2 bg-white z-30 sticky top-0 py-1">
        <h2 className="text-lg font-semibold">
          {showFilteredResults ? 
            `Contratos Filtrados ${isLoading ? "" : `(${displayContracts.length})`}` : 
            `Todos os Contratos ${isLoading ? "" : `(${displayContracts.length})`}`
          }
        </h2>
        <div className="flex items-center gap-2">
          {showFilteredResults && (
            <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded">
              Filtros ativos
            </div>
          )}
          {isLoading && (
            <div className="text-xs text-muted-foreground">
              Carregando...
            </div>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div 
        className="border rounded-lg bg-white flex flex-col" 
        style={{ 
          height: '225px', 
          minHeight: '225px', 
          maxHeight: '225px', 
          overflow: 'hidden'
        }}
      >
        <div 
          className="flex-1 overflow-auto relative" 
          style={{ 
            height: '225px',
            maxHeight: '225px',
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'auto'
          }}
          onScroll={(e) => {
            const target = e.currentTarget;
            if (target.scrollTop + target.clientHeight >= target.scrollHeight - 5 && hasMore) {
              loadMore();
            }
          }}
        >
          <Table className="w-full relative min-w-[1440px]" style={{ tableLayout: 'fixed', height: 'auto' }}>
            <TableHeader className="sticky top-0 z-30 bg-gray-50 shadow-sm [&_th]:sticky [&_th]:top-0">
              <TableRow className="!h-6" style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}>
                <TableHead className="w-[120px] bg-gray-50 py-0 text-xs text-center sticky left-0 z-40 border-r border-gray-300 shadow-sm" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
                <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Número do Pagamento</TableHead>
                <TableHead className="min-w-[180px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Fornecedor</TableHead>
                <TableHead className="min-w-[120px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Tipo</TableHead>
                <TableHead className="min-w-[120px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Valor</TableHead>
                <TableHead className="min-w-[100px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Status</TableHead>
                <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Tipo de Alerta</TableHead>
                <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Área Solicitante</TableHead>
                <TableHead className="min-w-[80px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Risco</TableHead>
                <TableHead className="min-w-[120px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Valor da Multa</TableHead>
                <TableHead className="min-w-[130px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Valor do Pagamento</TableHead>
                <TableHead className="min-w-[130px] bg-gray-50 py-0 text-xs text-center z-30" style={{ height: '24px', lineHeight: '1.2' }}>Data de Vencimento</TableHead>
                <TableHead className="min-w-[100px] text-center bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
              </TableRow>
            </TableHeader>

            {/* Scrollable Table Body */}
            <TableBody>
              {currentContracts.map((contract, index) => {
                const contractId = contract.id || `${contract.number}-${contract.supplier}`;
                const isSelected = selectedContracts.has(contractId);
                
                const handleRowClick = (e: React.MouseEvent) => {
                  // Evitar seleção se clicou nos botões
                  if ((e.target as HTMLElement).closest('button')) {
                    return;
                  }
                  
                  setSelectedContracts(prevSelected => {
                    const newSelected = new Set(prevSelected);
                    if (isSelected) {
                      newSelected.delete(contractId);
                    } else {
                      newSelected.add(contractId);
                    }
                    return newSelected;
                  });
                };
                
                return (
                  <TableRow 
                    key={contractId} 
                    className={`hover:bg-muted/50 !h-6 transition-colors duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-purple-100/70 hover:bg-purple-200/70 border-l-4 border-purple-500' 
                        : ''
                    }`} 
                    style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}
                    onClick={handleRowClick}
                  >
                    <TableCell className={`py-0 sticky left-0 z-20 border-r border-gray-200 ${isSelected ? 'bg-purple-100/70' : 'bg-white'}`} style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      <div className="flex items-center gap-1">
                        <Checkbox
                          checked={selectedContracts.has(contractId)}
                          onCheckedChange={(checked) => {
                            setSelectedContracts(prevSelected => {
                              const newSelected = new Set(prevSelected);
                              if (checked) {
                                newSelected.add(contractId);
                              } else {
                                newSelected.delete(contractId);
                              }
                              return newSelected;
                            });
                          }}
                          className="h-3 w-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onAnalyzeContract?.(contractId);
                          }}
                          className="h-4 w-4 p-0 hover:bg-green-50 hover:text-green-600"
                          title="Ver análise de IA"
                        >
                          <Brain className="h-2 w-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onViewContract(contractId);
                          }}
                          className="h-4 w-4 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Visualizar documento"
                        >
                          <Eye className="h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{contract.number}</TableCell>
                    <TableCell className="font-medium max-w-[180px] truncate py-0 text-xs" title={contract.supplier} style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {contract.supplier}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{contract.type}</TableCell>
                    <TableCell className="font-medium text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {formatCurrency(contract.value)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{getStatusBadge(contract.status)}</TableCell>
                    <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {contract.alertType ? (
                        <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-xs whitespace-nowrap">
                          {contract.alertType}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {contract.requestingArea ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs whitespace-nowrap">
                          {contract.requestingArea}
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {contract.risk ? (
                        getRiskBadge(contract.risk)
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {contract.fine ? (
                        formatCurrency(contract.fine)
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      {contract.paymentValue ? (
                        formatCurrency(contract.paymentValue)
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>{formatDate(contract.dueDate)}</TableCell>
                  </TableRow>
                );
              })}
              
              {/* Loading indicator para scroll infinito */}
              {hasMore && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-2 text-xs text-muted-foreground">
                    Role para carregar mais...
                  </TableCell>
                </TableRow>
              )}
              
              {!hasMore && currentContracts.length > 0 && (
                <TableRow>
                  <TableCell colSpan={13} className="text-center py-2 text-xs text-muted-foreground">
                    Mostrando todos os {displayContracts.length} contratos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Status do scroll infinito */}
      <div className="flex items-center justify-between px-2 mt-2">
        <span className="text-xs text-muted-foreground">
          Exibindo {currentContracts.length} de {displayContracts.length} contratos
        </span>
        {selectedContracts.size > 0 && (
          <span className="text-xs text-blue-600 font-medium">
            {selectedContracts.size} selecionado(s)
          </span>
        )}
      </div>
    </div>
  );
};

export default PaginatedContractsTable;
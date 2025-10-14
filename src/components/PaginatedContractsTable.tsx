import React, { useState, useEffect } from 'react';
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Eye, Brain, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { LegacyContract } from "@/hooks/useContractFilters";

interface PaginatedContractsTableProps {
  contracts: LegacyContract[];
  onViewContract: (contractId: string) => void;
  onAnalyzeContract?: (contractId: string) => void;
  isLoading?: boolean;
}

const PaginatedContractsTable = ({ contracts, onViewContract, onAnalyzeContract, isLoading = false }: PaginatedContractsTableProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // Reset page when contracts change
  useEffect(() => {
    setCurrentPage(1);
  }, [contracts]);

  // Calculate pagination
  const totalItems = contracts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentContracts = contracts.slice(startIndex, endIndex);

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

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(parseInt(value));
    setCurrentPage(1); // Reset to first page
  };

  if (contracts.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {/* Fixed Section Header */}
        <div className="flex items-center justify-between mb-4 bg-white z-30 sticky top-0 py-2">
          <h2 className="text-xl font-semibold">
            Todos os Contratos (0)
          </h2>
          {isLoading && (
            <div className="text-sm text-muted-foreground">
              Carregando contratos...
            </div>
          )}
        </div>

        <div className="border rounded-lg p-8 text-center bg-white">
          <p className="text-muted-foreground">
            Nenhum contrato encontrado.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Fixed Section Header */}
      <div className="flex items-center justify-between mb-4 bg-white z-30 sticky top-0 py-2">
        <h2 className="text-xl font-semibold">
          Todos os Contratos {isLoading ? "" : `(${totalItems})`}
        </h2>
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Carregando contratos...
          </div>
        )}
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
          className="flex-1 overflow-auto" 
          style={{ 
            height: '225px',
            maxHeight: '225px',
            flex: '1 1 auto',
            overflowY: 'auto',
            overflowX: 'auto'
          }}
        >
          <Table className="min-w-[1400px] !h-auto" style={{ tableLayout: 'fixed', height: 'auto' }}>
            {/* Fixed Table Header */}
            <TableHeader className="sticky top-0 z-10 bg-gray-50 shadow-sm [&_th]:sticky [&_th]:top-0">
              <TableRow className="!h-6" style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}>
                <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Número do Contrato</TableHead>
                <TableHead className="min-w-[180px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Fornecedor</TableHead>
                <TableHead className="min-w-[120px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Tipo</TableHead>
                <TableHead className="min-w-[120px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Valor</TableHead>
                <TableHead className="min-w-[100px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Status</TableHead>
                <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Tipo de Alerta</TableHead>
                <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Área Solicitante</TableHead>
                <TableHead className="min-w-[80px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Risco</TableHead>
                <TableHead className="min-w-[120px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Valor da Multa</TableHead>
                <TableHead className="min-w-[130px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Valor do Pagamento</TableHead>
                <TableHead className="min-w-[130px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Data de Vencimento</TableHead>
                <TableHead className="min-w-[100px] text-center bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Ações</TableHead>
              </TableRow>
            </TableHeader>

            {/* Scrollable Table Body */}
            <TableBody>
              {currentContracts.map((contract, index) => (
                  <TableRow key={contract.id || `contract-${startIndex + index}`} className="hover:bg-muted/50 !h-6" style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}>
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
                    <TableCell className="text-center whitespace-nowrap py-0" style={{ height: '24px', lineHeight: '1.2', padding: '2px 8px' }}>
                      <div className="flex items-center justify-center gap-0.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onAnalyzeContract?.(contract.id)}
                          className="h-4 w-4 p-0 hover:bg-purple-50 hover:text-purple-600"
                          title="Ver análise de IA"
                        >
                          <Brain className="h-2 w-2" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewContract(contract.id)}
                          className="h-4 w-4 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Visualizar contrato"
                        >
                          <Eye className="h-2 w-2" />
                        </Button>
                      </div>
                    </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2 mt-4">
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Itens por página:</span>
          <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="4">4</SelectItem>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Mostrando {startIndex + 1} a {endIndex} de {totalItems} contratos
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 p-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = i + 1;
              } else if (currentPage <= 3) {
                pageNumber = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i;
              } else {
                pageNumber = currentPage - 2 + i;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="h-8 w-8 p-0"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 p-0"
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PaginatedContractsTable;
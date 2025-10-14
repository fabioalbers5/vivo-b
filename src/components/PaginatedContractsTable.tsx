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
      <div className="border rounded-lg p-8 text-center bg-white">
        <p className="text-muted-foreground">
          Nenhum contrato encontrado.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          Todos os Contratos {isLoading ? "" : `(${totalItems})`}
        </h2>
        {isLoading && (
          <div className="text-sm text-muted-foreground">
            Carregando contratos...
          </div>
        )}
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <div className="overflow-auto relative" style={{ maxHeight: 'calc(56px + 4 * 64px)' }}>
          <Table className="min-w-[1400px]">
            <TableHeader className="sticky top-0 z-20 bg-white shadow-sm">
              <TableRow>
                <TableHead className="min-w-[140px] bg-white">Número do Contrato</TableHead>
                <TableHead className="min-w-[180px] bg-white">Fornecedor</TableHead>
                <TableHead className="min-w-[120px] bg-white">Tipo</TableHead>
                <TableHead className="min-w-[120px] bg-white">Valor</TableHead>
                <TableHead className="min-w-[100px] bg-white">Status</TableHead>
                <TableHead className="min-w-[140px] bg-white">Tipo de Alerta</TableHead>
                <TableHead className="min-w-[140px] bg-white">Área Solicitante</TableHead>
                <TableHead className="min-w-[80px] bg-white">Risco</TableHead>
                <TableHead className="min-w-[120px] bg-white">Valor da Multa</TableHead>
                <TableHead className="min-w-[130px] bg-white">Valor do Pagamento</TableHead>
                <TableHead className="min-w-[130px] bg-white">Data de Vencimento</TableHead>
                <TableHead className="min-w-[100px] text-center bg-white">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentContracts.map((contract, index) => (
                <TableRow key={contract.id || `contract-${startIndex + index}`} className="hover:bg-muted/50">
                  <TableCell className="font-mono text-sm whitespace-nowrap">{contract.number}</TableCell>
                  <TableCell className="font-medium max-w-[180px] truncate" title={contract.supplier}>
                    {contract.supplier}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{contract.type}</TableCell>
                  <TableCell className="font-medium text-sm whitespace-nowrap">
                    {formatCurrency(contract.value)}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{getStatusBadge(contract.status)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    {contract.alertType ? (
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-800 border-yellow-200 text-xs whitespace-nowrap">
                        {contract.alertType}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {contract.requestingArea ? (
                      <Badge variant="outline" className="bg-blue-50 text-blue-800 border-blue-200 text-xs whitespace-nowrap">
                        {contract.requestingArea}
                      </Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {contract.risk ? (
                      getRiskBadge(contract.risk)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm whitespace-nowrap">
                    {contract.fine ? (
                      formatCurrency(contract.fine)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="font-medium text-sm whitespace-nowrap">
                    {contract.paymentValue ? (
                      formatCurrency(contract.paymentValue)
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-sm whitespace-nowrap">{formatDate(contract.dueDate)}</TableCell>
                  <TableCell className="text-center whitespace-nowrap">
                    <div className="flex items-center justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onAnalyzeContract?.(contract.id)}
                        className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                        title="Ver análise de IA"
                      >
                        <Brain className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewContract(contract.id)}
                        className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                        title="Visualizar contrato"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-between px-2">
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
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
import { Eye, Brain } from "lucide-react";
import { Card } from "@/components/ui/card";
import { LegacyContract } from "@/hooks/useContractFilters";

interface ContractsTableProps {
  contracts: LegacyContract[];
  onViewContract: (contractId: string) => void;
  onAnalyzeContract?: (contractId: string) => void;
}

const ContractsTable = ({ contracts, onViewContract, onAnalyzeContract }: ContractsTableProps) => {
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
    // Configurações específicas para valores conhecidos
    const statusConfig: Record<string, { label: string; variant: 'default' | 'destructive' | 'secondary' | 'outline'; className: string }> = {
      paid: { label: 'Pago', variant: 'default', className: 'bg-status-paid text-white' },
      pending: { label: 'Pendente', variant: 'default', className: 'bg-status-pending text-white' },
      overdue: { label: 'Vencido', variant: 'destructive', className: 'bg-status-overdue text-white' },
      processing: { label: 'Processando', variant: 'default', className: 'bg-status-processing text-white' }
    };

    // Se o status tem configuração específica, usa ela
    const config = statusConfig[status];
    if (config) {
      return (
        <Badge variant={config.variant} className={`${config.className} text-xs whitespace-nowrap`}>
          {config.label}
        </Badge>
      );
    }

    // Para qualquer outro valor, exibe o valor original da tabela
    return (
      <Badge variant="secondary" className="bg-gray-100 text-gray-800 text-xs whitespace-nowrap">
        {status}
      </Badge>
    );
  };

  if (contracts.length === 0) {
    return (
      <div className="border rounded-lg p-8 text-center bg-white">
        <p className="text-muted-foreground">
          Nenhum contrato encontrado com os filtros aplicados.
        </p>
      </div>
    );
  }

  return (
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
              <TableHead className="min-w-[140px] bg-gray-50 py-0 text-xs" style={{ height: '24px', lineHeight: '1.2' }}>Número do Pagamento</TableHead>
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
            {contracts.map((contract, index) => (
              <TableRow key={contract.id || `contract-${index}`} className="hover:bg-muted/50 !h-6" style={{ height: '24px !important', minHeight: '24px', maxHeight: '24px' }}>
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
                      title="Visualizar documento"
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
    </div>
  );
};

export default ContractsTable;

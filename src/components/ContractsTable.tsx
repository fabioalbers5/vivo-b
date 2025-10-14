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
    <div className="border rounded-lg overflow-x-scroll overflow-y-auto max-h-[500px] relative bg-white">
      <Table className="min-w-[1400px]">
          <TableHeader className="sticky top-0 z-20 bg-background">
            <TableRow>
              <TableHead className="min-w-[140px] sticky left-0 z-30 bg-background border-r shadow-sm">Número do Contrato</TableHead>
              <TableHead className="min-w-[180px]">Fornecedor</TableHead>
              <TableHead className="min-w-[120px]">Tipo</TableHead>
              <TableHead className="min-w-[120px]">Valor</TableHead>
              <TableHead className="min-w-[100px]">Status</TableHead>
              <TableHead className="min-w-[140px]">Tipo de Alerta</TableHead>
              <TableHead className="min-w-[140px]">Área Solicitante</TableHead>
              <TableHead className="min-w-[80px]">Risco</TableHead>
              <TableHead className="min-w-[120px]">Valor da Multa</TableHead>
              <TableHead className="min-w-[130px]">Valor do Pagamento</TableHead>
              <TableHead className="min-w-[130px]">Data de Vencimento</TableHead>
              <TableHead className="min-w-[100px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contracts.map((contract, index) => (
              <TableRow key={contract.id || `contract-${index}`} className="hover:bg-muted/50">
                <TableCell className="font-mono text-sm whitespace-nowrap sticky left-0 z-10 bg-background border-r shadow-sm">{contract.number}</TableCell>
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
  );
};

export default ContractsTable;

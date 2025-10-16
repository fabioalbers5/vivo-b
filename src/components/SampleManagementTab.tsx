import { useState } from "react";
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
import { FileText, Brain, Edit, Trash2 } from "lucide-react";

interface SamplePayment {
  id: string;
  paymentNumber: string;
  supplier: string;
  paymentValue: number;
  analysisStatus: 'pending' | 'in_progress' | 'completed' | 'rejected';
  isUrgent?: boolean;
}

// Dados fictícios para demonstração
const mockSamplePayments: SamplePayment[] = [
  {
    id: "1",
    paymentNumber: "PAG-2025-001",
    supplier: "Fornecedor ABC Ltda",
    paymentValue: 15000.00,
    analysisStatus: 'completed'
  },
  {
    id: "2",
    paymentNumber: "PAG-2025-002",
    supplier: "Empresa XYZ S.A.",
    paymentValue: 8500.50,
    analysisStatus: 'in_progress'
  },
  {
    id: "3",
    paymentNumber: "PAG-2025-003",
    supplier: "Tech Solutions Ltda",
    paymentValue: 22000.00,
    analysisStatus: 'pending'
  },
  {
    id: "4",
    paymentNumber: "PAG-2025-004",
    supplier: "Global Services Inc",
    paymentValue: 12750.75,
    analysisStatus: 'completed'
  },
  {
    id: "5",
    paymentNumber: "PAG-2025-005",
    supplier: "Premium Consulting",
    paymentValue: 18900.00,
    analysisStatus: 'rejected'
  },
];

const SampleManagementTab = () => {
  const [payments, setPayments] = useState<SamplePayment[]>(mockSamplePayments);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
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
    console.log('Ver documento:', paymentId);
    // Implementar visualização do documento
  };

  const handleAnalyze = (paymentId: string) => {
    console.log('Analisar:', paymentId);
    // Implementar análise
  };

  const handleEdit = (paymentId: string) => {
    console.log('Editar:', paymentId);
    // Implementar edição
  };

  const handleDelete = (paymentId: string) => {
    console.log('Excluir:', paymentId);
    setPayments(payments.filter(p => p.id !== paymentId));
    // Implementar exclusão com confirmação
  };

  const handleToggleUrgent = (paymentId: string) => {
    setPayments(payments.map(p => 
      p.id === paymentId 
        ? { ...p, isUrgent: !p.isUrgent }
        : p
    ));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Gestão de Amostra</h2>
          <p className="text-sm text-muted-foreground">
            Pagamentos selecionados para análise: {payments.length}
          </p>
        </div>
      </div>

      <div className="border rounded-lg bg-white">
        <div className="overflow-auto" style={{ maxHeight: '500px' }}>
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-gray-50">
              <TableRow>
                <TableHead className="w-[180px] text-center">Ações</TableHead>
                <TableHead className="text-center">Número do Pagamento</TableHead>
                <TableHead className="text-center">Fornecedor</TableHead>
                <TableHead className="text-center">Valor do Pagamento</TableHead>
                <TableHead className="text-center">Status da Análise</TableHead>
                <TableHead className="w-[80px] text-center">Urgente</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    Nenhum pagamento selecionado na amostra
                  </TableCell>
                </TableRow>
              ) : (
                payments.map((payment) => (
                  <TableRow 
                    key={payment.id} 
                    className={`hover:bg-muted/50 ${payment.isUrgent ? 'bg-red-50/50' : ''}`}
                  >
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewDocument(payment.id)}
                          className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600"
                          title="Visualizar documento"
                        >
                          <FileText className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleAnalyze(payment.id)}
                          className="h-8 w-8 p-0 hover:bg-purple-50 hover:text-purple-600"
                          title="Analisar com IA"
                        >
                          <Brain className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(payment.id)}
                          className="h-8 w-8 p-0 hover:bg-green-50 hover:text-green-600"
                          title="Editar"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(payment.id)}
                          className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600"
                          title="Excluir"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="text-center font-mono text-sm">
                      {payment.paymentNumber}
                    </TableCell>
                    <TableCell className="text-center">
                      {payment.supplier}
                    </TableCell>
                    <TableCell className="text-center font-medium">
                      {formatCurrency(payment.paymentValue)}
                    </TableCell>
                    <TableCell className="text-center">
                      {getStatusBadge(payment.analysisStatus)}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center">
                        <Checkbox
                          checked={payment.isUrgent || false}
                          onCheckedChange={() => handleToggleUrgent(payment.id)}
                          className={payment.isUrgent ? 'border-red-500 data-[state=checked]:bg-red-600' : ''}
                          title={payment.isUrgent ? "Remover urgência" : "Marcar como urgente"}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
        <div className="flex gap-4">
          <span>Total: {payments.length} pagamentos</span>
          <span>•</span>
          <span>Pendentes: {payments.filter(p => p.analysisStatus === 'pending').length}</span>
          <span>•</span>
          <span>Em análise: {payments.filter(p => p.analysisStatus === 'in_progress').length}</span>
          <span>•</span>
          <span>Concluídos: {payments.filter(p => p.analysisStatus === 'completed').length}</span>
          <span>•</span>
          <span className="text-red-600 font-medium">Urgentes: {payments.filter(p => p.isUrgent).length}</span>
        </div>
      </div>
    </div>
  );
};

export default SampleManagementTab;

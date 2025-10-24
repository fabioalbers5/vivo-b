import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  History, 
  Search, 
  X, 
  Download, 
  Eye, 
  RefreshCw, 
  Calendar,
  User,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Filter,
  ChevronDown,
  BarChart3
} from 'lucide-react';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

const SampleHistoryPage: React.FC = () => {
  const { sampleHistory, isLoading, error, loadSampleById, refreshHistory } = useSampleHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedAnalyst, setSelectedAnalyst] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estado do modal de detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);

  // Filtros aplicados
  const filteredHistory = useMemo(() => {
    return sampleHistory.filter(sample => {
      // Filtro de busca
      if (searchText && !sample.amostra_id.toLowerCase().includes(searchText.toLowerCase())) {
        return false;
      }

      // Filtro de data inicial
      if (startDate && sample.createdAt) {
        const sampleDate = new Date(sample.createdAt);
        const filterDate = new Date(startDate);
        if (sampleDate < filterDate) return false;
      }

      // Filtro de data final
      if (endDate && sample.createdAt) {
        const sampleDate = new Date(sample.createdAt);
        const filterDate = new Date(endDate);
        filterDate.setHours(23, 59, 59, 999);
        if (sampleDate > filterDate) return false;
      }

      return true;
    });
  }, [sampleHistory, searchText, startDate, endDate]);

  // Verificar se há filtros ativos
  const hasActiveFilters = searchText !== '' || startDate !== '' || endDate !== '' || 
                           selectedAnalyst !== 'all' || selectedStatus !== 'all';

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
    setSelectedAnalyst('all');
    setSelectedStatus('all');
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Abrir detalhes
  const handleViewDetails = (sample: any) => {
    setSelectedSample(sample);
    setDetailsModalOpen(true);
  };

  // Reutilizar critérios
  const handleReuseCriteria = async (amostraId: string) => {
    try {
      toast({
        title: 'Carregando amostra...',
        description: 'Por favor aguarde enquanto carregamos os dados.',
      });

      // Carregar dados da amostra
      await loadSampleById(amostraId);
      
      toast({
        title: 'Amostra carregada!',
        description: 'Navegando para a página de análise...',
      });

      // Navegar para a página de análise com a amostra carregada
      navigate('/analysis');
    } catch (error) {
      toast({
        title: 'Erro ao carregar amostra',
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: 'destructive',
      });
    }
  };

  // Exportar amostra
  const handleExportSample = (amostraId: string) => {
    toast({
      title: 'Exportando amostra',
      description: `Preparando exportação da amostra ${amostraId}...`,
    });
    // TODO: Implementar lógica de exportação
  };

  // Estado vazio
  if (!isLoading && sampleHistory.length === 0) {
    return (
      <div className="p-2 h-full bg-background">
        <Card className="border-vivo-purple/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-vivo-purple flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Seleções de Amostras
              </CardTitle>
              <Button
                onClick={refreshHistory}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Atualizar
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">
                Nenhuma amostra encontrada. Inicie uma nova seleção de amostra.
              </p>
              <Button onClick={() => navigate('/')} className="bg-vivo-purple hover:bg-vivo-purple/90">
                Iniciar Nova Amostragem
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-2 h-full bg-background">
      <Card className="border-vivo-purple/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-vivo-purple flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de Seleções de Amostras
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                onClick={handleClearFilters}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
                disabled={!hasActiveFilters}
              >
                <X className="h-4 w-4" />
                Limpar Filtros
              </Button>
              <Button
                onClick={refreshHistory}
                variant="outline"
                size="sm"
                className="flex items-center gap-2"
              >
                <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
                Atualizar
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* Filtros */}
          <div className="mb-4 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              {/* Busca */}
              <div className="space-y-1">
                <Label className="text-xs">Buscar Amostra</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="ID da amostra..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-8 h-9 text-sm"
                  />
                </div>
              </div>

              {/* Data Inicial */}
              <div className="space-y-1">
                <Label className="text-xs">Data Inicial</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Data Final */}
              <div className="space-y-1">
                <Label className="text-xs">Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 text-sm"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-9 font-semibold text-sm">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="in_progress">Em execução</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Tabela */}
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Carregando histórico...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-semibold mb-2">Erro ao carregar histórico</p>
              <p className="text-muted-foreground text-sm">{error}</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-12">
              <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhuma amostra encontrada com os filtros aplicados.
              </p>
            </div>
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-gray-50">
                    <TableRow>
                      <TableHead className="w-[180px]">ID da Amostra</TableHead>
                      <TableHead className="w-[180px]">Data de Criação</TableHead>
                      <TableHead className="w-[150px]">Mês Referência</TableHead>
                      <TableHead className="w-[120px] text-center">Total de Contratos</TableHead>
                      <TableHead className="w-[120px] text-center">Status</TableHead>
                      <TableHead className="w-[280px] text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredHistory.map((sample) => (
                      <TableRow key={sample.amostra_id} className="hover:bg-muted/50">
                        <TableCell className="font-mono text-sm">
                          {sample.amostra_id}
                        </TableCell>
                        <TableCell className="text-sm">
                          {formatDate(sample.createdAt)}
                        </TableCell>
                        <TableCell className="text-sm">
                          {sample.mesReferencia}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="font-semibold">
                            {sample.totalContracts}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge className="bg-green-100 text-green-800 border-green-200">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Concluída
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleViewDetails(sample)}
                              className="h-7 text-xs"
                            >
                              <Eye className="h-3 w-3 mr-1" />
                              Detalhes
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleReuseCriteria(sample.amostra_id)}
                              className="h-7 text-xs"
                            >
                              <RefreshCw className="h-3 w-3 mr-1" />
                              Reutilizar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleExportSample(sample.amostra_id)}
                              className="h-7 text-xs"
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Exportar
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Informação de resultados */}
          {!isLoading && filteredHistory.length > 0 && (
            <div className="mt-3 text-sm text-muted-foreground">
              Exibindo {filteredHistory.length} de {sampleHistory.length} amostras
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-vivo-purple" />
              Detalhes da Amostra
            </DialogTitle>
            <DialogDescription>
              Informações detalhadas sobre a amostra selecionada
            </DialogDescription>
          </DialogHeader>

          {selectedSample && (
            <div className="space-y-4">
              {/* Informações Básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">ID da Amostra</Label>
                  <p className="font-mono text-sm font-semibold">{selectedSample.amostra_id}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Data de Criação</Label>
                  <p className="text-sm">{formatDate(selectedSample.createdAt)}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Mês Referência</Label>
                  <p className="text-sm">{selectedSample.mesReferencia}</p>
                </div>
                <div className="space-y-2">
                  <Label className="text-xs text-muted-foreground">Total de Contratos</Label>
                  <p className="text-sm font-semibold">{selectedSample.totalContracts}</p>
                </div>
              </div>

              {/* Cards de métricas */}
              <div className="grid grid-cols-3 gap-3 pt-4">
                <Card className="bg-blue-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Contratos</p>
                        <p className="text-lg font-bold text-blue-700">{selectedSample.totalContracts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Status</p>
                        <p className="text-sm font-bold text-green-700">Concluída</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-600" />
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Período</p>
                        <p className="text-sm font-bold text-purple-700">{selectedSample.mesReferencia}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDetailsModalOpen(false)}
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    handleReuseCriteria(selectedSample.amostra_id);
                    setDetailsModalOpen(false);
                  }}
                  className="bg-vivo-purple hover:bg-vivo-purple/90"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Reutilizar Critérios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SampleHistoryPage;

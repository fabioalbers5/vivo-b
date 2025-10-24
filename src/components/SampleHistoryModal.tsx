import React, { useState, useMemo, useEffect } from 'react';
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
import { Card, CardContent } from '@/components/ui/card';
import { 
  History, 
  Search, 
  X, 
  Download, 
  Eye, 
  Calendar,
  FileText,
  CheckCircle2,
  BarChart3,
  Filter,
  Loader2
} from 'lucide-react';
import { useSampleHistory } from '@/hooks/useSampleHistory';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface SampleHistoryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onLoadSample?: (amostraId: string) => void;
  onReuseFilters?: (amostraId: string) => Promise<void>;
}

const SampleHistoryModal: React.FC<SampleHistoryModalProps> = ({
  open,
  onOpenChange,
  onLoadSample,
  onReuseFilters
}) => {
  const { sampleHistory, isLoading, error, loadSampleById, refreshHistory } = useSampleHistory();
  const { toast } = useToast();

  // Estados de filtros
  const [searchText, setSearchText] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Estado do modal de detalhes
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedSample, setSelectedSample] = useState<any>(null);
  const [sampleFilterMetadata, setSampleFilterMetadata] = useState<any>(null);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

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
  const hasActiveFilters = searchText !== '' || startDate !== '' || endDate !== '' || selectedStatus !== 'all';

  // Limpar filtros
  const handleClearFilters = () => {
    setSearchText('');
    setStartDate('');
    setEndDate('');
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

  // Carregar metadados dos filtros quando abrir detalhes
  useEffect(() => {
    const loadFilterMetadata = async () => {
      if (!detailsModalOpen || !selectedSample) {
        setSampleFilterMetadata(null);
        return;
      }

      setLoadingMetadata(true);
      try {
        const { data, error } = await supabase
          .from('amostras_filtros_metadata' as any)
          .select('*')
          .eq('amostra_id', selectedSample.amostra_id)
          .single();

        if (error) {
          console.warn('Metadados não encontrados:', error);
          setSampleFilterMetadata(null);
        } else {
          setSampleFilterMetadata(data);
        }
      } catch (error) {
        console.error('Erro ao carregar metadados:', error);
        setSampleFilterMetadata(null);
      } finally {
        setLoadingMetadata(false);
      }
    };

    loadFilterMetadata();
  }, [detailsModalOpen, selectedSample]);

  // Reutilizar critérios (aplicar filtros)
  const handleReuseCriteria = async (amostraId: string) => {
    if (!onReuseFilters) {
      toast({
        title: 'Erro',
        description: 'Função de reutilização não disponível.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await onReuseFilters(amostraId);
      // O toast de sucesso é exibido pela função handleReuseFilters
      setDetailsModalOpen(false); // Fechar modal de detalhes se estiver aberto
    } catch (error) {
      toast({
        title: 'Erro ao aplicar filtros',
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle className="flex items-center gap-2 text-vivo-purple">
                  <History className="h-5 w-5" />
                  Histórico de Seleções de Amostras
                </DialogTitle>
                <DialogDescription>
                  Visualize e reutilize amostras anteriores
                </DialogDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={handleClearFilters}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2 h-7"
                  disabled={!hasActiveFilters}
                >
                  <X className="h-3 w-3" />
                  Limpar Filtros
                </Button>
                <Button
                  onClick={() => onOpenChange(false)}
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                  aria-label="Fechar"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </DialogHeader>

          {/* Filtros */}
          <div className="space-y-2 py-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              {/* Busca */}
              <div className="space-y-1">
                <Label className="text-xs">Buscar Amostra</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2 h-3 w-3 text-muted-foreground" />
                  <Input
                    placeholder="ID da amostra..."
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)}
                    className="pl-7 h-8 text-xs"
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
                  className="h-8 text-xs"
                />
              </div>

              {/* Data Final */}
              <div className="space-y-1">
                <Label className="text-xs">Data Final</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>

              {/* Status */}
              <div className="space-y-1">
                <Label className="text-xs">Status</Label>
                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger className="h-8 font-semibold text-xs">
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

          {/* Conteúdo com scroll */}
          <div className="flex-1 overflow-auto">
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
                <p className="text-muted-foreground text-sm">Carregando histórico...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12">
                <X className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <p className="text-red-600 font-semibold mb-2">Erro ao carregar histórico</p>
                <p className="text-muted-foreground text-sm">{error}</p>
              </div>
            ) : sampleHistory.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  Nenhuma amostra encontrada. Selecione contratos e gere uma nova amostra.
                </p>
              </div>
            ) : filteredHistory.length === 0 ? (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Nenhuma amostra encontrada com os filtros aplicados.
                </p>
              </div>
            ) : (
              <>
                <div className="border rounded-lg overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-50">
                      <TableRow>
                        <TableHead className="w-[160px]">ID da Amostra</TableHead>
                        <TableHead className="w-[160px]">Data de Criação</TableHead>
                        <TableHead className="w-[130px]">Mês Referência</TableHead>
                        <TableHead className="w-[110px] text-center">Contratos</TableHead>
                        <TableHead className="w-[100px] text-center">Status</TableHead>
                        <TableHead className="w-[240px] text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((sample) => (
                        <TableRow key={sample.amostra_id} className="hover:bg-muted/50">
                          <TableCell className="font-mono text-xs">
                            {sample.amostra_id}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(sample.createdAt)}
                          </TableCell>
                          <TableCell className="text-xs">
                            {sample.mesReferencia}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge variant="secondary" className="text-xs font-semibold">
                              {sample.totalContracts}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                              <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                              Concluída
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewDetails(sample)}
                                className="h-6 text-xs px-2"
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                Detalhes
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleReuseCriteria(sample.amostra_id)}
                                className="h-6 text-xs px-2"
                              >
                                <History className="h-3 w-3 mr-1" />
                                Reutilizar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleExportSample(sample.amostra_id)}
                                className="h-6 text-xs px-2"
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

                {/* Informação de resultados */}
                <div className="mt-2 text-xs text-muted-foreground">
                  Exibindo {filteredHistory.length} de {sampleHistory.length} amostras
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Detalhes */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-auto">
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
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">ID da Amostra</Label>
                  <p className="font-mono text-sm font-semibold">{selectedSample.amostra_id}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Data de Criação</Label>
                  <p className="text-sm">{formatDate(selectedSample.createdAt)}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Mês Referência</Label>
                  <p className="text-sm">{selectedSample.mesReferencia}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-xs text-muted-foreground">Total de Contratos</Label>
                  <p className="text-sm font-semibold">{selectedSample.totalContracts}</p>
                </div>
              </div>

              {/* Cards de métricas */}
              <div className="grid grid-cols-3 gap-2 pt-2">
                <Card className="bg-blue-50">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-3 w-3 text-blue-600" />
                      <div>
                        <p className="text-xs text-blue-600 font-medium">Contratos</p>
                        <p className="text-base font-bold text-blue-700">{selectedSample.totalContracts}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-green-50">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-green-600" />
                      <div>
                        <p className="text-xs text-green-600 font-medium">Status</p>
                        <p className="text-sm font-bold text-green-700">Concluída</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-purple-50">
                  <CardContent className="p-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-purple-600" />
                      <div>
                        <p className="text-xs text-purple-600 font-medium">Período</p>
                        <p className="text-sm font-bold text-purple-700">{selectedSample.mesReferencia}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Filtros Utilizados */}
              <div className="pt-2 border-t">
                <div className="flex items-center gap-2 mb-3">
                  <Filter className="h-4 w-4 text-vivo-purple" />
                  <Label className="text-sm font-semibold text-vivo-purple">Filtros Utilizados na Amostragem</Label>
                </div>
                {loadingMetadata ? (
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground text-center">Carregando filtros...</p>
                    </CardContent>
                  </Card>
                ) : !sampleFilterMetadata ? (
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <p className="text-xs text-muted-foreground text-center italic">
                        Esta amostra não possui metadados de filtros salvos.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <Card className="bg-gray-50">
                    <CardContent className="p-3">
                      <div className="grid grid-cols-2 gap-3 text-xs">
                        {/* Tipo de Fluxo */}
                        <div>
                          <p className="text-muted-foreground mb-1">Tipo de Fluxo:</p>
                          <div className="flex flex-wrap gap-1">
                            {sampleFilterMetadata.flow_type && sampleFilterMetadata.flow_type.length > 0 ? (
                              sampleFilterMetadata.flow_type.map((type: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{type}</Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">Todos</Badge>
                            )}
                          </div>
                        </div>

                        {/* Valor do Contrato */}
                        <div>
                          <p className="text-muted-foreground mb-1">Valor do Contrato:</p>
                          <Badge variant="outline" className="text-xs">
                            R$ {sampleFilterMetadata.contract_value_min?.toLocaleString('pt-BR') || 0} - 
                            R$ {sampleFilterMetadata.contract_value_max?.toLocaleString('pt-BR') || 0}
                          </Badge>
                        </div>

                        {/* Data de Vencimento */}
                        <div>
                          <p className="text-muted-foreground mb-1">Data de Vencimento:</p>
                          <Badge variant="outline" className="text-xs">
                            {sampleFilterMetadata.due_date === 'all' ? 'Todas' : 
                             sampleFilterMetadata.due_date === 'custom' ? 
                             `${sampleFilterMetadata.custom_start || ''} até ${sampleFilterMetadata.custom_end || ''}` :
                             sampleFilterMetadata.due_date || 'Todas'}
                          </Badge>
                        </div>

                        {/* Status de Pagamento */}
                        <div>
                          <p className="text-muted-foreground mb-1">Status:</p>
                          <div className="flex flex-wrap gap-1">
                            {sampleFilterMetadata.payment_status && sampleFilterMetadata.payment_status.length > 0 ? (
                              sampleFilterMetadata.payment_status.map((status: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{status}</Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">Todos</Badge>
                            )}
                          </div>
                        </div>

                        {/* Tipo de Alerta */}
                        <div>
                          <p className="text-muted-foreground mb-1">Tipo de Alerta:</p>
                          <div className="flex flex-wrap gap-1">
                            {sampleFilterMetadata.alert_type && sampleFilterMetadata.alert_type.length > 0 ? (
                              sampleFilterMetadata.alert_type.map((type: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{type}</Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">Todos</Badge>
                            )}
                          </div>
                        </div>

                        {/* Risco */}
                        <div>
                          <p className="text-muted-foreground mb-1">Risco:</p>
                          <div className="flex flex-wrap gap-1">
                            {sampleFilterMetadata.risk_level && sampleFilterMetadata.risk_level.length > 0 ? (
                              sampleFilterMetadata.risk_level.map((risk: string, idx: number) => (
                                <Badge key={idx} variant="outline" className="text-xs">{risk}</Badge>
                              ))
                            ) : (
                              <Badge variant="outline" className="text-xs">Todos</Badge>
                            )}
                          </div>
                        </div>

                        {/* Motor de Amostragem */}
                        {sampleFilterMetadata.sampling_motor && (
                          <div>
                            <p className="text-muted-foreground mb-1">Motor de Amostragem:</p>
                            <Badge variant="outline" className="text-xs">
                              {sampleFilterMetadata.sampling_motor === 'highest-value' ? 'Maior Valor' :
                               sampleFilterMetadata.sampling_motor === 'random' ? 'Aleatório' :
                               sampleFilterMetadata.sampling_motor === 'stratified' ? 'Estratificado' :
                               sampleFilterMetadata.sampling_motor}
                            </Badge>
                          </div>
                        )}

                        {/* Tamanho da Amostra */}
                        {sampleFilterMetadata.sample_size && (
                          <div>
                            <p className="text-muted-foreground mb-1">Tamanho da Amostra:</p>
                            <Badge variant="outline" className="text-xs">
                              {sampleFilterMetadata.sample_size} contratos
                            </Badge>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Ações */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t">
                <Button
                  variant="outline"
                  onClick={() => setDetailsModalOpen(false)}
                  size="sm"
                >
                  Fechar
                </Button>
                <Button
                  onClick={() => {
                    handleReuseCriteria(selectedSample.amostra_id);
                    setDetailsModalOpen(false);
                  }}
                  className="bg-vivo-purple hover:bg-vivo-purple/90"
                  size="sm"
                >
                  <History className="h-3 w-3 mr-2" />
                  Reutilizar Critérios
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SampleHistoryModal;

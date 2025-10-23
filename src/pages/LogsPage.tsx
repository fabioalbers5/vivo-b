import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { FileText, RefreshCw } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const LogsPage: React.FC = () => {
  const { data: logs, isLoading, error, refetch } = useAuditLogs();
  const [visibleCount, setVisibleCount] = useState(20);

  // Debug: ver os dados recebidos
  React.useEffect(() => {
    if (logs && logs.length > 0) {
      console.log('Logs recebidos na página:', logs.length);
      console.log('Primeiro log:', logs[0]);
    }
  }, [logs]);

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getActionBadge = (action: string) => {
    const actionMap: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'INSERT': { label: 'Criado', variant: 'default' },
      'UPDATE': { label: 'Atualizado', variant: 'secondary' },
      'DELETE': { label: 'Excluído', variant: 'destructive' },
      'SELECT': { label: 'Consultado', variant: 'outline' },
    };

    const config = actionMap[action] || { label: action, variant: 'outline' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const currentLogs = logs?.slice(0, visibleCount) || [];
  const hasMore = logs && visibleCount < logs.length;

  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 20, logs?.length || 0));
  };

  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Content */}
      <Card className="border-vivo-purple/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-vivo-purple flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Registros do Sistema
            </CardTitle>
            <button
              onClick={() => refetch()}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
              title="Atualizar logs"
            >
              <RefreshCw className={`h-4 w-4 text-muted-foreground ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-12">
              <RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" />
              <p className="text-muted-foreground">Carregando logs...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-semibold mb-2">Erro ao carregar logs</p>
              <p className="text-muted-foreground text-sm">{String(error)}</p>
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log encontrado na tabela audit_logs.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="border rounded-lg overflow-hidden">
                <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-gray-50 z-10">
                      <TableRow>
                        <TableHead className="w-[100px]">ID</TableHead>
                        <TableHead className="w-[120px]">Data</TableHead>
                        <TableHead className="w-[120px]">Hora</TableHead>
                        <TableHead className="w-[180px]">Número do Pagamento</TableHead>
                        <TableHead className="w-[150px]">Ação</TableHead>
                        <TableHead className="w-[200px]">Usuário Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentLogs.map((log) => (
                        <TableRow key={log.id} className="hover:bg-muted/50">
                          <TableCell className="text-xs font-mono">
                            {log.id || '-'}
                          </TableCell>
                          <TableCell className="text-xs">
                            {formatDate(log.data || log.created_at || log.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {formatTime(log.data || log.created_at || log.timestamp)}
                          </TableCell>
                          <TableCell className="text-xs font-mono">
                            {log.numero_pagamento || log.record_id || '-'}
                          </TableCell>
                          <TableCell>{getActionBadge(log.acao || log.action)}</TableCell>
                          <TableCell className="text-xs">
                            {log.usuario_responsavel || log.user_email || log.user_id || 'Sistema'}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Botão Carregar Mais */}
              {hasMore && (
                <div className="flex justify-center pt-4">
                  <button
                    onClick={loadMore}
                    className="px-4 py-2 text-sm font-medium text-vivo-purple hover:bg-vivo-purple/10 rounded-lg transition-colors"
                  >
                    Carregar mais logs
                  </button>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center justify-between px-2 text-xs text-muted-foreground">
                <span>Exibindo {currentLogs.length} de {logs.length} logs</span>
                <span>Última atualização: {new Date().toLocaleTimeString('pt-BR')}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;

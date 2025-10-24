import React, { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, RefreshCw, Filter, X, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { useAuditLogsWithContracts } from "@/hooks/useAuditLogsWithContracts";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

type SortColumn = 'datetime' | 'id' | 'numero_pagamento' | 'acao' | 'usuario' | 'vencimento' | 'tipo_fluxo';
type SortDirection = 'asc' | 'desc';

const LogsPage: React.FC = () => {
  const { data: logs, isLoading, error, refetch } = useAuditLogsWithContracts();
  const [visibleCount, setVisibleCount] = useState(20);
  const { toast } = useToast();

  const [isFilterSidebarOpen, setIsFilterSidebarOpen] = useState(false);
  const [tempDateRange, setTempDateRange] = useState<string>("all");
  const [tempAction, setTempAction] = useState<string>("all");
  const [tempFlowType, setTempFlowType] = useState<string>("all");
  const [tempUser, setTempUser] = useState<string>("all");
  const [tempStatusAnalise, setTempStatusAnalise] = useState<string>("all");
  const [tempStartDate, setTempStartDate] = useState<string>("");
  const [tempEndDate, setTempEndDate] = useState<string>("");
  const [selectedDateRange, setSelectedDateRange] = useState<string>("all");
  const [selectedAction, setSelectedAction] = useState<string>("all");
  const [selectedFlowType, setSelectedFlowType] = useState<string>("all");
  const [selectedUser, setSelectedUser] = useState<string>("all");
  const [selectedStatusAnalise, setSelectedStatusAnalise] = useState<string>("all");
  const [selectedStartDate, setSelectedStartDate] = useState<string>("");
  const [selectedEndDate, setSelectedEndDate] = useState<string>("");
  
  // Estados para ordenação
  const [sortColumn, setSortColumn] = useState<SortColumn>('datetime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (column: SortColumn) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (column: SortColumn) => {
    if (sortColumn !== column) return <ArrowUpDown className="h-4 w-4 ml-1" />;
    return sortDirection === 'asc' ? <ArrowUp className="h-4 w-4 ml-1" /> : <ArrowDown className="h-4 w-4 ml-1" />;
  };

  const handleApplyFilters = () => {
    setSelectedDateRange(tempDateRange);
    setSelectedAction(tempAction);
    setSelectedFlowType(tempFlowType);
    setSelectedUser(tempUser);
    setSelectedStatusAnalise(tempStatusAnalise);
    setSelectedStartDate(tempStartDate);
    setSelectedEndDate(tempEndDate);
    setIsFilterSidebarOpen(false);
    toast({ title: "Filtros aplicados", description: "Os filtros foram aplicados com sucesso." });
  };

  const handleClearFilters = () => {
    setTempDateRange("all");
    setTempAction("all");
    setTempFlowType("all");
    setTempUser("all");
    setTempStatusAnalise("all");
    setTempStartDate("");
    setTempEndDate("");
    setSelectedDateRange("all");
    setSelectedAction("all");
    setSelectedFlowType("all");
    setSelectedUser("all");
    setSelectedStatusAnalise("all");
    setSelectedStartDate("");
    setSelectedEndDate("");
    toast({ title: "Filtros removidos", description: "Todos os filtros foram removidos." });
  };

  const handleOpenFilters = () => {
    setTempDateRange(selectedDateRange);
    setTempAction(selectedAction);
    setTempFlowType(selectedFlowType);
    setTempUser(selectedUser);
    setTempStatusAnalise(selectedStatusAnalise);
    setTempStartDate(selectedStartDate);
    setTempEndDate(selectedEndDate);
    setIsFilterSidebarOpen(true);
  };

  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log => {
      if (selectedDateRange !== "all") {
        const logDate = new Date(log.data || log.created_at || log.timestamp || "");
        const today = new Date();
        today.setHours(23, 59, 59, 999); // Fim do dia de hoje
        
        if (selectedDateRange === "custom") {
          // Filtro personalizado
          if (selectedStartDate && selectedEndDate) {
            const startDate = new Date(selectedStartDate);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(selectedEndDate);
            endDate.setHours(23, 59, 59, 999);
            
            if (logDate < startDate || logDate > endDate) return false;
          }
        } else if (selectedDateRange === "today") {
          // Hoje
          const startOfToday = new Date(today);
          startOfToday.setHours(0, 0, 0, 0);
          if (logDate < startOfToday || logDate > today) return false;
        } else if (selectedDateRange === "7days") {
          // Últimos 7 dias
          const sevenDaysAgo = new Date(today);
          sevenDaysAgo.setDate(today.getDate() - 7);
          sevenDaysAgo.setHours(0, 0, 0, 0);
          if (logDate < sevenDaysAgo || logDate > today) return false;
        } else if (selectedDateRange === "15days") {
          // Últimos 15 dias
          const fifteenDaysAgo = new Date(today);
          fifteenDaysAgo.setDate(today.getDate() - 15);
          fifteenDaysAgo.setHours(0, 0, 0, 0);
          if (logDate < fifteenDaysAgo || logDate > today) return false;
        } else if (selectedDateRange === "30days") {
          // Últimos 30 dias
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          thirtyDaysAgo.setHours(0, 0, 0, 0);
          if (logDate < thirtyDaysAgo || logDate > today) return false;
        } else if (selectedDateRange === "currentMonth") {
          // Mês atual
          const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startOfMonth.setHours(0, 0, 0, 0);
          if (logDate < startOfMonth || logDate > today) return false;
        }
      }
      if (selectedAction !== "all") {
        const action = (log.acao || log.action || "").toUpperCase();
        if (action !== selectedAction) return false;
      }
      if (selectedFlowType !== "all") {
        if (log.tipo_fluxo !== selectedFlowType) return false;
      }
      if (selectedUser !== "all") {
        const user = log.usuario_responsavel || log.user_email || log.user_id || "";
        if (user !== selectedUser) return false;
      }
      if (selectedStatusAnalise !== "all") {
        if (log.status_pagamento !== selectedStatusAnalise) return false;
      }
      return true;
    });
  }, [logs, selectedDateRange, selectedAction, selectedFlowType, selectedUser, selectedStatusAnalise, selectedStartDate, selectedEndDate]);

  // Logs ordenados
  const sortedLogs = useMemo(() => {
    if (!filteredLogs) return [];
    
    const logsToSort = [...filteredLogs];
    
    logsToSort.sort((a, b) => {
      let comparison = 0;
      
      switch (sortColumn) {
        case 'datetime':
          const dateA = new Date(`${a.data || ''} ${a.hora || ''}`).getTime();
          const dateB = new Date(`${b.data || ''} ${b.hora || ''}`).getTime();
          comparison = dateA - dateB;
          break;
        case 'id':
          comparison = (a.id || '').localeCompare(b.id || '');
          break;
        case 'numero_pagamento':
          comparison = (a.numero_pagamento || a.record_id || '').localeCompare(b.numero_pagamento || b.record_id || '');
          break;
        case 'acao':
          comparison = (a.acao || a.action || '').localeCompare(b.acao || b.action || '');
          break;
        case 'usuario':
          const userA = a.usuario_responsavel || a.user_email || a.user_id || '';
          const userB = b.usuario_responsavel || b.user_email || b.user_id || '';
          comparison = userA.localeCompare(userB);
          break;
        case 'vencimento':
          const vencA = new Date(a.data_vencimento || '').getTime();
          const vencB = new Date(b.data_vencimento || '').getTime();
          comparison = vencA - vencB;
          break;
        case 'tipo_fluxo':
          comparison = (a.tipo_fluxo || '').localeCompare(b.tipo_fluxo || '');
          break;
      }
      
      return sortDirection === 'asc' ? comparison : -comparison;
    });
    
    return logsToSort;
  }, [filteredLogs, sortColumn, sortDirection]);

  const uniqueActions = useMemo(() => {
    if (!logs) return [];
    const actions = new Set<string>();
    logs.forEach(log => { const action = (log.acao || log.action || "").toUpperCase(); if (action) actions.add(action); });
    return Array.from(actions).sort();
  }, [logs]);

  const uniqueFlowTypes = useMemo(() => {
    if (!logs) return [];
    const types = new Set<string>();
    logs.forEach(log => { if (log.tipo_fluxo) types.add(log.tipo_fluxo); });
    return Array.from(types).sort();
  }, [logs]);

  const uniqueUsers = useMemo(() => {
    if (!logs) return [];
    const users = new Set<string>();
    logs.forEach(log => { const user = log.usuario_responsavel || log.user_email || log.user_id || ""; if (user && user !== "Sistema") users.add(user); });
    return Array.from(users).sort();
  }, [logs]);

  const uniqueStatusAnalise = useMemo(() => {
    if (!logs) return [];
    const statuses = new Set<string>();
    logs.forEach(log => { if (log.status_pagamento) statuses.add(log.status_pagamento); });
    return Array.from(statuses).sort();
  }, [logs]);

  React.useEffect(() => { if (logs && logs.length > 0) { console.log("Logs recebidos na página:", logs.length); console.log("Primeiro log:", logs[0]); } }, [logs]);

  const formatDateTime = (dateStr: string, timeStr: string) => {
    if (!dateStr) return "-";
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "-";
    
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    
    const time = timeStr && timeStr.match(/^\d{2}:\d{2}:\d{2}$/) ? timeStr : "00:00:00";
    
    return `${day}-${month}-${year} ${time}`;
  };

  const formatDate = (dateString: string) => { 
    if (!dateString) return "-"; 
    const date = new Date(dateString); 
    if (isNaN(date.getTime())) return "-"; 
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }); 
  };
  
  const formatTime = (timeString: string) => { 
    if (!timeString) return "-"; 
    // Se já vier formatado como HH:MM:SS, retorna direto
    if (timeString.match(/^\d{2}:\d{2}:\d{2}$/)) return timeString;
    // Caso contrário, tenta formatar como data
    const date = new Date(timeString); 
    if (isNaN(date.getTime())) return "-"; 
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit" }); 
  };
  
  const getActionBadge = (action: string) => { 
    const actionMap: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = { 
      "INSERT": { label: "Criado", variant: "default" }, 
      "UPDATE": { label: "Atualizado", variant: "secondary" }, 
      "DELETE": { label: "Excluído", variant: "destructive" }, 
      "SELECT": { label: "Consultado", variant: "outline" } 
    }; 
    const config = actionMap[action] || { label: action, variant: "outline" as const }; 
    return <Badge variant={config.variant}>{config.label}</Badge>; 
  };

  const formatAction = (action: string) => {
    if (!action) return "-";
    // Converte para minúsculo e deixa apenas a primeira letra maiúscula
    const formatted = action.toLowerCase();
    return formatted.charAt(0).toUpperCase() + formatted.slice(1);
  };

  const truncateText = (text: string, maxLength: number = 20) => {
    if (!text) return "-";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  };

  const currentLogs = sortedLogs?.slice(0, visibleCount) || [];
  const hasMore = sortedLogs && visibleCount < sortedLogs.length;
  const loadMore = () => { setVisibleCount(prev => Math.min(prev + 20, sortedLogs?.length || 0)); };

  return <div className="p-6 space-y-6 bg-background min-h-full"><div className={cn("fixed top-0 right-0 h-full w-80 bg-background border-l shadow-lg z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto", isFilterSidebarOpen ? "translate-x-0" : "translate-x-full")}><div className="p-6 space-y-6"><div className="flex items-center justify-between"><h2 className="text-xl font-semibold text-vivo-purple">Filtros</h2><button onClick={() => setIsFilterSidebarOpen(false)} className="p-2 hover:bg-muted rounded-lg transition-colors"><X className="h-4 w-4" /></button></div><div className="space-y-2"><label className="text-sm font-medium">Período</label><Select value={tempDateRange} onValueChange={setTempDateRange}><SelectTrigger className="font-semibold"><SelectValue placeholder="Selecione o período" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os períodos</SelectItem><SelectItem value="today">Hoje</SelectItem><SelectItem value="7days">Últimos 7 dias</SelectItem><SelectItem value="15days">Últimos 15 dias</SelectItem><SelectItem value="30days">Últimos 30 dias</SelectItem><SelectItem value="currentMonth">Mês atual</SelectItem><SelectItem value="custom">Personalizado</SelectItem></SelectContent></Select></div>{tempDateRange === 'custom' && <div className="space-y-4 pl-2 border-l-2 border-vivo-purple/20"><div className="space-y-2"><label className="text-sm font-medium">Data Inicial</label><input type="date" value={tempStartDate} onChange={(e) => setTempStartDate(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-vivo-purple" /></div><div className="space-y-2"><label className="text-sm font-medium">Data Final</label><input type="date" value={tempEndDate} onChange={(e) => setTempEndDate(e.target.value)} className="w-full px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-vivo-purple" /></div></div>}<div className="space-y-2"><label className="text-sm font-medium">Ação</label><Select value={tempAction} onValueChange={setTempAction}><SelectTrigger className="font-semibold"><SelectValue placeholder="Selecione a ação" /></SelectTrigger><SelectContent><SelectItem value="all">Todas as ações</SelectItem>{uniqueActions.map(action => <SelectItem key={action} value={action}>{action}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><label className="text-sm font-medium">Tipo de Fluxo</label><Select value={tempFlowType} onValueChange={setTempFlowType}><SelectTrigger className="font-semibold"><SelectValue placeholder="Selecione o tipo de fluxo" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os tipos</SelectItem>{uniqueFlowTypes.map(type => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><label className="text-sm font-medium">Usuário</label><Select value={tempUser} onValueChange={setTempUser}><SelectTrigger className="font-semibold"><SelectValue placeholder="Selecione o usuário" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os usuários</SelectItem>{uniqueUsers.map(user => <SelectItem key={user} value={user}>{user}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><label className="text-sm font-medium">Status da Análise</label><Select value={tempStatusAnalise} onValueChange={setTempStatusAnalise}><SelectTrigger className="font-semibold"><SelectValue placeholder="Selecione o status" /></SelectTrigger><SelectContent><SelectItem value="all">Todos os status</SelectItem>{uniqueStatusAnalise.map(status => <SelectItem key={status} value={status}>{status}</SelectItem>)}</SelectContent></Select></div><div className="flex gap-2 pt-4"><Button onClick={handleApplyFilters} className="flex-1 bg-vivo-purple hover:bg-vivo-purple/90">Aplicar Filtros</Button><Button onClick={handleClearFilters} variant="outline" className="flex-1">Limpar</Button></div></div></div>{isFilterSidebarOpen && <div className="fixed inset-0 bg-black/50 z-40" onClick={() => setIsFilterSidebarOpen(false)} />}<Card className="border-vivo-purple/20"><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-vivo-purple flex items-center gap-2"><FileText className="h-5 w-5" />Registros do Sistema</CardTitle><div className="flex items-center gap-2"><Button onClick={handleClearFilters} variant="outline" size="sm" className="flex items-center gap-2"><X className="h-4 w-4" />Remover Filtros</Button><Button onClick={handleOpenFilters} variant="outline" size="sm" className="flex items-center gap-2"><Filter className="h-4 w-4" />Filtros</Button><button onClick={() => refetch()} className="p-2 hover:bg-muted rounded-lg transition-colors" title="Atualizar logs"><RefreshCw className={cn("h-4 w-4 text-muted-foreground", isLoading && "animate-spin")} /></button></div></div></CardHeader><CardContent>{isLoading ? <div className="text-center py-12"><RefreshCw className="h-8 w-8 text-muted-foreground mx-auto mb-4 animate-spin" /><p className="text-muted-foreground">Carregando logs...</p></div> : error ? <div className="text-center py-12"><FileText className="h-16 w-16 text-red-500 mx-auto mb-4" /><p className="text-red-600 font-semibold mb-2">Erro ao carregar logs</p><p className="text-muted-foreground text-sm">{String(error)}</p></div> : !filteredLogs || filteredLogs.length === 0 ? <div className="text-center py-12"><FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" /><p className="text-muted-foreground">{logs && logs.length > 0 ? "Nenhum log encontrado com os filtros aplicados." : "Nenhum log encontrado na tabela audit_logs."}</p></div> : <div className="space-y-4">              <div className="border rounded-lg overflow-hidden"><div className="overflow-x-auto max-h-[calc(100vh-240px)] overflow-y-auto"><Table><TableHeader className="sticky top-0 bg-gray-50 z-10"><TableRow>
  <TableHead className="w-[170px]">
    <button onClick={() => handleSort('datetime')} className="flex items-center hover:text-vivo-purple transition-colors">
      Data e Hora {getSortIcon('datetime')}
    </button>
  </TableHead>
  <TableHead className="w-[80px]">
    <button onClick={() => handleSort('id')} className="flex items-center hover:text-vivo-purple transition-colors">
      ID {getSortIcon('id')}
    </button>
  </TableHead>
  <TableHead className="w-[150px]">
    <button onClick={() => handleSort('numero_pagamento')} className="flex items-center hover:text-vivo-purple transition-colors">
      Nº Pagamento {getSortIcon('numero_pagamento')}
    </button>
  </TableHead>
  <TableHead className="w-[160px]">
    <button onClick={() => handleSort('acao')} className="flex items-center hover:text-vivo-purple transition-colors">
      Ação {getSortIcon('acao')}
    </button>
  </TableHead>
  <TableHead className="w-[160px]">
    <button onClick={() => handleSort('usuario')} className="flex items-center hover:text-vivo-purple transition-colors">
      Usuário {getSortIcon('usuario')}
    </button>
  </TableHead>
  <TableHead className="w-[120px]">
    <button onClick={() => handleSort('vencimento')} className="flex items-center hover:text-vivo-purple transition-colors">
      Vencimento {getSortIcon('vencimento')}
    </button>
  </TableHead>
  <TableHead className="w-[140px]">
    <button onClick={() => handleSort('tipo_fluxo')} className="flex items-center hover:text-vivo-purple transition-colors">
      Tipo de Fluxo {getSortIcon('tipo_fluxo')}
    </button>
  </TableHead>
</TableRow></TableHeader><TableBody>{currentLogs.map(log => { 
  const dateField = log.data || log.created_at || log.timestamp;
  const timeField = log.hora || '';
  const acaoCompleta = log.acao || log.action || "";
  const usuarioCompleto = log.usuario_responsavel || log.user_email || log.user_id || "Sistema";
  const tipoFluxoCompleto = log.tipo_fluxo || "-";
  
  return <TableRow key={log.id} className="hover:bg-muted/50">
    <TableCell className="text-xs font-mono">{formatDateTime(dateField, timeField)}</TableCell>
    <TableCell className="text-xs font-mono">{log.id || "-"}</TableCell>
    <TableCell className="text-xs font-mono">{log.numero_pagamento || log.record_id || "-"}</TableCell>
    <TableCell className="text-xs" title={acaoCompleta}>
      <div className="truncate max-w-[140px]">{formatAction(acaoCompleta)}</div>
    </TableCell>
    <TableCell className="text-xs" title={usuarioCompleto}>
      <div className="truncate">{usuarioCompleto}</div>
    </TableCell>
    <TableCell className="text-xs">{log.data_vencimento ? formatDate(log.data_vencimento) : "-"}</TableCell>
    <TableCell className="text-xs" title={tipoFluxoCompleto}>
      <div className="truncate max-w-[120px]">{tipoFluxoCompleto}</div>
    </TableCell>
  </TableRow>; 
})}</TableBody></Table></div></div><div className="flex items-center justify-between px-2 text-xs text-muted-foreground"><span>Exibindo {currentLogs.length} de {sortedLogs.length} logs</span>{hasMore && <button onClick={loadMore} className="px-3 py-1 text-xs font-medium text-vivo-purple hover:bg-vivo-purple/10 rounded transition-colors">Carregar mais</button>}<span>Última atualização: {new Date().toLocaleTimeString("pt-BR")}</span></div></div>}</CardContent></Card></div>;
};

export default LogsPage;

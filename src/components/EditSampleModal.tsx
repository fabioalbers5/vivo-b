import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Save,
  X,
  Mail,
  Paperclip,
  History,
  UserPlus,
  AlertCircle,
  Flame,
  FileText,
  Calendar,
  DollarSign,
  Building2,
  User,
  CheckCircle,
  Clock,
  Tag,
  Send,
} from "lucide-react";
import { LegacyContract } from "@/hooks/useContractFilters";
import { useAnalysts } from "@/hooks/useAnalysts";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";

interface EditSampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: LegacyContract | null;
  onSave: (updatedPayment: LegacyContract) => void;
}

interface WatcherEmail {
  id: string;
  email: string;
  name: string;
}

interface ActivityLog {
  id: string;
  action: string;
  user: string;
  timestamp: string;
  details: string;
}

const EditSampleModal = ({ isOpen, onClose, payment, onSave }: EditSampleModalProps) => {
  const { toast } = useToast();
  const { analysts } = useAnalysts();
  
  // Estados do formulário
  const [selectedAnalyst, setSelectedAnalyst] = useState("");
  const [isUrgent, setIsUrgent] = useState(false);
  const [notes, setNotes] = useState("");
  const [watchers, setWatchers] = useState<WatcherEmail[]>([]);
  const [newWatcherEmail, setNewWatcherEmail] = useState("");
  const [newWatcherName, setNewWatcherName] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const [analysisStatus, setAnalysisStatus] = useState<'pending' | 'in_progress' | 'completed' | 'rejected'>('pending');
  const [priority, setPriority] = useState("normal");
  const [estimatedCompletionDate, setEstimatedCompletionDate] = useState("");
  const [reviewComments, setReviewComments] = useState("");

  // Logs de atividade mockados (futuramente integrar com backend)
  const [activityLogs] = useState<ActivityLog[]>([
    {
      id: "1",
      action: "Criação da amostra",
      user: "Sistema",
      timestamp: new Date().toISOString(),
      details: "Amostra criada automaticamente pelo processo de seleção"
    },
    {
      id: "2",
      action: "Atribuição de analista",
      user: "Admin",
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      details: "Analista João Silva atribuído"
    }
  ]);

  useEffect(() => {
    if (payment) {
      setSelectedAnalyst(payment.analyst || "");
      setIsUrgent(payment.isUrgent || false);
      setNotes(payment.notes || "");
      setAnalysisStatus(payment.analysisStatus || "pending");
      setPriority(payment.priority || "normal");
      setEstimatedCompletionDate(payment.estimatedCompletionDate || "");
      setReviewComments(payment.reviewComments || "");
    }
  }, [payment]);

  const handleAddWatcher = () => {
    if (!newWatcherEmail || !newWatcherName) {
      toast({
        title: "Erro",
        description: "Preencha o nome e email do observador",
        variant: "destructive",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newWatcherEmail)) {
      toast({
        title: "Email inválido",
        description: "Digite um email válido",
        variant: "destructive",
      });
      return;
    }

    const newWatcher: WatcherEmail = {
      id: Date.now().toString(),
      email: newWatcherEmail,
      name: newWatcherName,
    };

    setWatchers([...watchers, newWatcher]);
    setNewWatcherEmail("");
    setNewWatcherName("");

    toast({
      title: "Observador adicionado",
      description: `${newWatcherName} receberá notificações sobre esta amostra`,
    });
  };

  const handleRemoveWatcher = (watcherId: string) => {
    setWatchers(watchers.filter(w => w.id !== watcherId));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments([...attachments, ...newFiles]);
      toast({
        title: "Arquivo(s) anexado(s)",
        description: `${newFiles.length} arquivo(s) adicionado(s)`,
      });
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSendEmail = () => {
    if (watchers.length === 0) {
      toast({
        title: "Nenhum destinatário",
        description: "Adicione observadores antes de enviar o email",
        variant: "destructive",
      });
      return;
    }

    // Simulação de envio de email
    toast({
      title: "Email enviado",
      description: `Notificação enviada para ${watchers.length} pessoa(s)`,
    });
  };

  const handleSave = () => {
    if (!payment) return;

    const updatedPayment: LegacyContract = {
      ...payment,
      analyst: selectedAnalyst,
      isUrgent,
      notes,
      analysisStatus,
      priority,
      estimatedCompletionDate,
      reviewComments,
      watchers: watchers.map(w => w.email),
      lastModified: new Date().toISOString(),
    };

    onSave(updatedPayment);
    
    toast({
      title: "Amostra atualizada",
      description: "As alterações foram salvas com sucesso",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline" }> = {
      pending: { label: "Pendente", variant: "secondary" },
      in_progress: { label: "Em Análise", variant: "default" },
      completed: { label: "Concluído", variant: "outline" },
      rejected: { label: "Rejeitado", variant: "destructive" },
    };

    const config = statusConfig[status] || statusConfig.pending;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  if (!payment) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl w-[95vw] h-[85vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
          <div className="flex items-start justify-between gap-2 w-full overflow-hidden">
            <div className="flex-1 min-w-0 overflow-hidden">
              <DialogTitle className="text-lg font-bold flex items-center gap-2 w-full overflow-hidden">
                <FileText className="h-5 w-5 flex-shrink-0" />
                <span className="truncate flex-1">Editar Amostra - {payment.number}</span>
                {isUrgent && <Flame className="h-4 w-4 text-red-500 animate-pulse flex-shrink-0" />}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm truncate w-full">
                Fornecedor: <span className="font-semibold">{payment.supplier}</span> | 
                Valor: <span className="font-semibold">{formatCurrency(payment.paymentValue || payment.value || 0)}</span>
              </DialogDescription>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose} className="flex-shrink-0">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="general" className="flex-1 flex flex-col overflow-hidden min-h-0 w-full">
          <TabsList className="mx-4 mt-2 w-[calc(100%-2rem)] grid grid-cols-4 h-9 flex-shrink-0">
            <TabsTrigger value="general" className="flex items-center justify-center gap-1 text-xs px-1">
              <User className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Geral</span>
            </TabsTrigger>
            <TabsTrigger value="watchers" className="flex items-center justify-center gap-1 text-xs px-1">
              <UserPlus className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Observadores</span>
            </TabsTrigger>
            <TabsTrigger value="attachments" className="flex items-center justify-center gap-1 text-xs px-1">
              <Paperclip className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Anexos</span>
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center justify-center gap-1 text-xs px-1">
              <History className="h-3 w-3 flex-shrink-0" />
              <span className="hidden sm:inline truncate">Histórico</span>
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden min-h-0 w-full">
            <ScrollArea className="h-full w-full px-4">
              <div className="w-full max-w-full overflow-hidden pr-2">{/* ABA GERAL */}
            <TabsContent value="general" className="mt-3 space-y-4 w-full max-w-full overflow-hidden">
              {/* Informações da Amostra */}
              <div className="space-y-3 w-full max-w-full overflow-hidden">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Informações da Amostra
                </h3>
                
                <div className="grid grid-cols-3 gap-3 p-3 bg-muted/50 rounded-lg text-sm w-full max-w-full overflow-hidden">
                  <div className="space-y-1 min-w-0 overflow-hidden">
                    <Label className="text-xs text-muted-foreground">Número do Contrato</Label>
                    <p className="font-semibold text-xs truncate w-full">{payment.number}</p>
                  </div>
                  <div className="space-y-1 min-w-0 overflow-hidden">
                    <Label className="text-xs text-muted-foreground">Tipo de Fluxo</Label>
                    <p className="font-semibold text-xs truncate w-full">{payment.flowType || payment.type}</p>
                  </div>
                  <div className="space-y-1 min-w-0 overflow-hidden">
                    <Label className="text-xs text-muted-foreground">Data de Vencimento</Label>
                    <p className="font-semibold text-xs truncate w-full">{formatDate(payment.dueDate)}</p>
                  </div>
                  <div className="space-y-1 min-w-0 overflow-hidden">
                    <Label className="text-xs text-muted-foreground">Ciclo Tesouraria</Label>
                    <p className="font-semibold text-xs truncate w-full">{payment.treasuryCycle || "N/A"}</p>
                  </div>
                  <div className="space-y-1 min-w-0 overflow-hidden">
                    <Label className="text-xs text-muted-foreground">Tipo de Alerta</Label>
                    <p className="font-semibold text-xs truncate w-full">{payment.alertType || "N/A"}</p>
                  </div>
                  <div className="space-y-1 min-w-0 overflow-hidden">
                    <Label className="text-xs text-muted-foreground">Risco</Label>
                    <Badge variant={payment.risk === "Alto" ? "destructive" : payment.risk === "Médio" ? "default" : "secondary"} className="text-xs max-w-full truncate">
                      {payment.risk || "N/A"}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Configurações da Análise */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Configurações da Análise
                </h3>

                <div className="grid grid-cols-2 gap-3">
                  {/* Analista Responsável */}
                  <div className="space-y-1.5">
                    <Label htmlFor="analyst" className="flex items-center gap-1.5 text-xs">
                      <User className="h-3 w-3" />
                      Analista Responsável *
                    </Label>
                    <Select value={selectedAnalyst} onValueChange={setSelectedAnalyst}>
                      <SelectTrigger id="analyst" className="h-9 text-sm">
                        <SelectValue placeholder="Selecione um analista" />
                      </SelectTrigger>
                      <SelectContent>
                        {analysts.map((analyst, index) => (
                          <SelectItem key={index} value={analyst} className="text-sm">
                            {analyst}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status da Análise */}
                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="flex items-center gap-1.5 text-xs">
                      <Clock className="h-3 w-3" />
                      Status da Análise
                    </Label>
                    <Select 
                      value={analysisStatus} 
                      onValueChange={(value) => setAnalysisStatus(value as 'pending' | 'in_progress' | 'completed' | 'rejected')}
                    >
                      <SelectTrigger id="status" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending" className="text-sm">Pendente</SelectItem>
                        <SelectItem value="in_progress" className="text-sm">Em Análise</SelectItem>
                        <SelectItem value="completed" className="text-sm">Concluído</SelectItem>
                        <SelectItem value="rejected" className="text-sm">Rejeitado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prioridade */}
                  <div className="space-y-1.5">
                    <Label htmlFor="priority" className="flex items-center gap-1.5 text-xs">
                      <Tag className="h-3 w-3" />
                      Prioridade
                    </Label>
                    <Select value={priority} onValueChange={setPriority}>
                      <SelectTrigger id="priority" className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low" className="text-sm">Baixa</SelectItem>
                        <SelectItem value="normal" className="text-sm">Normal</SelectItem>
                        <SelectItem value="high" className="text-sm">Alta</SelectItem>
                        <SelectItem value="critical" className="text-sm">Crítica</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Data Estimada de Conclusão */}
                  <div className="space-y-1.5">
                    <Label htmlFor="completion-date" className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3 w-3" />
                      Data Estimada de Conclusão
                    </Label>
                    <Input
                      id="completion-date"
                      type="date"
                      value={estimatedCompletionDate}
                      onChange={(e) => setEstimatedCompletionDate(e.target.value)}
                      className="h-9 text-sm"
                    />
                  </div>
                </div>

                {/* Checkbox Urgente */}
                <div className="flex items-center space-x-2 p-3 border rounded-lg bg-red-50 dark:bg-red-950/20">
                  <Checkbox
                    id="urgent"
                    checked={isUrgent}
                    onCheckedChange={(checked) => setIsUrgent(checked as boolean)}
                    className="h-4 w-4"
                  />
                  <Label
                    htmlFor="urgent"
                    className="text-xs font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-1.5 cursor-pointer"
                  >
                    <Flame className="h-3 w-3 text-red-500" />
                    Marcar esta amostra como URGENTE
                  </Label>
                </div>
              </div>

              <Separator className="my-3" />

              {/* Notas e Comentários */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold">Notas e Comentários</h3>
                
                <div className="space-y-1.5">
                  <Label htmlFor="notes" className="text-xs">Notas Internas</Label>
                  <Textarea
                    id="notes"
                    placeholder="Adicione observações sobre esta amostra..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="review-comments" className="text-xs">Comentários de Revisão</Label>
                  <Textarea
                    id="review-comments"
                    placeholder="Comentários sobre a revisão ou aprovação..."
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    rows={2}
                    className="text-sm resize-none"
                  />
                </div>
              </div>
            </TabsContent>

            {/* ABA OBSERVADORES */}
            <TabsContent value="watchers" className="mt-3 space-y-3 w-full max-w-full overflow-hidden">
              <div className="space-y-3 w-full max-w-full overflow-hidden">
                <div className="flex items-center justify-between gap-2 w-full max-w-full overflow-hidden">
                  <h3 className="text-sm font-semibold flex items-center gap-1.5 min-w-0 flex-1 overflow-hidden">
                    <UserPlus className="h-3.5 w-3.5 flex-shrink-0" />
                    <span className="truncate">Observadores e Notificações</span>
                  </h3>
                  <Button onClick={handleSendEmail} size="sm" className="gap-1.5 h-8 flex-shrink-0">
                    <Send className="h-3 w-3" />
                    <span className="text-xs hidden sm:inline">Enviar</span>
                  </Button>
                </div>

                <p className="text-xs text-muted-foreground w-full max-w-full break-words">
                  Adicione pessoas que devem receber notificações sobre alterações nesta amostra.
                </p>

                {/* Formulário para adicionar observador */}
                <div className="grid grid-cols-5 gap-2 p-3 border rounded-lg bg-muted/50 w-full max-w-full overflow-hidden">
                  <div className="col-span-2 space-y-1.5 min-w-0">
                    <Label htmlFor="watcher-name" className="text-xs">Nome</Label>
                    <Input
                      id="watcher-name"
                      placeholder="Nome completo"
                      value={newWatcherName}
                      onChange={(e) => setNewWatcherName(e.target.value)}
                      className="h-8 text-sm w-full"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5 min-w-0">
                    <Label htmlFor="watcher-email" className="text-xs">Email</Label>
                    <Input
                      id="watcher-email"
                      type="email"
                      placeholder="email@exemplo.com"
                      value={newWatcherEmail}
                      onChange={(e) => setNewWatcherEmail(e.target.value)}
                      className="h-8 text-sm w-full"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="invisible text-xs">Ação</Label>
                    <Button onClick={handleAddWatcher} className="w-full gap-1.5 h-8">
                      <UserPlus className="h-3 w-3" />
                      <span className="text-xs">Add</span>
                    </Button>
                  </div>
                </div>

                {/* Lista de observadores */}
                {watchers.length > 0 ? (
                  <div className="space-y-2 w-full max-w-full overflow-hidden">
                    <Label className="text-xs">Pessoas Observando ({watchers.length})</Label>
                    <div className="space-y-1.5 w-full max-w-full overflow-hidden">
                      {watchers.map((watcher) => (
                        <div
                          key={watcher.id}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors gap-2 w-full max-w-full overflow-hidden"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                            <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="h-4 w-4 text-primary" />
                            </div>
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="font-medium text-sm truncate w-full">{watcher.name}</p>
                              <p className="text-xs text-muted-foreground truncate w-full">{watcher.email}</p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveWatcher(watcher.id)}
                            className="h-7 w-7 p-0 flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <UserPlus className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum observador adicionado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ABA ANEXOS */}
            <TabsContent value="attachments" className="mt-3 space-y-3 w-full max-w-full overflow-hidden">
              <div className="space-y-3 w-full max-w-full overflow-hidden">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Paperclip className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">Documentos e Anexos</span>
                </h3>

                {/* Upload de arquivos */}
                <div className="border-2 border-dashed rounded-lg p-6 text-center hover:bg-muted/50 transition-colors w-full max-w-full overflow-hidden">
                  <input
                    type="file"
                    id="file-upload"
                    multiple
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Label
                    htmlFor="file-upload"
                    className="cursor-pointer flex flex-col items-center gap-1.5 w-full max-w-full"
                  >
                    <Paperclip className="h-8 w-8 text-muted-foreground" />
                    <span className="text-sm font-medium truncate w-full">Clique para anexar arquivos</span>
                    <span className="text-xs text-muted-foreground break-words w-full">
                      ou arraste e solte arquivos aqui
                    </span>
                  </Label>
                </div>

                {/* Lista de arquivos anexados */}
                {attachments.length > 0 ? (
                  <div className="space-y-2 w-full max-w-full overflow-hidden">
                    <Label className="text-xs">Arquivos Anexados ({attachments.length})</Label>
                    <div className="space-y-1.5 w-full max-w-full overflow-hidden">
                      {attachments.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-2 border rounded-lg hover:bg-muted/50 transition-colors gap-2 w-full max-w-full overflow-hidden"
                        >
                          <div className="flex items-center gap-2 min-w-0 flex-1 overflow-hidden">
                            <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                            <div className="min-w-0 flex-1 overflow-hidden">
                              <p className="font-medium text-sm truncate w-full">{file.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveAttachment(index)}
                            className="h-7 w-7 p-0 flex-shrink-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Paperclip className="h-10 w-10 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum arquivo anexado</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* ABA HISTÓRICO */}
            <TabsContent value="logs" className="mt-3 space-y-2 w-full overflow-hidden box-border">
              <div className="space-y-2 w-full overflow-hidden box-border">
                <h3 className="text-sm font-semibold flex items-center gap-1.5 pr-2">
                  <History className="h-3.5 w-3.5 flex-shrink-0" />
                  <span className="truncate">Histórico</span>
                </h3>

                <div className="space-y-1.5 w-full overflow-hidden box-border">
                  {activityLogs.map((log, index) => (
                    <div
                      key={log.id}
                      className="relative pl-4 pb-2.5 border-l-2 border-muted last:border-l-0 last:pb-0 w-full overflow-hidden box-border pr-2"
                      style={{ maxWidth: '100%' }}
                    >
                      <div className="absolute left-[-4px] top-0.5 h-2 w-2 rounded-full bg-primary border border-background flex-shrink-0" />
                      <div className="space-y-0.5 w-full overflow-hidden box-border" style={{ maxWidth: '100%' }}>
                        <div className="w-full overflow-hidden box-border" style={{ maxWidth: '100%' }}>
                          <p className="font-semibold text-[11px] truncate w-full mb-0.5" style={{ maxWidth: '100%' }}>
                            {log.action}
                          </p>
                          <span className="text-[9px] text-muted-foreground block">
                            {new Date(log.timestamp).toLocaleString('pt-BR', { 
                              day: '2-digit', 
                              month: '2-digit',
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </span>
                        </div>
                        <p className="text-[9px] text-muted-foreground truncate w-full" style={{ maxWidth: '100%' }}>
                          Por: {log.user}
                        </p>
                        <p className="text-[9px] break-words w-full overflow-hidden leading-relaxed" style={{ maxWidth: '100%', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                          {log.details}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>
              </div>
            </ScrollArea>
          </div>
        </Tabs>

        <DialogFooter className="px-4 py-3 border-t bg-muted/30 flex-shrink-0 w-full max-w-full overflow-hidden">
          <div className="flex items-center justify-between w-full gap-2">
            <div className="flex items-center gap-2 flex-shrink-0">
              {getStatusBadge(analysisStatus)}
              {isUrgent && (
                <Badge variant="destructive" className="gap-1 text-xs">
                  <Flame className="h-3 w-3" />
                  Urgente
                </Badge>
              )}
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button variant="outline" onClick={onClose} size="sm" className="h-9">
                <X className="h-3 w-3 mr-1.5" />
                <span className="text-xs">Cancelar</span>
              </Button>
              <Button onClick={handleSave} size="sm" className="gap-1.5 h-9">
                <Save className="h-3 w-3" />
                <span className="text-xs">Salvar Alterações</span>
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSampleModal;

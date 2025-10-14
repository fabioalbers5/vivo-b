import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { VivoFilterConfigFactory, VivoFilterField } from "@/core/entities/VivoCustomFilters";
import { VivoCustomFilterRenderer } from "@/components/filters/vivo/VivoCustomFilterRenderer";
import { customFilterService } from "@/infra/di/container";
import { Filter, Info, Zap } from "lucide-react";

interface CreateFilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (filter: CustomFilter) => Promise<void>;
}

export interface CustomFilter {
  id: string;
  name: string;
  type: 'Range' | 'Dropdown' | 'Multi-select' | 'Input' | 'Checkbox' | 'Data' | 'Intervalo';
  table: string;
  field: string;
  options?: Array<{ value: string; label: string }>;
}

const CreateFilterModal = ({ isOpen, onClose, onSave }: CreateFilterModalProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<'select' | 'configure' | 'preview'>('select');
  const [selectedField, setSelectedField] = useState<VivoFilterField | null>(null);
  const [filterName, setFilterName] = useState('');
  const [previewValue, setPreviewValue] = useState<unknown>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Obter campos disponíveis para filtros
  const availableFields = VivoFilterConfigFactory.getAllAvailableFields();

  const handleFieldSelect = (field: VivoFilterField) => {
    setSelectedField(field);
    const config = VivoFilterConfigFactory.getConfiguration(field);
    setFilterName(config.label || field);
    
    // Configurar valor inicial baseado no tipo
    switch (field) {
      case 'status_pagamento':
      case 'tipo_alerta':
      case 'area_solicitante':
      case 'risco':
        setPreviewValue([]);
        break;
      case 'multa':
        setPreviewValue([0, 1000000]);
        break;
      case 'municipio':
        setPreviewValue('');
        break;
      default:
        setPreviewValue(null);
    }
    
    setStep('configure');
  };

  const handleSave = async () => {
    if (!selectedField || !filterName.trim()) {
      toast({
        title: "Campos obrigatórios",
        description: "Selecione um campo e defina um nome para o filtro.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      // Obter configuração do filtro
      const filterType = VivoFilterConfigFactory.getFilterType(selectedField);
      const config = VivoFilterConfigFactory.getConfiguration(selectedField);

      // Criar filtro no formato legado para compatibilidade
      const legacyFilter: CustomFilter = {
        id: '', // Será gerado temporariamente
        name: filterName,
        type: filterType === 'multiselect' ? 'Multi-select' : 
              filterType === 'range' ? 'Range' :
              filterType === 'text' ? 'Input' : 'Dropdown',
        table: 'contratos_vivo',
        field: selectedField,
        options: config.options ? config.options.map(opt => ({
          value: String(opt.value),
          label: opt.label
        })) : undefined
      };

      // Fechar modal imediatamente para renderização instantânea
      handleClose();
      
      // Adicionar filtro à UI (será renderizado instantaneamente)
      onSave(legacyFilter);
    } catch (error) {
      // // // console.error('Erro ao criar filtro:', error);
      toast({
        title: "Erro ao criar filtro",
        description: error instanceof Error ? error.message : "Ocorreu um erro inesperado.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedField(null);
    setFilterName('');
    setPreviewValue(null);
    setIsLoading(false);
    onClose();
  };

  const renderStepContent = () => {
    switch (step) {
      case 'select':
        return (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="h-4 w-4" />
              <span>Selecione o campo para criar um novo filtro personalizado</span>
            </div>
            
            <div className="grid gap-3 max-h-96 overflow-y-auto">
              {availableFields.map((field) => (
                <Card 
                  key={field.value} 
                  className="cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleFieldSelect(field.value)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm font-medium">
                        {field.label}
                      </CardTitle>
                      <Badge variant="outline" className="text-xs">
                        {VivoFilterConfigFactory.getFilterType(field.value)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <CardDescription className="text-xs">
                      {field.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'configure':
        return (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div className="flex items-center gap-2 sticky top-0 bg-popover z-10 pb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setStep('select')}
                className="h-8 px-2"
              >
                ← Voltar
              </Button>
              <div className="text-sm text-muted-foreground">
                Configurando filtro para: <strong>{selectedField}</strong>
              </div>
            </div>

            <div>
              <Label htmlFor="filter-name">Nome do Filtro *</Label>
              <Input
                id="filter-name"
                value={filterName}
                onChange={(e) => setFilterName(e.target.value)}
                placeholder="Digite um nome para o filtro..."
              />
            </div>

            {selectedField && (
              <div>
                <Label className="text-sm font-medium">Prévia do Filtro</Label>
                <Card className="mt-2">
                  <CardContent className="p-4">
                    <VivoCustomFilterRenderer
                      field={selectedField}
                      value={previewValue}
                      onValueChange={setPreviewValue}
                    />
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="flex items-center gap-2 p-3 bg-muted/50 rounded-lg">
              <Zap className="h-4 w-4 text-yellow-500" />
              <div className="text-xs text-muted-foreground">
                <strong>Busca inteligente:</strong> {selectedField === 'municipio' ? 
                  'Ignora acentos e caracteres especiais' : 
                  'Filtro otimizado para performance'
                }
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] flex flex-col bg-popover">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-vivo-purple">
            <Filter className="h-5 w-5" />
            Adicionar Novo Filtro Personalizado
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 min-h-0 overflow-hidden">
          {renderStepContent()}
        </div>

        <DialogFooter className="flex-shrink-0 mt-4">
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancelar
          </Button>
          
          {step === 'configure' && (
            <Button 
              onClick={handleSave} 
              disabled={!selectedField || !filterName.trim() || isLoading}
            >
              {isLoading ? 'Criando...' : 'Criar Filtro'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default CreateFilterModal;

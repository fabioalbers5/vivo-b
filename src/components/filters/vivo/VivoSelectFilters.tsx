import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { PaymentStatus, AlertType, RequestingArea, ContractRisk } from '@/core/entities/Contract';

interface VivoMultiSelectProps {
  label: string;
  description?: string;
  options: Array<{ value: string; label: string }>;
  selectedValues: string[];
  onValueChange: (values: string[]) => void;
  placeholder?: string;
}

export const VivoMultiSelect: React.FC<VivoMultiSelectProps> = ({
  label,
  description,
  options,
  selectedValues,
  onValueChange,
  placeholder = "Selecione uma ou mais opções..."
}) => {
  const handleSelect = (value: string) => {
    if (!selectedValues.includes(value)) {
      onValueChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string) => {
    onValueChange(selectedValues.filter(v => v !== value));
  };

  const handleClear = () => {
    onValueChange([]);
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      <Select onValueChange={handleSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options
            .filter(option => !selectedValues.includes(option.value))
            .map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
        </SelectContent>
      </Select>

      {selectedValues.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {selectedValues.length} selecionado(s)
            </span>
            <button
              type="button"
              onClick={handleClear}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Limpar todos
            </button>
          </div>
          
          <div className="flex flex-wrap gap-1">
            {selectedValues.map((value) => {
              const option = options.find(opt => opt.value === value);
              return (
                <Badge key={value} variant="secondary" className="text-xs">
                  {option?.label || value}
                  <button
                    type="button"
                    onClick={() => handleRemove(value)}
                    className="ml-1 hover:bg-destructive hover:text-destructive-foreground rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

// Componentes específicos para cada tipo de filtro do Vivo

interface PaymentStatusFilterProps {
  selectedValues: PaymentStatus[];
  onValueChange: (values: PaymentStatus[]) => void;
}

export const PaymentStatusFilter: React.FC<PaymentStatusFilterProps> = ({
  selectedValues,
  onValueChange
}) => {
  const options = [
    { value: 'Aprovado com análise', label: 'Aprovado com análise' },
    { value: 'Aprovado em massa', label: 'Aprovado em massa' },
    { value: 'Pendente', label: 'Pendente' },
    { value: 'Rejeitado', label: 'Rejeitado' }
  ];

  return (
    <VivoMultiSelect
      label="Status do Pagamento"
      description="Status de aprovação do pagamento do contrato"
      options={options}
      selectedValues={selectedValues}
      onValueChange={onValueChange as (values: string[]) => void}
      placeholder="Selecione os status..."
    />
  );
};

interface AlertTypeFilterProps {
  selectedValues: AlertType[];
  onValueChange: (values: AlertType[]) => void;
}

export const AlertTypeFilter: React.FC<AlertTypeFilterProps> = ({
  selectedValues,
  onValueChange
}) => {
  const options = [
    { value: 'Assinatura', label: 'Assinatura' },
    { value: 'Clausulas contraditorias', label: 'Clausulas contraditorias' },
    { value: 'Contrato aprovado', label: 'Contrato aprovado' },
    { value: 'Dados das partes', label: 'Dados das partes' },
    { value: 'Obrigatoriedades legais', label: 'Obrigatoriedades legais' },
    { value: 'Operacional', label: 'Operacional' },
    { value: 'Pagamento', label: 'Pagamento' }
  ];

  return (
    <VivoMultiSelect
      label="Tipo de Alerta"
      description="Categoria do alerta gerado para o contrato"
      options={options}
      selectedValues={selectedValues}
      onValueChange={onValueChange as (values: string[]) => void}
      placeholder="Selecione os tipos de alerta..."
    />
  );
};

interface RequestingAreaFilterProps {
  selectedValues: RequestingArea[];
  onValueChange: (values: RequestingArea[]) => void;
}

export const RequestingAreaFilter: React.FC<RequestingAreaFilterProps> = ({
  selectedValues,
  onValueChange
}) => {
  const options = [
    { value: 'Compras', label: 'Compras' },
    { value: 'Financeiro', label: 'Financeiro' },
    { value: 'Jurídico', label: 'Jurídico' },
    { value: 'Logística', label: 'Logística' },
    { value: 'Marketing', label: 'Marketing' },
    { value: 'RH', label: 'RH' },
    { value: 'Operações', label: 'Operações' }
  ];

  return (
    <VivoMultiSelect
      label="Área Solicitante"
      description="Área organizacional que solicitou o contrato"
      options={options}
      selectedValues={selectedValues}
      onValueChange={onValueChange as (values: string[]) => void}
      placeholder="Selecione as áreas..."
    />
  );
};

interface RiskFilterProps {
  selectedValues: ContractRisk[];
  onValueChange: (values: ContractRisk[]) => void;
}

export const RiskFilter: React.FC<RiskFilterProps> = ({
  selectedValues,
  onValueChange
}) => {
  const options = [
    { value: 'Baixo', label: 'Baixo' },
    { value: 'Médio', label: 'Médio' },
    { value: 'Alto', label: 'Alto' }
  ];

  return (
    <VivoMultiSelect
      label="Nível de Risco"
      description="Classificação de risco do contrato"
      options={options}
      selectedValues={selectedValues}
      onValueChange={onValueChange as (values: string[]) => void}
      placeholder="Selecione os níveis de risco..."
    />
  );
};

import React, { useState } from 'react';
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  const [open, setOpen] = useState(false);

  const handleToggle = (value: string) => {
    if (selectedValues.includes(value)) {
      onValueChange(selectedValues.filter(v => v !== value));
    } else {
      onValueChange([...selectedValues, value]);
    }
  };

  const handleRemove = (value: string) => {
    onValueChange(selectedValues.filter(v => v !== value));
  };

  return (
    <div className="space-y-2">
      {label && <Label className="text-sm font-medium">{label}</Label>}
      {description && (
        <p className="text-xs text-muted-foreground">{description}</p>
      )}
      
      {/* Selected items display */}
      {selectedValues.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
          {selectedValues.map((value) => {
            const option = options.find(opt => opt.value === value);
            const displayName = option?.value || value;
            return (
              <Badge key={value} variant="secondary" className="text-xs py-0 px-1">
                {displayName}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(value);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleRemove(value)}
                >
                  <X className="h-2 w-2 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {selectedValues.length === 0
              ? placeholder
              : `${selectedValues.length} selecionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar..." />
            <CommandList>
              <CommandEmpty>Nenhum item encontrado.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.value}
                    onSelect={() => handleToggle(option.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        selectedValues.includes(option.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
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
      label=""
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
      label=""
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
      label=""
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
      label=""
      options={options}
      selectedValues={selectedValues}
      onValueChange={onValueChange as (values: string[]) => void}
      placeholder="Selecione os níveis de risco..."
    />
  );
};

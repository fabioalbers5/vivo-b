import { useState } from "react";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface ContractNumberFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

// Lista de números de contrato mockados - você pode integrar com seus dados reais
const contractNumbers = [
  { value: "CT-2024-001", label: "CT-2024-001 - Contrato de Serviços" },
  { value: "CT-2024-002", label: "CT-2024-002 - Contrato de Fornecimento" },
  { value: "CT-2024-003", label: "CT-2024-003 - Contrato de Manutenção" },
  { value: "CT-2024-004", label: "CT-2024-004 - Contrato de Consultoria" },
  { value: "CT-2024-005", label: "CT-2024-005 - Contrato de Licenciamento" },
  { value: "CT-2023-150", label: "CT-2023-150 - Contrato Anual" },
  { value: "CT-2023-151", label: "CT-2023-151 - Contrato Mensal" },
  { value: "CT-2023-152", label: "CT-2023-152 - Contrato Emergencial" },
  { value: "CT-2025-010", label: "CT-2025-010 - Contrato Futuro" },
  { value: "CT-2025-011", label: "CT-2025-011 - Contrato Renovação" },
];

const ContractNumberFilter = ({ value, onChange }: ContractNumberFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (contractValue: string) => {
    if (value.includes(contractValue)) {
      onChange(value.filter(v => v !== contractValue));
    } else {
      onChange([...value, contractValue]);
    }
  };

  const handleRemove = (contractValue: string) => {
    onChange(value.filter(v => v !== contractValue));
  };

  return (
    <div className="space-y-2">
      {/* Selected contracts display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
          {value.map((contractValue) => {
            const contract = contractNumbers.find(c => c.value === contractValue);
            return (
              <Badge key={contractValue} variant="secondary" className="text-xs py-0 px-1">
                {contract?.value || contractValue}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(contractValue);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleRemove(contractValue)}
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
            {value.length === 0
              ? "Selecione contratos..."
              : `${value.length} contrato(s) selecionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar contrato..." />
            <CommandList>
              <CommandEmpty>Nenhum contrato encontrado.</CommandEmpty>
              <CommandGroup>
                {contractNumbers.map((contract) => (
                  <CommandItem
                    key={contract.value}
                    value={contract.value}
                    onSelect={() => handleToggle(contract.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(contract.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {contract.label}
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

export default ContractNumberFilter;
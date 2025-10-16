import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const handleToggle = (contractValue: string) => {
    if (value.includes(contractValue)) {
      onChange(value.filter(v => v !== contractValue));
    } else {
      onChange([...value, contractValue]);
    }
  };

  return (
    <Command className="border rounded-md">
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
  );
};

export default ContractNumberFilter;
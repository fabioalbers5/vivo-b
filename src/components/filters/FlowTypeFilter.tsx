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
const flowTypes = [
  { value: "RE", label: "RE - Receita" },
  { value: "Real State", label: "Real State - Imobiliário" },
  { value: "FI", label: "FI - Financeiro" },
  { value: "Proposta", label: "Proposta - Comercial" },
  { value: "Engenharia", label: "Engenharia - Técnico" },
  { value: "RC", label: "RC - Recursos" },
];

interface FlowTypeFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

const FlowTypeFilter = ({ value, onChange }: FlowTypeFilterProps) => {
  const handleToggle = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter(v => v !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  return (
    <Command className="border rounded-md">
      <CommandInput placeholder="Buscar tipo de fluxo..." />
      <CommandList>
        <CommandEmpty>Nenhum tipo encontrado.</CommandEmpty>
        <CommandGroup>
          {flowTypes.map((flowType) => (
            <CommandItem
              key={flowType.value}
              value={flowType.value}
              onSelect={() => handleToggle(flowType.value)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  value.includes(flowType.value) ? "opacity-100" : "opacity-0"
                )}
              />
              {flowType.label}
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default FlowTypeFilter;

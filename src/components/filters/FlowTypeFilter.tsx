import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
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
  const [open, setOpen] = useState(false);
  
  const handleToggle = (selectedValue: string) => {
    if (value.includes(selectedValue)) {
      onChange(value.filter(v => v !== selectedValue));
    } else {
      onChange([...value, selectedValue]);
    }
  };

  const getDisplayText = () => {
    if (value.length === 0) return "Todos os fluxos";
    if (value.length === 1) {
      const selected = flowTypes.find(ft => ft.value === value[0]);
      return selected?.label || "Selecionado";
    }
    return `${value.length} fluxos selecionados`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Tipo de Fluxo</label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {getDisplayText()}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-0" align="start">
          <Command>
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default FlowTypeFilter;

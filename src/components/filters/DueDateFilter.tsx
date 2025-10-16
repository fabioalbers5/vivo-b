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
import { Input } from "@/components/ui/input";

const dueDateOptions = [
  { value: "all", label: "Todos os períodos" },
  { value: "7", label: "Até 7 dias" },
  { value: "30", label: "Até 30 dias" },
  { value: "30-60", label: "30 a 60 dias" },
  { value: "60-90", label: "60 a 90 dias" },
  { value: "custom", label: "Período personalizado" }
];

interface DueDateFilterProps {
  value: string;
  customStart: string;
  customEnd: string;
  onChange: (value: string) => void;
  onCustomStartChange: (date: string) => void;
  onCustomEndChange: (date: string) => void;
}

const DueDateFilter = ({ 
  value, 
  customStart, 
  customEnd, 
  onChange, 
  onCustomStartChange, 
  onCustomEndChange 
}: DueDateFilterProps) => {
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
  };

  return (
    <div className="space-y-2">
      <Command className="border rounded-md">
        <CommandInput placeholder="Buscar período..." />
        <CommandList>
          <CommandEmpty>Nenhum período encontrado.</CommandEmpty>
          <CommandGroup>
            {dueDateOptions.map((option) => (
              <CommandItem
                key={option.value}
                value={option.value}
                onSelect={() => handleSelect(option.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </CommandItem>
            ))}
          </CommandGroup>
        </CommandList>
      </Command>

      {value === "custom" && (
        <div className="space-y-2 mt-3 p-3 border rounded-md bg-gray-50">
          <div className="text-sm font-medium text-gray-700">Período personalizado</div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-600 block mb-1">Data inicial</label>
              <Input
                type="date"
                value={customStart}
                onChange={(e) => onCustomStartChange(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
            <div>
              <label className="text-xs text-gray-600 block mb-1">Data final</label>
              <Input
                type="date"
                value={customEnd}
                onChange={(e) => onCustomEndChange(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DueDateFilter;

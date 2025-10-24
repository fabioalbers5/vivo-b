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
  const [open, setOpen] = useState(false);
  
  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue);
  };

  const getDisplayText = () => {
    const selected = dueDateOptions.find(opt => opt.value === value);
    return selected?.label || "Todos os períodos";
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">Vencimento do Pagamento</label>
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
            <div className="p-3 border-t bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-3">Período personalizado</div>
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
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default DueDateFilter;

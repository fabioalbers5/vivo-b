import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

interface ContractCountFilterProps {
  value: number;
  onChange: (value: number) => void;
}

const ContractCountFilter = ({ value, onChange }: ContractCountFilterProps) => {
  const [open, setOpen] = useState(false);

  const getDisplayText = () => {
    return `${value} contrato${value !== 1 ? 's' : ''}`;
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Quantidade de Contratos
      </label>
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
        <PopoverContent className="w-[320px] p-4" align="start">
          <div className="space-y-2">
            <Input
              id="contract-count"
              type="number"
              min="1"
              max="1000"
              value={value}
              onChange={(e) => {
                onChange(parseInt(e.target.value) || 1);
              }}
              placeholder="Quantidade de contratos a sortear"
            />
            <p className="text-xs text-muted-foreground">
              Número de contratos que serão sorteados aleatoriamente com base nos filtros aplicados.
            </p>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ContractCountFilter;

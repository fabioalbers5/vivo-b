import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronsUpDown } from "lucide-react";
import { useState } from "react";

interface ValueRangeFilterProps {
  title: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const ValueRangeFilter = ({ title, min, max, value, onChange }: ValueRangeFilterProps) => {
  const [open, setOpen] = useState(false);
  
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value) || 0;
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value) || max;
    onChange([value[0], newMax]);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(val);
  };

  const getDisplayText = () => {
    if (value[0] === 0 && value[1] === max) {
      return "Todos os valores";
    }
    return `${formatCurrency(value[0])} - ${formatCurrency(value[1])}`;
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-gray-700">{title}</Label>
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
          <div className="space-y-3">
            <div className="text-sm font-medium text-gray-700">{title}</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-600 block mb-1">Valor Mínimo</label>
                <Input
                  type="number"
                  value={value[0]}
                  onChange={handleMinChange}
                  placeholder="0"
                  className="h-9 text-sm"
                />
              </div>
              <div>
                <label className="text-xs text-gray-600 block mb-1">Valor Máximo</label>
                <Input
                  type="number"
                  value={value[1]}
                  onChange={handleMaxChange}
                  placeholder={max.toString()}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default ValueRangeFilter;

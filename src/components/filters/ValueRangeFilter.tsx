import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

interface ValueRangeFilterProps {
  title: string;
  min: number;
  max: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
}

const ValueRangeFilter = ({ title, min, max, value, onChange }: ValueRangeFilterProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(amount);
  };

  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value) || 0;
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value) || max;
    onChange([value[0], newMax]);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor={`${title}-min`} className="text-sm font-medium text-gray-700">
            Valor mínimo
          </Label>
          <Input
            id={`${title}-min`}
            type="number"
            value={value[0]}
            onChange={handleMinChange}
            placeholder="0"
            className="h-9 text-sm mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(value[0])}
          </p>
        </div>
        <div>
          <Label htmlFor={`${title}-max`} className="text-sm font-medium text-gray-700">
            Valor máximo
          </Label>
          <Input
            id={`${title}-max`}
            type="number"
            value={value[1]}
            onChange={handleMaxChange}
            placeholder={max.toString()}
            className="h-9 text-sm mt-1"
          />
          <p className="text-xs text-muted-foreground mt-1">
            {formatCurrency(value[1])}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ValueRangeFilter;

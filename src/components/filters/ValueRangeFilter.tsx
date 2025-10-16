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
  const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMin = parseFloat(e.target.value) || 0;
    onChange([newMin, value[1]]);
  };

  const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newMax = parseFloat(e.target.value) || max;
    onChange([value[0], newMax]);
  };

  return (
    <div className="space-y-2 p-2">
      <Label className="text-sm font-medium">{title}</Label>
      <div className="grid grid-cols-2 gap-2">
        <Input
          id={`${title}-min`}
          type="number"
          value={value[0]}
          onChange={handleMinChange}
          placeholder="Mínimo"
          aria-label="Valor mínimo"
          className="h-9 text-sm"
        />
        <Input
          id={`${title}-max`}
          type="number"
          value={value[1]}
          onChange={handleMaxChange}
          placeholder="Máximo"
          aria-label="Valor máximo"
          className="h-9 text-sm"
        />
      </div>
    </div>
  );
};

export default ValueRangeFilter;

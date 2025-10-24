import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { ChevronsUpDown } from 'lucide-react';

interface TreasuryCycleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const TreasuryCycleFilter: React.FC<TreasuryCycleFilterProps> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);

  const getDisplayText = () => {
    if (value === 'all') return 'Todos';
    return value === 'Sim' ? 'Sim' : 'Não';
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Ciclo Tesouraria
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
          <RadioGroup value={value} onValueChange={(newValue) => {
            onChange(newValue);
            setOpen(false);
          }} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="all" id="treasury-all" />
              <Label htmlFor="treasury-all" className="text-sm font-normal cursor-pointer">
                Todos
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Sim" id="treasury-yes" />
              <Label htmlFor="treasury-yes" className="text-sm font-normal cursor-pointer">
                Sim
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="Não" id="treasury-no" />
              <Label htmlFor="treasury-no" className="text-sm font-normal cursor-pointer">
                Não
              </Label>
            </div>
          </RadioGroup>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default TreasuryCycleFilter;

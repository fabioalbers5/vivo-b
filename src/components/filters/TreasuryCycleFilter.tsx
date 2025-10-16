import React from 'react';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface TreasuryCycleFilterProps {
  value: string;
  onChange: (value: string) => void;
}

const TreasuryCycleFilter: React.FC<TreasuryCycleFilterProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-3">
      <RadioGroup value={value} onValueChange={onChange} className="space-y-2">
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
    </div>
  );
};

export default TreasuryCycleFilter;

import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from 'lucide-react';
import { SamplingMotor } from './MotorSelector';

interface SampleParametersProps {
  selectedMotor: SamplingMotor;
  sampleSize: number;
  onSampleSizeChange: (size: number) => void;
  targetDate?: string;
  onTargetDateChange?: (date: string) => void;
}

const SampleParameters: React.FC<SampleParametersProps> = ({
  selectedMotor,
  sampleSize,
  onSampleSizeChange,
  targetDate,
  onTargetDateChange
}) => {
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="flex items-center gap-4">
      {/* Tamanho da amostra - sempre visível */}
      <div className="flex items-center gap-2">
        <Label htmlFor="sampleSize" className="text-sm whitespace-nowrap text-gray-600">
          Tamanho da amostra:
        </Label>
        <Input
          id="sampleSize"
          type="number"
          min="1"
          value={sampleSize}
          onChange={(e) => onSampleSizeChange(Math.max(1, parseInt(e.target.value) || 1))}
          className="w-20 h-8 text-sm"
        />
      </div>

      {/* Data - apenas para Top Fornecedores do Dia */}
      {selectedMotor === 'top-suppliers' && (
        <div className="flex items-center gap-2">
          <Label htmlFor="targetDate" className="text-sm whitespace-nowrap text-gray-600 flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Data:
          </Label>
          <Input
            id="targetDate"
            type="date"
            value={targetDate || today}
            onChange={(e) => onTargetDateChange?.(e.target.value)}
            className="w-36 h-8 text-sm"
          />
        </div>
      )}
    </div>
  );
};

export default SampleParameters;

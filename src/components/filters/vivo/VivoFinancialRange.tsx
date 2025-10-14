import React, { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface VivoFinancialRangeProps {
  label: string;
  description?: string;
  min: number;
  max: number;
  step: number;
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
  currency?: boolean;
  allowManualInput?: boolean;
}

export const VivoFinancialRange: React.FC<VivoFinancialRangeProps> = ({
  label,
  description,
  min,
  max,
  step,
  value,
  onValueChange,
  currency = true,
  allowManualInput = true
}) => {
  const [localValue, setLocalValue] = useState<[number, number]>(value);
  const [manualMin, setManualMin] = useState(value[0].toString());
  const [manualMax, setManualMax] = useState(value[1].toString());

  useEffect(() => {
    setLocalValue(value);
    setManualMin(value[0].toString());
    setManualMax(value[1].toString());
  }, [value]);

  const formatCurrency = (amount: number): string => {
    if (!currency) return amount.toLocaleString('pt-BR');
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const parseCurrency = (value: string): number => {
    const numericValue = value.replace(/[^\d]/g, '');
    return parseInt(numericValue) || 0;
  };

  const handleSliderChange = (newValue: number[]) => {
    const typedValue = [newValue[0], newValue[1]] as [number, number];
    setLocalValue(typedValue);
    setManualMin(newValue[0].toString());
    setManualMax(newValue[1].toString());
    onValueChange(typedValue);
  };

  const handleManualMinChange = (inputValue: string) => {
    setManualMin(inputValue);
    const numericValue = parseCurrency(inputValue);
    
    if (numericValue >= min && numericValue <= localValue[1]) {
      const newValue: [number, number] = [numericValue, localValue[1]];
      setLocalValue(newValue);
      onValueChange(newValue);
    }
  };

  const handleManualMaxChange = (inputValue: string) => {
    setManualMax(inputValue);
    const numericValue = parseCurrency(inputValue);
    
    if (numericValue <= max && numericValue >= localValue[0]) {
      const newValue: [number, number] = [localValue[0], numericValue];
      setLocalValue(newValue);
      onValueChange(newValue);
    }
  };

  const handleReset = () => {
    const defaultValue: [number, number] = [min, max];
    setLocalValue(defaultValue);
    setManualMin(min.toString());
    setManualMax(max.toString());
    onValueChange(defaultValue);
  };

  const getSliderPercentage = (value: number): number => {
    return ((value - min) / (max - min)) * 100;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleReset}
          className="h-8 w-8 p-0"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          {/* Slider */}
          <div className="space-y-3">
            <Slider
              value={localValue}
              onValueChange={handleSliderChange}
              min={min}
              max={max}
              step={step}
              className="w-full"
            />
            
            {/* Valores do slider */}
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{formatCurrency(min)}</span>
              <span>{formatCurrency(max)}</span>
            </div>
          </div>

          {/* Valor selecionado */}
          <div className="text-center">
            <div className="text-sm font-medium">
              {formatCurrency(localValue[0])} - {formatCurrency(localValue[1])}
            </div>
            <div className="text-xs text-muted-foreground">faixa selecionada</div>
          </div>

          {/* Inputs manuais */}
          {allowManualInput && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="manual-min" className="text-xs">
                  Valor Mínimo
                </Label>
                <Input
                  id="manual-min"
                  type="text"
                  value={currency ? formatCurrency(parseCurrency(manualMin)) : manualMin}
                  onChange={(e) => handleManualMinChange(e.target.value)}
                  className="text-sm"
                  placeholder={formatCurrency(min)}
                />
              </div>
              
              <div className="space-y-1">
                <Label htmlFor="manual-max" className="text-xs">
                  Valor Máximo
                </Label>
                <Input
                  id="manual-max"
                  type="text"
                  value={currency ? formatCurrency(parseCurrency(manualMax)) : manualMax}
                  onChange={(e) => handleManualMaxChange(e.target.value)}
                  className="text-sm"
                  placeholder={formatCurrency(max)}
                />
              </div>
            </div>
          )}

          {/* Indicadores visuais adicionais */}
          <div className="flex justify-between text-xs">
            <div className="text-muted-foreground">
              {((localValue[0] - min) / (max - min) * 100).toFixed(0)}%
            </div>
            <div className="text-muted-foreground">
              {((localValue[1] - min) / (max - min) * 100).toFixed(0)}%
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Componente específico para multa
interface MultaFilterProps {
  value: [number, number];
  onValueChange: (value: [number, number]) => void;
}

export const MultaFilter: React.FC<MultaFilterProps> = ({
  value,
  onValueChange
}) => {
  return (
    <VivoFinancialRange
      label="Valor da Multa"
      description="Faixa de valor da multa contratual (R$ 0 - R$ 1.000.000)"
      min={0}
      max={1000000}
      step={1000}
      value={value}
      onValueChange={onValueChange}
      currency={true}
      allowManualInput={true}
    />
  );
};

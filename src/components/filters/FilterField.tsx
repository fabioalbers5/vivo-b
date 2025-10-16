import React from 'react';
import { X } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface FilterFieldProps {
  label: string;
  children: React.ReactNode;
  selectedValues?: string[];
  onClear?: () => void;
  helpText?: string;
  className?: string;
  'data-testid'?: string;
}

/**
 * FilterField Component
 * 
 * Componente reutilizável para campos de filtro seguindo o Design System:
 * - Label visível acima do controle
 * - Controle (Select, Combobox, etc.)
 * - Chips/badges mostrando valores selecionados (sempre visíveis)
 * - Botão "Limpar" individual
 * - Acessibilidade completa
 */
const FilterField: React.FC<FilterFieldProps> = ({
  label,
  children,
  selectedValues = [],
  onClear,
  helpText,
  className,
  'data-testid': testId,
}) => {
  const hasSelection = selectedValues.length > 0;

  return (
    <div 
      className={cn("flex flex-col space-y-2", className)}
      data-testid={testId}
    >
      {/* Label com Clear button */}
      <div className="flex items-center justify-between">
        <Label 
          className="text-sm font-medium text-gray-700"
          title={helpText}
        >
          {label}
        </Label>
        
        {hasSelection && onClear && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClear}
            className="h-auto p-0 text-xs text-gray-500 hover:text-red-600 hover:bg-transparent"
            aria-label={`Limpar ${label}`}
            data-testid={`clear-filter-${testId}`}
          >
            <X className="h-3 w-3 mr-1" />
            Limpar
          </Button>
        )}
      </div>

      {/* Controle (Select, Combobox, Input, etc.) */}
      <div className="w-full">
        {children}
      </div>

      {/* Chips para valores selecionados - sempre visíveis */}
      {hasSelection && (
        <div 
          className="flex flex-wrap gap-1.5"
          role="list"
          aria-label={`Valores selecionados para ${label}`}
        >
          {selectedValues.map((value, index) => (
            <Badge
              key={`${value}-${index}`}
              variant="secondary"
              className="text-xs bg-blue-50 text-blue-700 border-blue-200 px-2 py-0.5"
              data-testid={`chip-${testId}-${index}`}
              role="listitem"
            >
              {value}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
};

export default FilterField;

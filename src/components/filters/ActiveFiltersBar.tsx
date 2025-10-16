import React from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export interface ActiveFilter {
  id: string;
  field: string;
  value: string;
  onRemove: () => void;
}

interface ActiveFiltersBarProps {
  filters: ActiveFilter[];
  onClearAll?: () => void;
  className?: string;
}

/**
 * ActiveFiltersBar Component
 * 
 * Barra de resumo compacto que exibe todos os filtros ativos
 * Renderizada entre o container de filtros e a galeria
 * Formato: "Campo: Valor" com X para remover
 */
const ActiveFiltersBar: React.FC<ActiveFiltersBarProps> = ({
  filters,
  onClearAll,
  className,
}) => {
  // Não renderizar se não houver filtros ativos
  if (filters.length === 0) {
    return null;
  }

  return (
    <div 
      className={cn(
        "w-full bg-blue-50/50 border-y border-blue-200 px-6 py-3",
        "flex items-center justify-between gap-3",
        className
      )}
      role="region"
      aria-label="Filtros ativos"
      data-testid="active-filters-bar"
    >
      {/* Chips de filtros ativos */}
      <div className="flex flex-wrap items-center gap-2 flex-1">
        <span className="text-xs font-medium text-gray-600">
          Filtros ativos:
        </span>
        
        {filters.map((filter) => (
          <Badge
            key={filter.id}
            variant="secondary"
            className="text-xs bg-white border border-blue-300 text-gray-700 pl-2.5 pr-1.5 py-1 gap-1.5 hover:bg-gray-50"
            data-testid={`chip-${filter.field}-${filter.value}`}
          >
            <span className="font-medium text-blue-700">{filter.field}:</span>
            <span>{filter.value}</span>
            <button
              onClick={filter.onRemove}
              className="ml-1 rounded-full hover:bg-blue-100 p-0.5 transition-colors"
              aria-label={`Remover filtro ${filter.field}`}
            >
              <X className="h-3 w-3 text-blue-600" />
            </button>
          </Badge>
        ))}
      </div>

      {/* Botão Limpar Todos */}
      {onClearAll && filters.length > 1 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClearAll}
          className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 h-auto py-1.5 px-3"
          data-testid="clear-all-filters"
        >
          <X className="h-3 w-3 mr-1" />
          Limpar todos
        </Button>
      )}
    </div>
  );
};

export default ActiveFiltersBar;

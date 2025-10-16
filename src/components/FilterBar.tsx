import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ChevronUp, Filter, X, Plus } from 'lucide-react';

export interface FilterItem {
  id: string;
  label: string;
  component: React.ReactNode;
  activeCount: number;
  isActive: boolean;
}

interface FilterBarProps {
  filters: FilterItem[];
  onClearAll: () => void;
  onAddFilter?: () => void;
}

const FilterBar = ({ filters, onClearAll, onAddFilter }: FilterBarProps) => {
  const [openFilter, setOpenFilter] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(true); // Expandido por padrão
  
  const activeFiltersCount = filters.reduce((acc, filter) => acc + filter.activeCount, 0);
  
  const handleFilterClick = (filterId: string) => {
    setOpenFilter(openFilter === filterId ? null : filterId);
  };

  return (
    <div className="w-full bg-white border-b border-gray-200 p-3">
      {/* Header da barra de filtros - sempre visível */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center space-x-2 hover:bg-gray-50"
        >
          {isExpanded ? (
            <ChevronUp className="h-4 w-4 text-gray-500" />
          ) : (
            <ChevronDown className="h-4 w-4 text-gray-500" />
          )}
          <Filter className="h-4 w-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">Filtros</span>
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {activeFiltersCount} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </Button>
        
        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearAll}
            className="text-xs text-red-600 hover:text-red-800 hover:bg-red-50"
          >
            <X className="h-3 w-3 mr-1" />
            Limpar todos
          </Button>
        )}
      </div>
      
      {/* Botões dos filtros - colapsável */}
      {isExpanded && (
        <div className="flex gap-2 items-center overflow-x-auto pb-2 pt-3 scrollbar-thin scrollbar-track-gray-100 scrollbar-thumb-gray-300"
             style={{ scrollbarWidth: 'thin' }}>
        {filters.map((filter) => (
          <Popover
            key={filter.id}
            open={openFilter === filter.id}
            onOpenChange={(open) => setOpenFilter(open ? filter.id : null)}
          >
            <PopoverTrigger asChild>
              <Button
                variant={filter.isActive ? "default" : "outline"}
                size="sm"
                className={`
                  relative text-xs h-8 px-3 flex-shrink-0
                  ${filter.isActive 
                    ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                    : 'hover:bg-gray-50'
                  }
                `}
                onClick={() => handleFilterClick(filter.id)}
              >
                <span>{filter.label}</span>
                {filter.activeCount > 0 && (
                  <Badge 
                    variant="secondary" 
                    className={`ml-2 h-4 px-1.5 text-xs ${
                      filter.isActive 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {filter.activeCount}
                  </Badge>
                )}
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>
            </PopoverTrigger>
            
            <PopoverContent 
              className="w-80 p-0" 
              side="bottom" 
              align="start"
              sideOffset={5}
            >
              {filter.component}
            </PopoverContent>
          </Popover>
        ))}
        

        
        {/* Botão para adicionar novos filtros */}
        {onAddFilter && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAddFilter}
            className="text-xs h-8 px-3 flex-shrink-0 border-dashed border-gray-300 hover:border-blue-500 hover:bg-blue-50 hover:text-blue-700"
          >
            <Plus className="h-3 w-3 mr-2" />
            Adicionar Filtro
          </Button>
        )}
      </div>
      )}
    </div>
  );
};

export default FilterBar;
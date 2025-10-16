import React from 'react';
import { cn } from '@/lib/utils';

interface FiltersContainerProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * FiltersContainer
 * 
 * Container para os filtros, colado à galeria de pagamentos
 * Grid responsivo que se adapta ao tamanho da tela
 * Segue tokens de espaçamento do Design System
 */
const FiltersContainer: React.FC<FiltersContainerProps> = ({
  children,
  className,
}) => {
  return (
    <div 
      className={cn(
        "w-full bg-white border-b border-gray-200 px-6 py-4",
        className
      )}
      role="search"
      aria-label="Filtros de pagamentos"
      data-testid="filters-container"
    >
      {/* Grid responsivo: 1 col (mobile) → 2 (tablet) → 3 (desktop) → 4 (XL) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {children}
      </div>
    </div>
  );
};

export default FiltersContainer;

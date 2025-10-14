import React, { useState, useEffect, useMemo } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, X } from 'lucide-react';

interface VivoTextSearchProps {
  label: string;
  description?: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  icon?: React.ReactNode;
  suggestions?: string[];
  allowClear?: boolean;
  searchMode?: 'exact' | 'contains' | 'unaccent';
}

export const VivoTextSearch: React.FC<VivoTextSearchProps> = ({
  label,
  description,
  value,
  onValueChange,
  placeholder = "Digite para pesquisar...",
  icon,
  suggestions = [],
  allowClear = true,
  searchMode = 'unaccent'
}) => {
  const [localValue, setLocalValue] = useState(value);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  // Normalizar texto removendo acentos e caracteres especiais
  const normalizeText = (text: string): string => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove acentos
      .replace(/[çÇ]/g, 'c') // Substitui ç por c
      .replace(/[^\w\s]/g, ''); // Remove caracteres especiais
  };

  // Filtrar sugestões baseado no texto digitado
  const filteredSuggestionsData = useMemo(() => {
    if (!localValue.trim() || suggestions.length === 0) {
      return [];
    }

    const normalizedInput = normalizeText(localValue);
    
    return suggestions
      .filter(suggestion => {
        const normalizedSuggestion = normalizeText(suggestion);
        return normalizedSuggestion.includes(normalizedInput);
      })
      .slice(0, 5); // Limitar a 5 sugestões
  }, [localValue, suggestions]);

  useEffect(() => {
    setFilteredSuggestions(filteredSuggestionsData);
  }, [filteredSuggestionsData]);

  const handleInputChange = (inputValue: string) => {
    setLocalValue(inputValue);
    onValueChange(inputValue);
    setShowSuggestions(inputValue.length > 0 && filteredSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setLocalValue(suggestion);
    onValueChange(suggestion);
    setShowSuggestions(false);
  };

  const handleClear = () => {
    setLocalValue('');
    onValueChange('');
    setShowSuggestions(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  return (
    <div className="space-y-2 relative">
      <div className="flex items-center justify-between">
        <div>
          <Label className="text-sm font-medium">{label}</Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        
        {searchMode === 'unaccent' && (
          <div className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
            busca sem acentos
          </div>
        )}
      </div>

      <div className="relative">
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
              {icon}
            </div>
          )}
          
          <Input
            type="text"
            value={localValue}
            onChange={(e) => handleInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(localValue.length > 0 && filteredSuggestions.length > 0)}
            placeholder={placeholder}
            className={`${icon ? 'pl-10' : ''} ${allowClear && localValue ? 'pr-10' : ''}`}
          />

          {allowClear && localValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Sugestões */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute z-50 w-full mt-1 bg-popover border border-border rounded-md shadow-md max-h-40 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                type="button"
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground first:rounded-t-md last:rounded-b-md"
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Informações sobre a busca */}
      {searchMode === 'unaccent' && localValue && (
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            <span>
              Buscando: "{localValue}" (ignora acentos e caracteres especiais)
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

// Componente específico para município
interface MunicipioFilterProps {
  value: string;
  onValueChange: (value: string) => void;
  suggestions?: string[];
}

export const MunicipioFilter: React.FC<MunicipioFilterProps> = ({
  value,
  onValueChange,
  suggestions = []
}) => {
  // Lista de municípios brasileiros mais comuns (pode ser expandida)
  const defaultSuggestions = [
    'São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Fortaleza',
    'Belo Horizonte', 'Manaus', 'Curitiba', 'Recife', 'Goiânia',
    'Belém', 'Porto Alegre', 'Guarulhos', 'Campinas', 'São Luís',
    'São Gonçalo', 'Maceió', 'Duque de Caxias', 'Campo Grande', 'Natal'
  ];

  const allSuggestions = [...new Set([...suggestions, ...defaultSuggestions])];

  return (
    <VivoTextSearch
      label="Município"
      description="Nome do município do contrato (busca ignora acentos)"
      value={value}
      onValueChange={onValueChange}
      placeholder="Digite o nome do município..."
      icon={<MapPin className="h-4 w-4" />}
      suggestions={allSuggestions}
      allowClear={true}
      searchMode="unaccent"
    />
  );
};

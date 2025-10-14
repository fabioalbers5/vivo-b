import { CustomFilter } from "./CreateFilterModal";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import ValueRangeFilter from "@/components/filters/ValueRangeFilter";
import { useState } from "react";

interface CustomFilterRendererProps {
  filter: CustomFilter;
  value: any;
  onChange: (value: any) => void;
}

const CustomFilterRenderer = ({ filter, value, onChange }: CustomFilterRendererProps) => {
  const [multiSelectOpen, setMultiSelectOpen] = useState(false);
  
  const renderFilterInput = () => {
    switch (filter.type) {
      case 'Input':
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={`Digite ${filter.name.toLowerCase()}`}
          />
        );

      case 'Dropdown':
        return (
          <Select value={value || ''} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder={`Selecione ${filter.name.toLowerCase()}`} />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {filter.options?.map((option) => (
                <SelectItem key={typeof option === 'string' ? option : option.value} value={typeof option === 'string' ? option : option.value}>
                  {typeof option === 'string' ? option : option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );

      case 'Multi-select': {
        const selectedValues = value || [];
        
        return (
          <div className="space-y-2">
            {/* Badges das opções selecionadas - fora do popover trigger */}
            {selectedValues.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {selectedValues.map((val: string) => {
                  const option = filter.options?.find(opt => 
                    (typeof opt === 'string' ? opt : opt.value) === val
                  );
                  const label = typeof option === 'string' ? option : option?.label || val;
                  
                  const handleRemove = (e: React.MouseEvent) => {
                    e.preventDefault();
                    e.stopPropagation();
                    const newValues = selectedValues.filter((v: string) => v !== val);
                    onChange(newValues);
                  };
                  
                  return (
                    <Badge key={val} variant="secondary" className="text-xs flex items-center gap-1">
                      <span>{label}</span>
                      <X 
                        className="h-3 w-3 cursor-pointer hover:text-destructive transition-colors" 
                        onClick={handleRemove}
                      />
                    </Badge>
                  );
                })}
              </div>
            )}
            
            {/* Botão para abrir o seletor */}
            <Popover open={multiSelectOpen} onOpenChange={setMultiSelectOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={multiSelectOpen}
                  className="w-full justify-between min-h-[2.5rem] px-3 py-2"
                >
                  <span className="text-muted-foreground">
                    {selectedValues.length === 0 
                      ? "Selecione opções..." 
                      : `${selectedValues.length} opção(ões) selecionada(s)`
                    }
                  </span>
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
            <PopoverContent className="w-full p-0">
              <Command>
                <CommandInput placeholder="Buscar opções..." />
                <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
                <CommandGroup className="max-h-64 overflow-y-auto">
                  {filter.options?.map((option) => {
                    const optionValue = typeof option === 'string' ? option : option.value;
                    const optionLabel = typeof option === 'string' ? option : option.label;
                    const isSelected = selectedValues.includes(optionValue);
                    
                    return (
                      <CommandItem
                        key={optionValue}
                        value={optionValue}
                        onSelect={() => {
                          if (isSelected) {
                            onChange(selectedValues.filter((v: string) => v !== optionValue));
                          } else {
                            onChange([...selectedValues, optionValue]);
                          }
                        }}
                      >
                        <Check
                          className={`mr-2 h-4 w-4 ${
                            isSelected ? "opacity-100" : "opacity-0"
                          }`}
                        />
                        {optionLabel}
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              </Command>
            </PopoverContent>
          </Popover>
          </div>
        );
      }

      case 'Checkbox':
        return (
          <div className="flex items-center space-x-2">
            <Checkbox
              id={filter.id}
              checked={!!value}
              onCheckedChange={onChange}
            />
            <Label htmlFor={filter.id}>Ativo</Label>
          </div>
        );

      case 'Data':
        return (
          <Input
            type="date"
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
          />
        );

      case 'Intervalo':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Data inicial</Label>
                <Input
                  type="date"
                  value={value?.start || ''}
                  onChange={(e) => onChange({ ...value, start: e.target.value })}
                />
              </div>
              <div>
                <Label className="text-xs">Data final</Label>
                <Input
                  type="date"
                  value={value?.end || ''}
                  onChange={(e) => onChange({ ...value, end: e.target.value })}
                />
              </div>
            </div>
          </div>
        );

      case 'Range': {
        const rangeValue = value || [0, 1000000];
        
        // Para filtros de range (como multa), usar o ValueRangeFilter para consistência
        // O ValueRangeFilter já tem seu próprio título, então não adicionamos aqui
        return (
          <ValueRangeFilter
            title={filter.name}
            min={0}
            max={1000000}
            value={rangeValue}
            onChange={onChange}
          />
        );
      }

      default:
        return (
          <Input
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Valor do filtro"
          />
        );
    }
  };

  return (
    <div className="space-y-2">
      {/* Adicionar título apenas para filtros que não sejam Range */}
      {filter.type !== 'Range' && (
        <Label className="text-sm font-medium">{filter.name}</Label>
      )}
      {renderFilterInput()}
      <p className="text-xs text-muted-foreground">
        Campo: {filter.table}.{filter.field}
      </p>
    </div>
  );
};

export default CustomFilterRenderer;

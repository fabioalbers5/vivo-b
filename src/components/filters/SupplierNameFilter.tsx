import { useState } from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

interface SupplierNameFilterProps {
  value: string[];
  onChange: (value: string[]) => void;
}

// Lista de fornecedores mockados - você pode integrar com seus dados reais
const suppliers = [
  { value: "empresa-a", label: "Empresa A Ltda" },
  { value: "empresa-b", label: "Empresa B S.A." },
  { value: "fornecedor-c", label: "Fornecedor C Indústria" },
  { value: "distribuidor-d", label: "Distribuidor D Comércio" },
  { value: "prestador-e", label: "Prestador E Serviços" },
  { value: "corporacao-f", label: "Corporação F Internacional" },
  { value: "grupo-g", label: "Grupo G Empresarial" },
  { value: "holding-h", label: "Holding H Investimentos" },
  { value: "industria-i", label: "Indústria I Manufatura" },
  { value: "servicos-j", label: "Serviços J Consultoria" },
];

const SupplierNameFilter = ({ value, onChange }: SupplierNameFilterProps) => {
  const [open, setOpen] = useState(false);

  const handleToggle = (supplierValue: string) => {
    if (value.includes(supplierValue)) {
      onChange(value.filter(v => v !== supplierValue));
    } else {
      onChange([...value, supplierValue]);
    }
  };

  const handleRemove = (supplierValue: string) => {
    onChange(value.filter(v => v !== supplierValue));
  };

  return (
    <div className="space-y-2">
      {/* Selected suppliers display */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1 max-h-12 overflow-y-auto">
          {value.map((supplierValue) => {
            const supplier = suppliers.find(s => s.value === supplierValue);
            const displayName = supplier?.value || supplierValue;
            return (
              <Badge key={supplierValue} variant="secondary" className="text-xs py-0 px-1">
                {displayName}
                <button
                  className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleRemove(supplierValue);
                    }
                  }}
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onClick={() => handleRemove(supplierValue)}
                >
                  <X className="h-2 w-2 text-muted-foreground hover:text-foreground" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            {value.length === 0
              ? "Selecione fornecedores..."
              : `${value.length} fornecedor(es) selecionado(s)`}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar fornecedor..." />
            <CommandList>
              <CommandEmpty>Nenhum fornecedor encontrado.</CommandEmpty>
              <CommandGroup>
                {suppliers.map((supplier) => (
                  <CommandItem
                    key={supplier.value}
                    value={supplier.value}
                    onSelect={() => handleToggle(supplier.value)}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value.includes(supplier.value) ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {supplier.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SupplierNameFilter;
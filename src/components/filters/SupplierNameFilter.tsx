import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

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
  const handleToggle = (supplierValue: string) => {
    if (value.includes(supplierValue)) {
      onChange(value.filter(v => v !== supplierValue));
    } else {
      onChange([...value, supplierValue]);
    }
  };

  return (
    <Command className="border rounded-md">
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
  );
};

export default SupplierNameFilter;
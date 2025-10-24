import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { ChevronsUpDown } from "lucide-react";

interface SupplierFilterProps {
  supplierName: string;
  contractNumber: string;
  onSupplierNameChange: (value: string) => void;
  onContractNumberChange: (value: string) => void;
}

const SupplierFilter = ({ 
  supplierName, 
  contractNumber, 
  onSupplierNameChange, 
  onContractNumberChange 
}: SupplierFilterProps) => {
  const [open, setOpen] = useState(false);

  const getDisplayText = () => {
    const parts: string[] = [];
    if (supplierName) parts.push(`Fornecedor: ${supplierName}`);
    if (contractNumber) parts.push(`Contrato: ${contractNumber}`);
    
    if (parts.length === 0) return "Buscar Fornecedor/Contrato";
    return parts.join(" | ");
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700">
        Fornecedor/Contrato
      </label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left"
          >
            <span className="truncate">{getDisplayText()}</span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[320px] p-4" align="start">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Nome do Fornecedor
              </label>
              <Input
                id="supplier-name"
                value={supplierName}
                onChange={(e) => onSupplierNameChange(e.target.value)}
                placeholder="Digite o nome do fornecedor"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                Número do Contrato
              </label>
              <Input
                id="contract-number"
                value={contractNumber}
                onChange={(e) => onContractNumberChange(e.target.value)}
                placeholder="Digite o número do contrato"
              />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default SupplierFilter;

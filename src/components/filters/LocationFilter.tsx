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

// Lista completa dos estados brasileiros organizados por região
const brazilianStates = [
  // Norte
  { value: "AC", label: "AC - Acre", region: "Norte" },
  { value: "AP", label: "AP - Amapá", region: "Norte" },
  { value: "AM", label: "AM - Amazonas", region: "Norte" },
  { value: "PA", label: "PA - Pará", region: "Norte" },
  { value: "RO", label: "RO - Rondônia", region: "Norte" },
  { value: "RR", label: "RR - Roraima", region: "Norte" },
  { value: "TO", label: "TO - Tocantins", region: "Norte" },
  
  // Nordeste
  { value: "AL", label: "AL - Alagoas", region: "Nordeste" },
  { value: "BA", label: "BA - Bahia", region: "Nordeste" },
  { value: "CE", label: "CE - Ceará", region: "Nordeste" },
  { value: "MA", label: "MA - Maranhão", region: "Nordeste" },
  { value: "PB", label: "PB - Paraíba", region: "Nordeste" },
  { value: "PE", label: "PE - Pernambuco", region: "Nordeste" },
  { value: "PI", label: "PI - Piauí", region: "Nordeste" },
  { value: "RN", label: "RN - Rio Grande do Norte", region: "Nordeste" },
  { value: "SE", label: "SE - Sergipe", region: "Nordeste" },
  
  // Centro-Oeste
  { value: "DF", label: "DF - Distrito Federal", region: "Centro-Oeste" },
  { value: "GO", label: "GO - Goiás", region: "Centro-Oeste" },
  { value: "MT", label: "MT - Mato Grosso", region: "Centro-Oeste" },
  { value: "MS", label: "MS - Mato Grosso do Sul", region: "Centro-Oeste" },
  
  // Sudeste
  { value: "ES", label: "ES - Espírito Santo", region: "Sudeste" },
  { value: "MG", label: "MG - Minas Gerais", region: "Sudeste" },
  { value: "RJ", label: "RJ - Rio de Janeiro", region: "Sudeste" },
  { value: "SP", label: "SP - São Paulo", region: "Sudeste" },
  
  // Sul
  { value: "PR", label: "PR - Paraná", region: "Sul" },
  { value: "RS", label: "RS - Rio Grande do Sul", region: "Sul" },
  { value: "SC", label: "SC - Santa Catarina", region: "Sul" },
];

interface LocationFilterProps {
  selectedStates: string[];
  onStatesChange: (states: string[]) => void;
}

const LocationFilter = ({ selectedStates, onStatesChange }: LocationFilterProps) => {
  const handleToggle = (stateValue: string) => {
    if (selectedStates.includes(stateValue)) {
      onStatesChange(selectedStates.filter(s => s !== stateValue));
    } else {
      onStatesChange([...selectedStates, stateValue]);
    }
  };

  // Agrupar estados por região para melhor organização
  const statesByRegion = brazilianStates.reduce((acc, state) => {
    if (!acc[state.region]) {
      acc[state.region] = [];
    }
    acc[state.region].push(state);
    return acc;
  }, {} as Record<string, typeof brazilianStates>);

  return (
    <Command className="border rounded-md">
      <CommandInput placeholder="Buscar estado..." />
      <CommandList>
        <CommandEmpty>Nenhum estado encontrado.</CommandEmpty>
        
        {Object.entries(statesByRegion).map(([region, states]) => (
          <CommandGroup key={region} heading={region}>
            {states.map((state) => (
              <CommandItem
                key={state.value}
                value={state.value}
                onSelect={() => handleToggle(state.value)}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedStates.includes(state.value) ? "opacity-100" : "opacity-0"
                  )}
                />
                {state.label}
              </CommandItem>
            ))}
          </CommandGroup>
        ))}
      </CommandList>
    </Command>
  );
};

export default LocationFilter;

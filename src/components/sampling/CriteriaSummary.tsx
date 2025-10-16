import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Info, TrendingUp, Users, Sliders } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { SamplingMotor } from './MotorSelector';

interface CriteriaSummaryProps {
  selectedMotor: SamplingMotor;
  sampleSize: number;
  targetDate?: string;
  activeFiltersCount?: number;
}

const CriteriaSummary: React.FC<CriteriaSummaryProps> = ({
  selectedMotor,
  sampleSize,
  targetDate,
  activeFiltersCount = 0
}) => {
  const [open, setOpen] = useState(false);

  const getMotorInfo = () => {
    switch (selectedMotor) {
      case 'highest-value':
        return {
          icon: TrendingUp,
          label: 'Maior Valor',
          description: 'Seleciona os pagamentos de maior valor, garantindo apenas um pagamento por fornecedor.',
          details: [
            'Agrupa pagamentos por fornecedor e mantém apenas o de maior valor',
            'Ordena os fornecedores por valor decrescente',
            'Seleciona os N fornecedores com maiores pagamentos (sem duplicatas)',
            'Ideal para auditar pagamentos de alto impacto financeiro sem sobreposição'
          ]
        };
      case 'top-suppliers':
        return {
          icon: Users,
          label: 'Top Fornecedores do Dia',
          description: 'Identifica os fornecedores com maiores valores no dia selecionado e inclui todos os seus contratos.',
          details: [
            'Agrupa pagamentos por fornecedor na data selecionada',
            'Calcula o valor total por fornecedor',
            'Seleciona todos os contratos dos N fornecedores com maior valor agregado',
            'Útil para análise focada em fornecedores críticos'
          ]
        };
      case 'custom':
        return {
          icon: Sliders,
          label: 'Personalizado',
          description: 'Permite definir critérios específicos através dos filtros disponíveis.',
          details: [
            'Use os filtros no topo para refinar os contratos',
            'Combine múltiplos critérios (tipo de fluxo, data, valor, etc.)',
            'A amostra será gerada aleatoriamente dentro do conjunto filtrado',
            'Máxima flexibilidade para cenários específicos'
          ]
        };
    }
  };

  const motorInfo = getMotorInfo();
  const Icon = motorInfo.icon;

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('pt-BR');
  };

  return (
    <div className="bg-blue-50/50 border border-blue-200 rounded-lg p-3 mb-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4 text-vivo-purple" />
            <span className="text-sm font-medium text-gray-700">Critérios aplicados:</span>
          </div>

          <Badge variant="outline" className="bg-white border-vivo-purple/30 text-vivo-purple">
            Motor: {motorInfo.label}
          </Badge>

          <Badge variant="outline" className="bg-white border-blue-300 text-blue-700">
            Amostra: {sampleSize} pagamento{sampleSize !== 1 ? 's' : ''}
          </Badge>

          {selectedMotor === 'top-suppliers' && targetDate && (
            <Badge variant="outline" className="bg-white border-green-300 text-green-700">
              Data: {formatDate(targetDate)}
            </Badge>
          )}

          {selectedMotor === 'custom' && activeFiltersCount > 0 && (
            <Badge variant="outline" className="bg-white border-orange-300 text-orange-700">
              {activeFiltersCount} filtro{activeFiltersCount !== 1 ? 's' : ''} ativo{activeFiltersCount !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>

        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100"
            >
              <Info className="h-3.5 w-3.5 mr-1" />
              Entenda os critérios
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-96" align="end">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-900 flex items-center gap-2 mb-2">
                  <Icon className="h-4 w-4 text-vivo-purple" />
                  {motorInfo.label}
                </h4>
                <p className="text-sm text-gray-600">
                  {motorInfo.description}
                </p>
              </div>

              <div className="border-t pt-3">
                <h5 className="text-xs font-medium text-gray-700 mb-2">Como funciona:</h5>
                <ul className="space-y-1.5">
                  {motorInfo.details.map((detail, index) => (
                    <li key={index} className="text-xs text-gray-600 flex items-start gap-2">
                      <span className="text-vivo-purple mt-0.5">•</span>
                      <span>{detail}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </div>
  );
};

export default CriteriaSummary;

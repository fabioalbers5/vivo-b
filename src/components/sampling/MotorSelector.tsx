import React from 'react';
import { TrendingUp, Users, Sliders } from 'lucide-react';

export type SamplingMotor = 'highest-value' | 'top-suppliers' | 'custom';

interface MotorSelectorProps {
  selectedMotor: SamplingMotor;
  onMotorChange: (motor: SamplingMotor) => void;
}

const MotorSelector: React.FC<MotorSelectorProps> = ({ selectedMotor, onMotorChange }) => {
  const motors = [
    {
      id: 'highest-value' as SamplingMotor,
      label: 'Maior Valor',
      icon: TrendingUp,
      description: 'Seleciona contratos com maiores valores de pagamento'
    },
    {
      id: 'top-suppliers' as SamplingMotor,
      label: 'Top Fornecedores do Dia',
      icon: Users,
      description: 'Seleciona todos os contratos dos fornecedores com maiores valores do dia'
    },
    {
      id: 'custom' as SamplingMotor,
      label: 'Personalizado',
      icon: Sliders,
      description: 'Permite aplicar filtros personalizados'
    }
  ];

  return (
    <div className="bg-white border-b border-gray-200 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-2">
          <h3 className="text-sm font-medium text-gray-700">Motor de Amostragem</h3>
        </div>
        
        <div className="inline-flex rounded-lg border border-gray-200 bg-gray-50 p-1">
          {motors.map((motor) => {
            const Icon = motor.icon;
            const isSelected = selectedMotor === motor.id;
            
            return (
              <button
                key={motor.id}
                onClick={() => onMotorChange(motor.id)}
                className={`
                  inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md
                  transition-all duration-200
                  ${isSelected
                    ? 'bg-vivo-purple text-white shadow-sm'
                    : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  }
                `}
                title={motor.description}
              >
                <Icon className="h-4 w-4" />
                <span>{motor.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MotorSelector;

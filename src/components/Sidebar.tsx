import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Database, BarChart3, Settings, HelpCircle, Menu, ChevronLeft, Home, PieChart } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const menuItems = [
    {
      id: 'home',
      label: 'Home page',
      icon: Home,
      description: 'Página inicial do sistema'
    },
    {
      id: 'sample-selection',
      label: 'Seleção de amostra',
      icon: Database,
      description: 'Filtrar e visualizar contratos'
    },
    {
      id: 'sample-analysis',
      label: 'Análise da amostra',
      icon: BarChart3,
      description: 'Dashboards e métricas da amostra'
    },
    {
      id: 'quality-dashboard',
      label: 'Dashboards de qualidade',
      icon: PieChart,
      description: 'Análise de qualidade e compliance'
    }
  ];

  return (
    <div className="relative h-full">
      {/* Sidebar colapsada (barra estreita) */}
      <Card className={`${isExpanded ? 'w-64' : 'w-12'} h-full border-r bg-muted/10 transition-all duration-300 ease-in-out rounded-tl-none rounded-bl-lg rounded-tr-lg rounded-br-lg`}>
        {/* Botão toggle */}
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="sm"
            className="w-full h-8 p-0 hover:bg-muted/50"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <Menu className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className={`${isExpanded ? 'p-4' : 'p-2'} transition-all duration-300`}>
          {/* Menu Principal */}
          <div className="space-y-2">
            {isExpanded && (
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                ANÁLISE
              </h3>
            )}
            
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              
              return (
                <Button
                  key={item.id}
                  variant={isActive ? "default" : "ghost"}
                  className={`w-full ${isExpanded ? 'justify-start h-10 px-3' : 'justify-center h-10 p-2'} ${
                    isActive 
                      ? "bg-vivo-purple hover:bg-vivo-purple/90 text-white" 
                      : "hover:bg-muted/50"
                  } transition-all duration-300`}
                  onClick={() => onPageChange(item.id)}
                  title={!isExpanded ? item.label : undefined}
                >
                  {isExpanded ? (
                    <div className="flex items-center gap-3 w-full">
                      <Icon className={`h-4 w-4 flex-shrink-0 ${
                        isActive ? "text-white" : "text-muted-foreground"
                      }`} />
                      <div className={`text-sm font-medium ${
                        isActive ? "text-white" : "text-foreground"
                      }`}>
                        {item.label}
                      </div>
                    </div>
                  ) : (
                    <Icon className={`h-5 w-5 ${
                      isActive ? "text-white" : "text-muted-foreground"
                    }`} />
                  )}
                </Button>
              );
            })}
          </div>

          {isExpanded && <Separator className="my-6" />}

          {/* Menu Secundário */}
          <div className="space-y-2">
            {isExpanded && (
              <h3 className="text-sm font-medium text-muted-foreground mb-2">
                CONFIGURAÇÕES
              </h3>
            )}
            
            <Button
              variant={activePage === 'criteria-selection' ? "default" : "ghost"}
              className={`w-full ${isExpanded ? 'justify-start h-10 px-3' : 'justify-center h-10 p-2'} ${
                activePage === 'criteria-selection'
                  ? "bg-vivo-purple hover:bg-vivo-purple/90 text-white" 
                  : "hover:bg-muted/50"
              } transition-all duration-300`}
              onClick={() => onPageChange('criteria-selection')}
              title={!isExpanded ? "Configurações" : undefined}
            >
              {isExpanded ? (
                <div className="flex items-center gap-3 w-full">
                  <Settings className={`h-4 w-4 flex-shrink-0 ${
                    activePage === 'criteria-selection' ? "text-white" : "text-muted-foreground"
                  }`} />
                  <div className={`text-sm font-medium ${
                    activePage === 'criteria-selection' ? "text-white" : "text-foreground"
                  }`}>
                    Configurações
                  </div>
                </div>
              ) : (
                <Settings className={`h-5 w-5 ${
                  activePage === 'criteria-selection' ? "text-white" : "text-muted-foreground"
                }`} />
              )}
            </Button>

            <Button
              variant="ghost"
              className={`w-full ${isExpanded ? 'justify-start h-10 px-3' : 'justify-center h-10 p-2'} hover:bg-muted/50 transition-all duration-300`}
              disabled
              title={!isExpanded ? "Ajuda" : undefined}
            >
              {isExpanded ? (
                <div className="flex items-center gap-3 w-full">
                  <HelpCircle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  <div className="text-sm font-medium text-muted-foreground">
                    Ajuda
                  </div>
                </div>
              ) : (
                <HelpCircle className="h-5 w-5 text-muted-foreground" />
              )}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Sidebar;

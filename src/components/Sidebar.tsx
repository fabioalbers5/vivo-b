import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Database, BarChart3, Settings, HelpCircle } from 'lucide-react';

interface SidebarProps {
  activePage: string;
  onPageChange: (page: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePage, onPageChange }) => {
  const menuItems = [
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
      icon: Settings,
      description: 'Análise de qualidade e compliance'
    }
  ];

  return (
    <Card className="w-64 h-full border-r bg-muted/10">
      <div className="p-4">
        {/* Logo/Header */}
        {/* <div className="mb-6">
          <h2 className="text-lg font-semibold text-vivo-purple">
            Vivo Contract Insight
          </h2>
          <p className="text-xs text-muted-foreground">
            Sistema de análise de contratos
          </p>
        </div>

        <Separator className="mb-4" /> */}

        {/* Menu Principal */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            ANÁLISE
          </h3>
          
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activePage === item.id;
            
            return (
              <Button
                key={item.id}
                variant={isActive ? "default" : "ghost"}
                className={`w-full justify-start h-auto p-3 ${
                  isActive 
                    ? "bg-vivo-purple hover:bg-vivo-purple/90 text-white" 
                    : "hover:bg-muted/50"
                }`}
                onClick={() => onPageChange(item.id)}
              >
                <div className="flex items-start gap-3 w-full">
                  <Icon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${
                    isActive ? "text-white" : "text-muted-foreground"
                  }`} />
                  <div className="text-left flex-1">
                    <div className={`text-sm font-medium ${
                      isActive ? "text-white" : "text-foreground"
                    }`}>
                      {item.label}
                    </div>
                    <div className={`text-xs ${
                      isActive ? "text-white/80" : "text-muted-foreground"
                    }`}>
                      {item.description}
                    </div>
                  </div>
                </div>
              </Button>
            );
          })}
        </div>

        <Separator className="my-6" />

        {/* Menu Secundário (futuro) */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">
            CONFIGURAÇÕES
          </h3>
          
          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-muted/50"
            disabled
          >
            <div className="flex items-start gap-3 w-full">
              <Settings className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Configurações
                </div>
                <div className="text-xs text-muted-foreground">
                  Em breve
                </div>
              </div>
            </div>
          </Button>

          <Button
            variant="ghost"
            className="w-full justify-start h-auto p-3 hover:bg-muted/50"
            disabled
          >
            <div className="flex items-start gap-3 w-full">
              <HelpCircle className="h-5 w-5 mt-0.5 flex-shrink-0 text-muted-foreground" />
              <div className="text-left flex-1">
                <div className="text-sm font-medium text-muted-foreground">
                  Ajuda
                </div>
                <div className="text-xs text-muted-foreground">
                  Em breve
                </div>
              </div>
            </div>
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default Sidebar;

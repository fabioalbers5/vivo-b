import { Button } from "@/components/ui/button";
import { FileDown, Settings, User } from "lucide-react";

const Header = () => {
  const handleExportReport = () => {
    // Funcionalidade de exportar relatório
    alert('Funcionalidade de exportar relatório será implementada em breve!');
  };

  const handleOpenSettings = () => {
    // Funcionalidade de configurações
    alert('Painel de configurações será implementado em breve!');
  };

  return (
    <header className="w-full bg-background border-b border-border px-2 py-1">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-1 ml-3">
          <img 
            src="/lovable-uploads/faf482cf-0e05-4306-ba2a-3839f9734cb2.png" 
            alt="Vivo Logo" 
            className="h-4"
          />
          <div>
            <h1 className="text-base font-bold text-vivo-purple leading-tight ml-3">
              Verificação Inteligente de Pagamentos
            </h1>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 mr-3">
          <div className="flex items-center space-x-2 ml-2">
            <span className="text-xs text-muted-foreground">Olá, Fábio</span>
            <div className="w-6 h-6 bg-vivo-purple rounded-full flex items-center justify-center">
              <User className="h-3 w-3 text-white" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

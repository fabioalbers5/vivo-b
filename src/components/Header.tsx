import { Button } from "@/components/ui/button";
import { FileDown, Settings } from "lucide-react";

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
    <header className="w-full bg-background border-b border-border px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <img 
            src="/lovable-uploads/faf482cf-0e05-4306-ba2a-3839f9734cb2.png" 
            alt="Vivo Logo" 
            className="h-8"
          />
          <div>
            <h1 className="text-xl font-bold text-vivo-purple">
              Verificação Inteligente de Pagamentos
            </h1>
            <p className="text-sm text-muted-foreground">
              Sistema de análise e auditoria de contratos
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <Button 
            variant="outline" 
            size="sm" 
            className="text-vivo-purple border-vivo-purple hover:bg-vivo-purple hover:text-white"
            onClick={handleExportReport}
          >
            <FileDown className="h-4 w-4 mr-2" />
            Exportar Relatório
          </Button>
          <Button size="sm" onClick={handleOpenSettings}>
            <Settings className="h-4 w-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;

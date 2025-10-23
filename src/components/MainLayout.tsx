import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { Chatbot } from './Chatbot';
import SampleSelectionPage from '@/pages/SampleSelectionPage';
import SampleAnalysisPage from '@/pages/SampleAnalysisPage';
import QualityDashboardPage from '@/pages/QualityDashboardPage';
import DocumentUploadPage from '@/pages/DocumentUploadPage';
import LogsPage from '@/pages/LogsPage';
import { SampleProvider } from '@/contexts/SampleContext';
import { Database, BarChart3, FileText, ClipboardList } from 'lucide-react';

const MainLayout: React.FC = () => {
  const [activePage, setActivePage] = useState('home');
  const navigate = useNavigate();

  // Função para lidar com mudança de página
  const handlePageChange = (page: string) => {
    if (page === 'home') {
      setActivePage('home');
    } else {
      setActivePage(page);
    }
  };

  const renderContent = () => {
    switch (activePage) {
      case 'home':
        return (
          <div 
            className="h-full w-full bg-center bg-no-repeat relative"
            style={{
              backgroundImage: 'url(/vivo-home-bg.jpg)',
              backgroundColor: '#fff',
              backgroundSize: '85%' // ALTERE AQUI: 50% (menor) a 100% (maior) ou use 'contain' ou 'cover'
            }}
          >

          </div>
        );
      case 'sample-selection':
        return <SampleSelectionPage />;
      case 'sample-analysis':
        return <SampleAnalysisPage />;
      case 'quality-dashboard':
        return <QualityDashboardPage />;
      case 'document-upload':
        return <DocumentUploadPage />;
      case 'logs':
        return <LogsPage />;
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <h2 className="text-2xl font-semibold text-muted-foreground mb-2">
                Página não encontrada
              </h2>
              <p className="text-muted-foreground">
                A página solicitada não foi implementada ainda.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <SampleProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header Principal */}
        <Header />
        
        {/* Conteúdo com Sidebar */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar */}
          <div className="flex-shrink-0">
            <Sidebar activePage={activePage} onPageChange={handlePageChange} />
          </div>
          
          {/* Área de conteúdo principal */}
          <div className="flex-1 overflow-hidden">
            <div className="h-full overflow-auto">
              {renderContent()}
            </div>
          </div>
        </div>

        {/* Chatbot - aparece em todas as telas dentro do MainLayout */}
        <Chatbot />
      </div>
    </SampleProvider>
  );
};

export default MainLayout;


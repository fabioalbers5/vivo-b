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
            className="h-full w-full bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1920 1080'%3E%3Cdefs%3E%3CradialGradient id='grad1' cx='65%25' cy='45%25' r='50%25'%3E%3Cstop offset='0%25' style='stop-color:%238B5CF6;stop-opacity:0.3' /%3E%3Cstop offset='100%25' style='stop-color:%238B5CF6;stop-opacity:0' /%3E%3C/radialGradient%3E%3C/defs%3E%3Crect width='1920' height='1080' fill='%238B5CF6'/%3E%3Cellipse cx='1250' cy='500' rx='400' ry='400' fill='url(%23grad1)'/%3E%3Cpath d='M 1050 300 Q 1100 200 1200 250 T 1350 350 Q 1300 450 1200 400 T 1050 300 Z' fill='none' stroke='%23FFFFFF' stroke-width='2' opacity='0.3'/%3E%3Cpath d='M 1070 320 Q 1120 220 1220 270 T 1370 370 Q 1320 470 1220 420 T 1070 320 Z' fill='none' stroke='%23FFFFFF' stroke-width='2' opacity='0.25'/%3E%3Cpath d='M 1090 340 Q 1140 240 1240 290 T 1390 390 Q 1340 490 1240 440 T 1090 340 Z' fill='none' stroke='%23FFFFFF' stroke-width='2' opacity='0.2'/%3E%3Cpath d='M 1110 360 Q 1160 260 1260 310 T 1410 410 Q 1360 510 1260 460 T 1110 360 Z' fill='none' stroke='%23FFFFFF' stroke-width='2' opacity='0.15'/%3E%3Cpath d='M 1130 380 Q 1180 280 1280 330 T 1430 430 Q 1380 530 1280 480 T 1130 380 Z' fill='none' stroke='%23FFFFFF' stroke-width='2' opacity='0.1'/%3E%3Ctext x='100' y='150' font-family='Arial, sans-serif' font-size='80' font-weight='bold' fill='%23FFFFFF'%3Evivo%3C/text%3E%3C/svg%3E")`
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


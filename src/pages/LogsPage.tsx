import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { FileText } from 'lucide-react';

const LogsPage: React.FC = () => {
  return (
    <div className="p-6 space-y-6 bg-background min-h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <FileText className="h-8 w-8 text-vivo-purple" />
            Logs
          </h1>
          <p className="text-muted-foreground mt-2">
            Visualize e monitore os logs do sistema
          </p>
        </div>
      </div>

      {/* Content */}
      <Card className="border-vivo-purple/20">
        <CardHeader>
          <CardTitle className="text-vivo-purple flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Registros do Sistema
          </CardTitle>
          <CardDescription>
            Acompanhe todas as atividades e eventos do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              A funcionalidade de logs será implementada em breve.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsPage;

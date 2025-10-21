import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, Plus, X, FileText, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DocumentItem {
  id: string;
  file: File | null;
  fileName: string;
  customFileName: string;
  documentType: string;
}

const DocumentUploadPage = () => {
  const { toast } = useToast();
  const [documents, setDocuments] = useState<DocumentItem[]>([
    { id: '1', file: null, fileName: '', customFileName: '', documentType: '' }
  ]);

  const documentTypes = [
    "Nota fiscal",
    "Memória de cálculo",
    "Contrato",
    "Cláusula adicional",
    "Demais documentos"
  ];

  const handleFileSelect = (id: string, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setDocuments(documents.map(doc => 
        doc.id === id ? { ...doc, file, fileName: file.name, customFileName: doc.customFileName || file.name.split('.')[0] } : doc
      ));
    }
  };

  const handleCustomFileNameChange = (id: string, value: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, customFileName: value } : doc
    ));
  };

  const handleDocumentTypeChange = (id: string, value: string) => {
    setDocuments(documents.map(doc => 
      doc.id === id ? { ...doc, documentType: value } : doc
    ));
  };

  const handleAddDocument = () => {
    const newId = String(documents.length + 1);
    setDocuments([...documents, { id: newId, file: null, fileName: '', customFileName: '', documentType: '' }]);
  };

  const handleRemoveDocument = (id: string) => {
    if (documents.length > 1) {
      setDocuments(documents.filter(doc => doc.id !== id));
    } else {
      toast({
        title: "Atenção",
        description: "É necessário manter pelo menos um documento.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = () => {
    // Validar se todos os documentos têm arquivo, nome e tipo selecionado
    const hasEmptyFields = documents.some(doc => !doc.file || !doc.customFileName.trim() || !doc.documentType);
    
    if (hasEmptyFields) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, selecione o arquivo, digite o nome e escolha o tipo de documento para todos os itens.",
        variant: "destructive",
      });
      return;
    }

    // Aqui você implementaria a lógica de upload real
    console.log('Documentos para enviar:', documents);
    
    toast({
      title: "Sucesso!",
      description: `${documents.length} documento(s) enviado(s) com sucesso.`,
    });

    // Reset do formulário
    setDocuments([{ id: '1', file: null, fileName: '', customFileName: '', documentType: '' }]);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header Simplificado */}
      <header className="border-b bg-background shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <img 
              src="/lovable-uploads/faf482cf-0e05-4306-ba2a-3839f9734cb2.png" 
              alt="Vivo Logo" 
              className="h-8"
            />
            <div className="text-right">
              <h1 className="text-2xl font-bold text-vivo-purple">Upload de Documentação</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Faça o upload dos documentos necessários para análise do pagamento
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Conteúdo Principal */}
      <div className="flex-1 bg-background overflow-auto">
        <div className="container mx-auto p-6 max-w-5xl">

          <Card className="border-border">
            <CardHeader className="border-b bg-muted/30">
              <CardTitle className="flex items-center gap-2 text-foreground">
                <FileText className="h-5 w-5 text-vivo-purple" />
                Documentos para Upload
              </CardTitle>
              <CardDescription>
                Selecione os arquivos, defina um nome e identifique o tipo de cada documento
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <Card 
                    key={doc.id} 
                    className="border-border bg-card hover:border-vivo-purple/50 transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-2">
                          <div className="h-8 w-8 rounded-full bg-vivo-purple/10 flex items-center justify-center">
                            <span className="text-sm font-semibold text-vivo-purple">{index + 1}</span>
                          </div>
                          <h3 className="text-sm font-semibold text-foreground">
                            Documento {index + 1}
                          </h3>
                        </div>
                        {documents.length > 1 && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveDocument(doc.id)}
                            className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Seletor de Arquivo */}
                        <div className="space-y-2">
                          <Label htmlFor={`file-${doc.id}`} className="text-sm font-medium">
                            Arquivo *
                          </Label>
                          <div className="relative">
                            <Input
                              id={`file-${doc.id}`}
                              type="file"
                              onChange={(e) => handleFileSelect(doc.id, e)}
                              className="cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-vivo-purple/10 file:text-vivo-purple hover:file:bg-vivo-purple/20"
                              accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            />
                          </div>
                          {doc.fileName && (
                            <p className="text-xs text-green-600 flex items-center gap-1">
                              <Upload className="h-3 w-3" />
                              Arquivo original: {doc.fileName}
                            </p>
                          )}
                        </div>

                        {/* Nome do Documento */}
                        <div className="space-y-2">
                          <Label htmlFor={`name-${doc.id}`} className="text-sm font-medium">
                            Nome do Documento *
                          </Label>
                          <Input
                            id={`name-${doc.id}`}
                            type="text"
                            value={doc.customFileName}
                            onChange={(e) => handleCustomFileNameChange(doc.id, e.target.value)}
                            placeholder="Digite o nome do documento"
                            className="w-full"
                          />
                        </div>

                        {/* Tipo de Documento */}
                        <div className="space-y-2">
                          <Label htmlFor={`type-${doc.id}`} className="text-sm font-medium">
                            Tipo de Documento *
                          </Label>
                          <Select
                            value={doc.documentType}
                            onValueChange={(value) => handleDocumentTypeChange(doc.id, value)}
                          >
                            <SelectTrigger id={`type-${doc.id}`} className="w-full">
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                            <SelectContent>
                              {documentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Botão Adicionar Novo Documento */}
              <div className="mt-6">
                <Button
                  variant="outline"
                  onClick={handleAddDocument}
                  className="w-full border-dashed border-2 hover:border-vivo-purple hover:bg-vivo-purple/5 hover:text-vivo-purple"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar Novo Documento
                </Button>
              </div>

              {/* Botão Enviar */}
              <div className="mt-6 pt-6 border-t">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-vivo-purple hover:bg-vivo-purple/90 text-white font-semibold py-3 text-base"
                  size="lg"
                >
                  <Send className="h-5 w-5 mr-2" />
                  Enviar Documentação
                </Button>
                <p className="text-xs text-muted-foreground text-center mt-3">
                  * Campos obrigatórios
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Informações Adicionais */}
          <Card className="mt-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20 dark:border-blue-900">
            <CardContent className="p-4">
              <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">Instruções</h4>
              <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
                <li>• Formatos aceitos: PDF, DOC, DOCX, JPG, PNG</li>
                <li>• Tamanho máximo por arquivo: 10MB</li>
                <li>• Certifique-se de que os documentos estão legíveis</li>
                <li>• Você pode adicionar quantos documentos forem necessários</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DocumentUploadPage;

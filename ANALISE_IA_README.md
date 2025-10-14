# Modal de Análise de IA - Documentação

## Visão Geral

O Modal de Análise de IA foi implementado para exibir os resultados detalhados da análise automatizada de contratos por Inteligência Artificial. O modal é acionado através do botão "Ver análise de IA" (ícone Brain) na tabela de contratos.

## Funcionalidades Implementadas

### 1. **Campos de Análise**
O modal apresenta os seguintes campos conforme solicitado:

- **Fornecedor** - Nome da empresa fornecedora
- **CNPJ** - Número do CNPJ do fornecedor
- **Nº Doc SAP** - Número do documento no sistema SAP
- **Tipo de Doc** - Tipo do documento contratual
- **Enquadramento da Normativa** - Categoria segundo a normativa aplicável
- **Objeto Contratual** - Descrição detalhada do objeto do contrato
- **Vigência** - Período de validade do contrato
- **Reajuste** - Forma de reajuste contratual
- **Índice de reajuste** - Índice utilizado para reajuste
- **Valor** - Valor total do contrato
- **Condição de pagamento** - Condições e prazos de pagamento
- **Está de acordo com a normativa NCCP03?** - Status de conformidade
- **Ciclo de Tesouraria** - Tempo do ciclo de tesouraria
- **Cláusula anticorrupção** - Presença e localização da cláusula
- **Redir** - Aplicabilidade do sistema Redir
- **Nota adicional** - Observações adicionais da análise

### 2. **Indicadores Visuais**
- **Ícones de Status**: Cada campo possui um ícone indicativo:
  - ✅ Verde: Conforme com a normativa
  - ❌ Vermelho: Não conforme
  - ⚠️ Amarelo: Requer atenção
  - ℹ️ Azul: Informativo/neutro

- **Badges de Status**: Classificação visual do status de conformidade

### 3. **Evidências**
- **Botão "Ver Evidência"**: Cada campo possui um botão com ícone de olho (👁️)
- **Modal de Evidência**: Ao clicar, abre um sub-modal que mostrará:
  - Captura/print da seção do contrato onde o campo foi identificado
  - Opção para download da evidência
  - Visualização em tela cheia com scroll

### 4. **Resumo da Análise**
- **Painel de Resumo**: Mostra estatísticas consolidadas:
  - Número de itens conformes
  - Número de itens não conformes  
  - Score geral de conformidade (%)

### 5. **Funcionalidades do Modal**
- **Responsivo**: Adapta-se ao tamanho da tela
- **Scroll**: Barra de rolagem quando o conteúdo excede a altura da tela
- **Limite de Visualização**: Máximo de 90% da altura da tela
- **Controles**: Botões para fechar e gerar relatório PDF

## Como Usar

### 1. **Abertura do Modal**
```typescript
// Na tabela de contratos, clique no botão com ícone Brain
<Button onClick={() => onAnalyzeContract(contractId)}>
  <Brain className="h-4 w-4" />
</Button>
```

### 2. **Integração no Componente**
```typescript
import ContractAnalysisModal from '@/components/ContractAnalysisModal';

// Estados necessários
const [analysisModalOpen, setAnalysisModalOpen] = useState(false);
const [selectedContractId, setSelectedContractId] = useState('');

// Função de callback
const handleAnalyzeContract = (contractId: string) => {
  setSelectedContractId(contractId);
  setAnalysisModalOpen(true);
};

// Renderização do modal
<ContractAnalysisModal
  isOpen={analysisModalOpen}
  onClose={() => setAnalysisModalOpen(false)}
  contractId={selectedContractId}
/>
```

## Componentes Utilizados

### Dependências UI
- **Dialog** - Modal principal e sub-modal de evidências
- **ScrollArea** - Área com rolagem para conteúdo extenso
- **Card/CardContent** - Layout dos campos de análise
- **Badge** - Indicadores de status
- **Button** - Controles e ações
- **Separator** - Divisores visuais

### Ícones (Lucide React)
- **Eye** - Ver evidência
- **FileText** - Documentos e contratos
- **Building** - Fornecedor
- **Calendar** - Datas e vigência
- **DollarSign** - Valores e pagamentos
- **CheckCircle/XCircle** - Status de conformidade
- **AlertTriangle** - Avisos
- **Info** - Informações neutras

## Status da Implementação

### ✅ Implementado
- [x] Modal responsivo com limite de tela
- [x] Todos os 16 campos solicitados
- [x] Ícones de status para cada campo
- [x] Botões de evidência em cada campo
- [x] Sub-modal para visualização de evidências
- [x] Resumo estatístico da análise
- [x] Integração com tabelas existentes
- [x] Controles de abrir/fechar
- [x] Scroll quando necessário

### 🔄 Próximos Passos (Melhorias Futuras)
- [ ] Integração real com API de IA
- [ ] Carregamento real das evidências
- [ ] Geração de relatório PDF
- [ ] Cache de análises já realizadas
- [ ] Histórico de análises

## Páginas com Modal Integrado

1. **PaymentVerificationApp** - Tabela principal de contratos
2. **SampleAnalysisPage** - Página de análise de amostras

Ambas as páginas já possuem o modal totalmente funcional e integrado ao botão "Ver análise de IA".

## Dados Simulados

Atualmente o modal utiliza dados simulados que demonstram todos os cenários possíveis:
- Campos conformes (status verde)
- Campos não conformes (status vermelho) 
- Campos de atenção (status amarelo)
- Campos neutros (status azul)

Os dados reais serão fornecidos pela integração com a API de análise de IA quando disponível.
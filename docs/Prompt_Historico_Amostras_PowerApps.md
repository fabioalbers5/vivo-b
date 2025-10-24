# Prompt para GitHub Copilot – Tela de Histórico de Seleção de Amostras (Power Apps)

Você é o GitHub Copilot. Gere a implementação em Power Apps (Canvas App) usando Power Fx e componentes nativos, **seguindo o design system e padrões de UI já usados nesta aplicação** (tipografia, cores, espaçamentos, ícones e bordas).  

## Contexto
Estou na página **Seleção de Amostra** que já possui uma **barra de abas** no topo. Preciso adicionar um **botão “Histórico”** nessa mesma barra. Ao clicar, deve abrir uma **tela pop-up (modal)** com o **Histórico de Seleção de Amostras**. O modal deve sobrepor a tela, ter fundo semitransparente (overlay), foco inicial dentro do modal, e fechar por “X”, por **ESC** e por clique no overlay.

## Dados (Dataverse)
- Tabela `SampleRun` (ID, Nome, Auditor, DataExecucao, Status, CriterionSetID, Tamanho, ResultadosJson)
- Tabela `CriterionSet` (ID, Nome, Versao, CriadoPor, DataCriacao, ListaCriteriosJson, Fonte)
- (Opcional) `RunMetrics` (RunID, ItensProcessados, NaoConformes, ValorImpactado, TempoExecucao)

## Requisitos funcionais do modal “Histórico”
1. **Cabeçalho do modal**
   - Título: “Histórico de Seleções de Amostras”
   - Ícone alinhado ao padrão da app
   - Botão “X” (fechar)
2. **Filtros rápidos**
   - Período (DatePicker inicial/final)
   - Auditor (Dropdown)
   - Status (Dropdown: Concluída, Em execução, Cancelada)
   - Campo de busca (TextInput)
   - Botão “Limpar filtros”
3. **Galeria/Tabela principal**
   - Lista de `SampleRun` com colunas:
     - Data da execução
     - Nome da amostra
     - Auditor
     - Critério principal
     - Tamanho
     - Status (ícone colorido)
     - Ações: “Ver detalhes”, “Reutilizar critérios”, “Exportar”
   - Paginação ou “Carregar mais”
4. **Painel de detalhes (flyout/modal interno)**
   - Informações detalhadas da amostra e critérios utilizados
   - Ações: “Reutilizar critérios”, “Exportar”, “Abrir análise”

## Comportamento
- Variável `varShowHistory` controla visibilidade (`true/false`)
- Abertura: `Set(varShowHistory, true)` ao clicar no botão “Histórico”
- Fechamento: `Set(varShowHistory, false)` no X, overlay ou ESC
- Carregamento com spinner/skeleton
- Estado vazio com mensagem e botão “Iniciar nova amostragem”

## Consultas Power Fx
```PowerFx
ClearCollect(
  colSampleRuns,
  SortByColumns(
    Filter(
      SampleRun,
      IsBlank(txtSearch.Text) || StartsWith(Nome, txtSearch.Text),
      IsBlank(dpStart.SelectedDate) || DataExecucao >= dpStart.SelectedDate,
      IsBlank(dpEnd.SelectedDate) || DataExecucao <= DateAdd(dpEnd.SelectedDate, 1, Days),
      IsBlank(ddAuditor.SelectedText.Value) || Auditor = ddAuditor.SelectedText.Value,
      IsBlank(ddStatus.SelectedText.Value) || Status = ddStatus.SelectedText.Value
    ),
    "DataExecucao",
    Descending
  )
)
```

## Acessibilidade e UX
- Foco inicial no título do modal
- `TabIndex` sequencial
- Contraste conforme padrão
- Tooltips e rótulos claros

## Telemetria
- `HistoryModalOpened` ao abrir
- `HistoryReuseClicked` ao reutilizar critérios

## Critérios de aceite
- Botão “Histórico” na barra de abas da tela Seleção de Amostra
- Modal abre e fecha corretamente
- Filtros funcionam e lista pagina sem travar
- Detalhes e ações operacionais
- UI segue padrões da aplicação

# Modal de Edição de Amostra

## Visão Geral
O Modal de Edição de Amostra é uma interface completa para gerenciar todas as informações e processos relacionados a uma amostra de pagamento individual.

## Localização
- **Componente**: `src/components/EditSampleModal.tsx`
- **Integração**: `src/components/SampleManagementTab.tsx`

## Como Acessar
1. Navegue até a aba **"Gestão da Amostra"**
2. Localize o pagamento que deseja editar na tabela
3. Clique no ícone de **Editar** (📝) na coluna de ações
4. O modal será aberto com todas as informações do pagamento

## Funcionalidades

### 🎯 Aba Geral
**Informações da Amostra** (Somente Leitura)
- Número do Contrato
- Tipo de Fluxo
- Data de Vencimento
- Ciclo Tesouraria
- Tipo de Alerta
- Nível de Risco

**Configurações da Análise**
- ✅ **Analista Responsável**: Atribuir ou alterar o analista
- ✅ **Status da Análise**: Pendente | Em Análise | Concluído | Rejeitado
- ✅ **Prioridade**: Baixa | Normal | Alta | Crítica
- ✅ **Data Estimada de Conclusão**: Data alvo para finalização
- 🔥 **Checkbox URGENTE**: Marca a amostra como urgente (aparece com ícone de chama)

**Notas e Comentários**
- **Notas Internas**: Observações gerais sobre a amostra
- **Comentários de Revisão**: Feedback sobre revisão ou aprovação

### 👥 Aba Observadores
Gerencie pessoas que devem receber notificações sobre esta amostra.

**Adicionar Observador**
1. Digite o **Nome** da pessoa
2. Digite o **Email** (com validação)
3. Clique em **Adicionar**
4. A pessoa será adicionada à lista de observadores

**Funcionalidades**
- ✉️ **Enviar Notificação**: Botão para enviar email a todos os observadores
- ❌ **Remover Observador**: Clique no X para remover da lista
- 📊 **Contador**: Mostra quantas pessoas estão observando

### 📎 Aba Anexos
Anexe documentos e evidências relacionados à amostra.

**Upload de Arquivos**
1. Clique na área de upload ou arraste arquivos
2. Selecione um ou múltiplos arquivos
3. Os arquivos serão listados com nome e tamanho
4. Remova arquivos clicando no X

**Informações Exibidas**
- Nome do arquivo
- Tamanho (em KB)
- Ícone de documento

### 📜 Aba Histórico
Visualize o histórico completo de atividades da amostra.

**Informações do Log**
- **Ação**: Tipo de atividade realizada
- **Usuário**: Quem executou a ação
- **Data/Hora**: Timestamp da atividade
- **Detalhes**: Descrição completa da ação

**Timeline Visual**
- Linha vertical conectando os eventos
- Marcador circular para cada evento
- Ordem cronológica (mais recente no topo)

## UI/UX

### Design
- **Layout Responsivo**: Adapta-se a diferentes tamanhos de tela
- **Altura Fixa**: 85vh para melhor visualização
- **Largura Máxima**: 5xl (muito amplo)
- **Scroll Interno**: Conteúdo rolável dentro do modal

### Feedback Visual
- **Badges de Status**: Cores diferentes por status
  - Pendente: Cinza (secondary)
  - Em Análise: Azul (default)
  - Concluído: Verde (outline)
  - Rejeitado: Vermelho (destructive)
- **Ícone de Urgência**: Chama 🔥 animada para amostras urgentes
- **Toast Notifications**: Confirmações de ações

### Navegação por Abas
- **Ícones Visuais**: Cada aba tem um ícone representativo
- **Grid Responsivo**: 4 colunas em telas maiores
- **Indicador Ativo**: Destaque visual na aba selecionada

## Integração com Sistema

### Hooks Utilizados
- `useAnalysts()`: Lista de analistas disponíveis
- `useToast()`: Notificações do sistema

### Gerenciamento de Estado
- Estados locais para formulário
- Validação de email
- Controle de anexos (File API)
- Lista dinâmica de observadores

### Persistência
Ao clicar em **"Salvar Alterações"**:
1. Todos os campos são consolidados
2. Objeto `LegacyContract` atualizado
3. Callback `onSave()` executado
4. Estado global da tabela atualizado
5. Modal fechado automaticamente
6. Toast de confirmação exibido

## Campos Editáveis
| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| Analista Responsável | Select | ✅ Sim | Profissional responsável |
| Status da Análise | Select | Não | Estado atual da análise |
| Prioridade | Select | Não | Nível de prioridade |
| Data de Conclusão | Date | Não | Prazo estimado |
| Urgente | Checkbox | Não | Marca como urgente |
| Notas Internas | Textarea | Não | Observações gerais |
| Comentários de Revisão | Textarea | Não | Feedback de revisão |
| Observadores | Lista | Não | Emails para notificação |
| Anexos | Files | Não | Documentos relacionados |

## Recursos Adicionais Implementados

### 🎨 Seguindo Padrão UI
- Componentes Shadcn/ui consistentes
- Paleta de cores do tema
- Espaçamentos padronizados
- Tipografia hierárquica

### ⚡ Performance
- Renderização condicional
- Lazy loading de abas
- Debounce em inputs (se necessário)

### ♿ Acessibilidade
- Labels descritivos
- ARIA labels onde aplicável
- Navegação por teclado
- Contraste adequado

### 🔒 Validações
- Email com regex
- Campos obrigatórios marcados
- Feedback de erro visual
- Prevenção de submissão inválida

## Melhorias Futuras Sugeridas
1. **Integração Backend**: Salvar dados no Supabase
2. **Histórico Real**: Buscar logs do banco de dados
3. **Preview de Anexos**: Visualizar PDFs/imagens no modal
4. **Envio de Email Real**: Integração com serviço de email
5. **Notificações em Tempo Real**: WebSocket para updates
6. **Permissões**: Controle de acesso por perfil de usuário
7. **Auditoria**: Rastreamento completo de alterações
8. **Exportar Histórico**: PDF ou CSV do timeline

## Exemplo de Uso

```typescript
// Abrir modal programaticamente
const handleEditSample = (payment: LegacyContract) => {
  setSelectedPayment(payment);
  setIsEditModalOpen(true);
};

// Callback de salvamento
const handleSaveEdit = (updatedPayment: LegacyContract) => {
  // Atualizar estado
  updatePaymentInList(updatedPayment);
  
  // Sincronizar com backend (futuro)
  await saveToDatabase(updatedPayment);
};
```

## Troubleshooting

### Modal não abre
- Verificar se `isOpen` está sendo setado como `true`
- Confirmar que `payment` não é `null`

### Dados não salvam
- Verificar callback `onSave` está implementado
- Validar estrutura do objeto `LegacyContract`

### Analistas não aparecem
- Verificar hook `useAnalysts()` está retornando dados
- Confirmar tabela `contratos_filtrados` tem usuários

## Conclusão
O Modal de Edição de Amostra oferece uma interface completa e intuitiva para gerenciamento de amostras, seguindo as melhores práticas de UX e mantendo consistência com o padrão visual da aplicação.

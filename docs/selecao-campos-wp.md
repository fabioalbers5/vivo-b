# Seleção de Campos para Geração de WP

## 📋 Visão Geral

Esta funcionalidade permite que o usuário selecione quais campos incluir no Work Package (WP) antes da geração do documento. O usuário pode escolher entre campos analisados pela IA e campos adicionados manualmente, proporcionando flexibilidade total na personalização do documento final.

## 🎯 Funcionalidades

### 1. Modal de Seleção de Campos
- **Acionamento**: Clique no botão "Gerar WP"
- **Pré-seleção**: Todos os campos vêm selecionados por padrão
- **Organização**: Campos separados em duas categorias:
  - Campos Analisados pela IA
  - Campos Adicionados (customizados)

### 2. Controles de Seleção
- **Selecionar/Desselecionar Todos**: Botão para marcar/desmarcar todos os campos de uma vez
- **Seleção Individual**: Clique no card ou no checkbox para selecionar/desselecionar
- **Contador em Tempo Real**: Exibe quantos campos estão selecionados
- **Validação**: Requer pelo menos 1 campo selecionado

### 3. Visualização dos Campos
- **Cards Interativos**: Mudam de cor ao serem selecionados
  - Campos da IA: roxo quando selecionado
  - Campos customizados: azul quando selecionado
- **Informações Exibidas**:
  - Ícone do campo
  - Título do campo
  - Badge de status (Conforme, Não Conforme, etc.)
  - Preview do valor (2 linhas máximo)
- **Identificação Visual**: Badge diferenciado para campos adicionados

### 4. Geração do WP
- **Documento Personalizado**: Inclui apenas os campos selecionados
- **Estatísticas Atualizadas**:
  - Total de campos incluídos
  - Quantidade de campos da IA
  - Quantidade de campos adicionados
  - Total de correções aplicadas
- **Identificação**: Campos adicionados marcados com `[CAMPO ADICIONADO]`

## 💻 Como Usar

### Para o Usuário

1. **Abrir Modal de Seleção**:
   - Na tela de Análise de IA, clique no botão "Gerar WP"
   - Modal abre com todos os campos selecionados por padrão

2. **Selecionar Campos**:
   - Clique nos cards para alternar seleção individual
   - Use "Selecionar Todos" / "Desselecionar Todos" para ações em massa
   - Veja o contador atualizar em tempo real

3. **Gerar Documento**:
   - Clique em "Gerar WP" (botão roxo no canto inferior direito)
   - Documento será aberto em nova aba com apenas os campos selecionados
   - Toast de confirmação exibe quantos campos foram incluídos

### Para Desenvolvedores

```tsx
// Estados para controle
const [wpModalOpen, setWpModalOpen] = useState(false);
const [selectedFieldsForWP, setSelectedFieldsForWP] = useState<Set<string>>(new Set());

// Abrir modal e pré-selecionar todos os campos
const handleOpenWPModal = () => {
  const allFields = [...analysisData, ...customFields];
  setSelectedFieldsForWP(new Set(allFields.map(f => f.id)));
  setWpModalOpen(true);
};

// Alternar seleção de um campo
const toggleFieldSelection = (fieldId: string) => {
  setSelectedFieldsForWP(prev => {
    const newSet = new Set(prev);
    if (newSet.has(fieldId)) {
      newSet.delete(fieldId);
    } else {
      newSet.add(fieldId);
    }
    return newSet;
  });
};

// Selecionar/Desselecionar todos
const toggleSelectAll = () => {
  const allFields = [...analysisData, ...customFields];
  if (selectedFieldsForWP.size === allFields.length) {
    setSelectedFieldsForWP(new Set());
  } else {
    setSelectedFieldsForWP(new Set(allFields.map(f => f.id)));
  }
};

// Gerar WP com campos selecionados
const handleGenerateWP = () => {
  if (selectedFieldsForWP.size === 0) {
    toast({ 
      title: "Nenhum campo selecionado",
      variant: "destructive" 
    });
    return;
  }
  
  const allFields = [...analysisData, ...customFields];
  const selectedFields = allFields.filter(f => selectedFieldsForWP.has(f.id));
  
  // Gerar HTML com selectedFields ao invés de analysisData
  // ...
};
```

## 🎨 Interface do Modal

### Layout
```
┌─────────────────── Selecionar Campos para o WP ───────────────────┐
│                                                                     │
│  [Selecionar Todos]  5 de 8 campos selecionados                   │
│  ─────────────────────────────────────────────────────────────────  │
│                                                                     │
│  📊 Campos Analisados pela IA (6)                                  │
│  ┌──────────────────────────────────────────────┐                 │
│  │ ☑️  🏢  Fornecedor           [Neutro]         │                 │
│  │        EMPRESA EXEMPLO LTDA                   │                 │
│  └──────────────────────────────────────────────┘                 │
│  ┌──────────────────────────────────────────────┐                 │
│  │ ☑️  📄  CNPJ                 [Conforme]       │                 │
│  │        12.345.678/0001-90                     │                 │
│  └──────────────────────────────────────────────┘                 │
│  ...                                                                │
│                                                                     │
│  ➕ Campos Adicionados (2)                                          │
│  ┌──────────────────────────────────────────────┐                 │
│  │ ☑️  📄  Data Extra       [Campo Adicionado]  │                 │
│  │        15/12/2024                             │                 │
│  └──────────────────────────────────────────────┘                 │
│                                                                     │
│  ─────────────────────────────────────────────────────────────────  │
│  5 campo(s) será(ão) incluído(s)    [Cancelar]  [🔽 Gerar WP]    │
└─────────────────────────────────────────────────────────────────────┘
```

### Cores e Estados

**Campos da IA:**
- Não selecionado: `border-slate-200`, fundo branco
- Selecionado: `border-vivo-purple`, `bg-purple-50`
- Hover: `hover:shadow-md`

**Campos Customizados:**
- Não selecionado: `border-slate-200`, fundo branco
- Selecionado: `border-blue-500`, `bg-blue-50`
- Hover: `hover:shadow-md`

**Badges de Status:**
- Conforme: Verde (`green-50`, `green-700`, `green-200`)
- Não Conforme: Vermelho (`red-50`, `red-700`, `red-200`)
- Atenção: Amarelo (`yellow-50`, `yellow-700`, `yellow-200`)
- Neutro: Cinza (`slate-50`, `slate-700`, `slate-200`)
- Campo Adicionado: Azul (`blue-50`, `blue-700`, `blue-200`)

## 📄 Documento WP Gerado

### Estrutura do Documento

```html
Work Package - Análise de Pagamento
Contrato: CONTRATO-001
Data de Geração: 20/10/2025

┌─────────────────────────────────────────┐
│ Informações do Documento                 │
│ • Contrato ID: CONTRATO-001              │
│ • Total de Campos Incluídos: 5           │
│ • Campos da IA: 4                        │
│ • Campos Adicionados: 1                  │
│ • Correções Aplicadas: 2                 │
└─────────────────────────────────────────┘

Campos Analisados:
━━━━━━━━━━━━━━━━━━━

▸ Fornecedor [Neutro]
  EMPRESA EXEMPLO LTDA

▸ CNPJ [Conforme]
  12.345.678/0001-90

▸ Data Extra [CAMPO ADICIONADO] [Neutro]
  15/12/2024

...

Resumo de Correções:
━━━━━━━━━━━━━━━━━━━
Total de 2 campo(s) foi(foram) corrigido(s)
• Campo X: Valor corrigido
• Campo Y: Valor corrigido
```

## 🔄 Fluxo de Dados

```
1. Usuário clica "Gerar WP"
   ↓
2. handleOpenWPModal() é chamado
   ↓
3. Todos os campos são pré-selecionados
   ↓
4. Modal abre mostrando campos da IA e customizados
   ↓
5. Usuário seleciona/desseleciona campos
   ↓
6. toggleFieldSelection() atualiza Set de IDs
   ↓
7. Contador atualiza em tempo real
   ↓
8. Usuário clica "Gerar WP"
   ↓
9. Validação: selectedFieldsForWP.size > 0?
   ↓
10. Filtrar apenas campos selecionados
   ↓
11. Gerar HTML com selectedFields
   ↓
12. Abrir nova janela com documento
   ↓
13. Fechar modal e mostrar toast de sucesso
```

## 🎯 Validações

### Frontend
```tsx
// Botão "Gerar WP" desabilitado se nenhum campo selecionado
<Button
  onClick={handleGenerateWP}
  disabled={selectedFieldsForWP.size === 0}
>
  Gerar WP
</Button>

// Mensagem de aviso
{selectedFieldsForWP.size === 0 && (
  <span className="text-orange-600">
    Selecione pelo menos um campo para continuar
  </span>
)}

// Validação na função
if (selectedFieldsForWP.size === 0) {
  toast({
    title: "Nenhum campo selecionado",
    variant: "destructive"
  });
  return;
}
```

## 💡 Casos de Uso

### Caso 1: Gerar WP Completo
```
Cenário: Auditor quer documento com todas as informações
Ação: Abrir modal → Clicar "Gerar WP" (todos já selecionados)
Resultado: WP com todos os campos da IA e adicionados
```

### Caso 2: Gerar WP Resumido
```
Cenário: Gestor quer apenas campos essenciais
Ação: Abrir modal → Desselecionar campos secundários → Gerar
Resultado: WP apenas com campos críticos para análise rápida
```

### Caso 3: Gerar WP de Campos Adicionados
```
Cenário: Analista quer documento só com informações extras
Ação: Abrir modal → Desselecionar todos da IA → Selecionar customizados
Resultado: WP focado em dados adicionados manualmente
```

### Caso 4: Documento para Fornecedor
```
Cenário: Enviar WP sem campos internos sensíveis
Ação: Desselecionar campos confidenciais → Selecionar apenas públicos
Resultado: WP sanitizado para compartilhamento externo
```

## 🚀 Melhorias Futuras

1. **Salvar Templates de Seleção**:
   ```tsx
   const [savedTemplates, setSavedTemplates] = useState<{
     name: string;
     selectedFields: Set<string>;
   }[]>([]);
   ```

2. **Busca/Filtro no Modal**:
   ```tsx
   const [searchTerm, setSearchTerm] = useState('');
   const filteredFields = allFields.filter(f => 
     f.label.toLowerCase().includes(searchTerm.toLowerCase())
   );
   ```

3. **Arrastar para Reordenar**:
   - Biblioteca: `@dnd-kit/core`
   - Permitir usuário definir ordem dos campos no WP

4. **Preview do WP**:
   - Botão "Pré-visualizar" no modal
   - Mostrar como ficará o documento antes de gerar

5. **Exportar para Outros Formatos**:
   - PDF (usando jsPDF)
   - Excel (usando xlsx)
   - Word (usando docx)

## 🐛 Troubleshooting

**Q: Botão "Gerar WP" está desabilitado**  
A: Você precisa selecionar pelo menos um campo. Verifique o contador.

**Q: Modal não abre ao clicar em "Gerar WP"**  
A: Verifique se o estado `wpModalOpen` está sendo atualizado corretamente.

**Q: Campos não aparecem no documento gerado**  
A: Certifique-se de que `selectedFields` está sendo usado no template HTML, não `analysisData`.

**Q: Seleção não persiste após gerar WP**  
A: Isso é esperado. A seleção é resetada a cada abertura do modal.

**Q: Cards não mudam de cor ao clicar**  
A: Verifique se o evento `onClick` está disparando `toggleFieldSelection`.

## 📊 Estatísticas de Uso

O sistema agora exibe estatísticas detalhadas:
- Total de campos incluídos no WP
- Divisão entre campos da IA e adicionados
- Total de correções aplicadas
- Identificação visual de campos customizados no documento

Isso permite melhor rastreabilidade e auditoria dos documentos gerados!

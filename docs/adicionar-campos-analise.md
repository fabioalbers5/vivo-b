# Adicionar Campos Customizados na Análise de IA

## 📋 Visão Geral

Esta funcionalidade permite que os usuários adicionem campos personalizados à análise de pagamento realizada pela IA. Os campos adicionados seguem o mesmo padrão visual dos campos analisados pela IA, incluindo título, descrição e evidência (foto/documento).

## 🎯 Funcionalidades

### 1. Adicionar Novo Campo
- **Localização**: Botão "Adicionar Novo Campo" no final da lista de campos analisados
- **Requisitos**: 
  - Título do campo (obrigatório)
  - Descrição/Valor (obrigatório)
  - Evidência - imagem ou PDF (opcional)
- **Validação**: Sistema verifica se título e descrição foram preenchidos

### 2. Visualização de Campos Adicionados
- Badge "Campo Adicionado" para identificação visual
- Borda azul diferenciando dos campos da IA
- Ícone de documento padrão
- Botão para visualizar evidência (se houver)
- Botão para remover campo

### 3. Gerenciamento de Evidências
- Suporte para imagens (PNG, JPG) e PDF
- Limite de 10MB por arquivo
- Visualização inline de imagens
- Download de PDFs
- Preview ao selecionar arquivo

### 4. Integração com Bloqueio
- Botão "Adicionar Novo Campo" desabilitado quando pagamento está bloqueado
- Botão "Remover" desabilitado quando pagamento está bloqueado
- Campos adicionados anteriormente permanecem visíveis mesmo após bloqueio

## 💻 Como Usar

### Para o Usuário

1. **Adicionar Campo**:
   - Clique no botão "Adicionar Novo Campo" (card com borda tracejada)
   - Preencha o título do campo (ex: "Data de Vencimento Real")
   - Preencha a descrição/valor (ex: "15/12/2024 - Conforme email do fornecedor")
   - (Opcional) Adicione uma evidência clicando na área de upload
   - Clique em "Adicionar Campo"

2. **Visualizar Evidência**:
   - Clique no ícone de olho (👁️) no campo adicionado
   - Imagens serão exibidas diretamente
   - PDFs podem ser baixados

3. **Remover Campo**:
   - Clique no ícone de lixeira (🗑️) no campo que deseja remover
   - Confirmação via toast

### Para Desenvolvedores

```tsx
// Estados principais
const [customFields, setCustomFields] = useState<AnalysisField[]>([]);
const [addFieldModalOpen, setAddFieldModalOpen] = useState(false);
const [newFieldForm, setNewFieldForm] = useState<CustomFieldForm>({
  label: '',
  value: '',
  evidence: null
});

// Estrutura de um campo customizado
interface AnalysisField {
  id: string;              // ID único gerado
  label: string;           // Título do campo
  value: string;           // Descrição/valor
  icon: ComponentType;     // Ícone (FileText padrão)
  status: 'neutral';       // Status sempre neutro
  hasEvidence: boolean;    // Se tem evidência
  isCustom: true;          // Flag de campo customizado
  customEvidence?: File;   // Arquivo da evidência
}

// Adicionar campo
const handleAddCustomField = () => {
  const newField: AnalysisField = {
    id: `custom_${Date.now()}`,
    label: newFieldForm.label,
    value: newFieldForm.value,
    icon: FileText,
    status: 'neutral',
    hasEvidence: !!newFieldForm.evidence,
    isCustom: true,
    customEvidence: newFieldForm.evidence || undefined
  };
  
  setCustomFields(prev => [...prev, newField]);
};

// Remover campo
const handleRemoveCustomField = (fieldId: string) => {
  setCustomFields(prev => prev.filter(f => f.id !== fieldId));
};
```

## 🎨 Padrões de UI

### Cores
- **Borda do Card**: `border-l-blue-500` (azul)
- **Ícone**: `text-blue-600` sobre fundo `bg-blue-50`
- **Badge**: `bg-blue-50 text-blue-700 border-blue-200`

### Componentes Utilizados
- `Dialog` - Modal para adicionar campo
- `Input` - Campo de título
- `Textarea` - Campo de descrição
- `Button` - Ações
- `Badge` - Identificador "Campo Adicionado"
- `Card` - Container do campo

### Layout
```
┌─────────────────────────────────────────┐
│ 🔵 [Ícone]  Título do Campo             │
│             [Badge: Campo Adicionado]   │
│             Descrição do campo...       │
│                                    👁️ 🗑️ │
└─────────────────────────────────────────┘
```

## 🔄 Fluxo de Dados

1. Usuário clica em "Adicionar Novo Campo"
2. Modal abre com formulário vazio
3. Usuário preenche dados e faz upload (opcional)
4. Validação dos campos obrigatórios
5. Criação do objeto `AnalysisField` com flag `isCustom: true`
6. Adição ao array `customFields`
7. Renderização do novo card na lista
8. Toast de confirmação

## 📝 Observações Importantes

- **Persistência**: Atualmente os campos são mantidos apenas em memória local. Para persistir, integrar com backend/Supabase
- **Limite de Tamanho**: Validação de 10MB não está implementada no frontend
- **Tipos de Arquivo**: Aceita imagens e PDF, mas pode ser expandido
- **Ordenação**: Campos customizados aparecem após campos da IA
- **Bloqueio**: Respeita o status de bloqueio do pagamento

## 🚀 Melhorias Futuras

1. **Persistência no Banco**:
   ```sql
   CREATE TABLE custom_analysis_fields (
     id UUID PRIMARY KEY,
     contract_id VARCHAR,
     field_label VARCHAR,
     field_value TEXT,
     evidence_url VARCHAR,
     created_at TIMESTAMP,
     created_by UUID
   );
   ```

2. **Validação de Tamanho de Arquivo**:
   ```tsx
   if (file.size > 10 * 1024 * 1024) {
     toast({ title: "Arquivo muito grande", variant: "destructive" });
     return;
   }
   ```

3. **Upload para Storage**:
   - Integrar com Supabase Storage
   - Gerar URLs públicas para evidências
   - Deletar arquivo ao remover campo

4. **Edição de Campos**:
   - Adicionar botão de editar
   - Modal similar ao de adição
   - Substituir evidência

5. **Reordenação**:
   - Drag and drop para organizar campos
   - Biblioteca: `@dnd-kit/core`

## 📊 Exemplo de Uso

```tsx
<ContractAnalysisModal
  isOpen={true}
  onClose={handleClose}
  contractId="CONTRATO-001"
  paymentStatus="pending"
  onStatusChange={handleStatusChange}
/>

// Usuário adiciona campo:
// Título: "Multa por Atraso"
// Descrição: "Não há previsão de multa no contrato original"
// Evidência: screenshot_clausula_multa.png

// Resultado: Novo campo aparece na análise com todas as informações
```

## 🐛 Troubleshooting

**Q: Os campos desaparecem ao fechar o modal**  
A: Isso é esperado. Implemente persistência no backend para manter os dados.

**Q: Upload de PDF não funciona**  
A: Verifique o atributo `accept` do input: `accept="image/*,.pdf"`

**Q: Botão "Adicionar Campo" não aparece**  
A: Verifique se `isLocked` é `false`. Botão só aparece quando pagamento está desbloqueado.

**Q: Evidência não carrega no modal**  
A: Certifique-se de que `createObjectURL` está funcionando e que o arquivo foi salvo corretamente no estado.

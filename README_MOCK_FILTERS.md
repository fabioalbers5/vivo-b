# 🧪 Script de Dados Mock - Filtros de Amostras

## 📋 Descrição

Este script insere dados fictícios de filtros para 8 amostras de exemplo, permitindo testar a funcionalidade de **reutilização de filtros** sem precisar criar amostras reais primeiro.

## 📦 O que será inserido

O script cria 8 conjuntos de metadados de filtros com diferentes combinações:

### Amostra 1 (2024-10-15) - OPEX/CAPEX Alto Risco
- **Tipos**: OPEX, CAPEX
- **Valor Contrato**: R$ 100.000 - R$ 5.000.000
- **Status**: Pendente, Vencido
- **Alertas**: Pagamento Atrasado, Sem Nota Fiscal
- **Risco**: Alto, Médio
- **Motor**: Highest Value (Maior Valor)
- **Tamanho**: 25 contratos

### Amostra 2 (2024-09-20) - Telecomunicações Crítico
- **Tipos**: Telecomunicações
- **Período**: Últimos 30 dias
- **Status**: Vencido, Bloqueado
- **Alertas**: Multa Contratual, Fora do Prazo
- **Risco**: Crítico, Alto
- **Ciclo**: 15 dias
- **Motor**: Stratified (Estratificado)
- **Tamanho**: 15 contratos

### Amostra 3 (2024-08-10) - TI Valores Baixos
- **Tipos**: TI, OPEX
- **Valor Contrato**: R$ 0 - R$ 500.000
- **Período**: Próximos 30 dias
- **Status**: Pendente, Em Análise
- **Alertas**: Documentação Pendente
- **Risco**: Baixo, Médio
- **Motor**: Random (Aleatório)
- **Tamanho**: 30 contratos

### Amostra 4 (2024-07-25) - Todos os Tipos Crítico
- **Tipos**: Todos
- **Valor Contrato**: R$ 1.000.000 - R$ 10.000.000
- **Período**: Vencidos
- **Status**: Vencido, Bloqueado, Em Disputa
- **Alertas**: Múltiplos
- **Risco**: Crítico
- **Motor**: Highest Value
- **Tamanho**: 10 contratos

### Amostra 5 (2024-06-15) - CAPEX com Fornecedores
- **Tipos**: CAPEX, Infraestrutura
- **Valor Contrato**: R$ 250.000 - R$ 2.000.000
- **Período**: 01/06/2024 - 30/06/2024 (Custom)
- **Status**: Pendente, Aprovado
- **Fornecedores**: Fornecedor ABC Ltda, Empresa XYZ S.A.
- **Ciclo**: 30 dias
- **Motor**: Stratified
- **Tamanho**: 20 contratos

### Amostra 6 (2024-05-08) - Baixo Risco
- **Tipos**: Serviços, Manutenção
- **Valor Contrato**: R$ 0 - R$ 100.000
- **Status**: Pago, Quitado
- **Alertas**: Nenhum
- **Risco**: Baixo
- **Motor**: Random
- **Tamanho**: 50 contratos

### Amostra 7 (2024-04-18) - Próximos 60 dias Alto Valor
- **Tipos**: OPEX, Telecomunicações, TI
- **Valor Contrato**: R$ 500.000 - R$ 8.000.000
- **Período**: Próximos 60 dias
- **Status**: Pendente, Em Análise, Aguardando Aprovação
- **Alertas**: Prazo Próximo, Valor Alto
- **Risco**: Alto, Médio
- **Ciclo**: 15 dias
- **Motor**: Highest Value
- **Tamanho**: 18 contratos

### Amostra 8 (2024-03-12) - Contratos Específicos
- **Tipos**: CAPEX
- **Contratos**: CTR-2024-001, CTR-2024-002, CTR-2024-003
- **Filtros**: Todos (sem restrições)
- **Motor**: Highest Value
- **Tamanho**: 12 contratos (3 números específicos)

## 🚀 Como Executar

### Pré-requisitos
1. A migration principal (`20251024_sample_filters_metadata.sql`) já deve ter sido executada
2. A tabela `amostras_filtros_metadata` deve existir no banco

### Opção 1: Via Dashboard do Supabase (Recomendado)
1. Acesse [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole todo o conteúdo do arquivo:
   ```
   supabase/migrations/20251024_insert_mock_filter_metadata.sql
   ```
6. Clique em **Run** (F5)
7. ✅ Você verá uma mensagem com o total de registros inseridos

### Opção 2: Via CLI do Supabase
```bash
# Na raiz do projeto
npx supabase db execute -f supabase/migrations/20251024_insert_mock_filter_metadata.sql
```

### Opção 3: Via PowerShell
```powershell
# Copie e execute no terminal
$content = Get-Content "supabase\migrations\20251024_insert_mock_filter_metadata.sql" -Raw
# Cole o conteúdo no SQL Editor do Supabase Dashboard
```

## ✅ Verificando a Instalação

Após executar o script, você pode verificar:

### 1. No SQL Editor do Supabase:
```sql
SELECT 
  amostra_id,
  flow_type,
  risk_level,
  payment_status,
  sample_size,
  sampling_motor
FROM public.amostras_filtros_metadata
ORDER BY amostra_id DESC;
```

### 2. Na Aplicação:
1. Abra a aplicação
2. Vá para **Histórico** (botão na aba de seleção)
3. Clique em **"Ver Detalhes"** em qualquer amostra
4. Role até **"Filtros Utilizados na Amostragem"**
5. ✅ Você deve ver os filtros reais ao invés da mensagem de "não disponível"

## 🧪 Testando a Reutilização

### Teste Básico:
1. Abra o **Histórico**
2. Localize a amostra **2024-10-15** (OPEX/CAPEX Alto Risco)
3. Clique no botão **"Reutilizar"** (ícone ↻)
4. ✅ Os filtros devem ser aplicados:
   - Tipo de Fluxo: OPEX, CAPEX
   - Valor: R$ 100k - R$ 5M
   - Status: Pendente, Vencido
   - Alertas: Pagamento Atrasado, Sem Nota Fiscal
   - Risco: Alto, Médio

### Teste de Diferentes Cenários:
- **Amostra 2024-09-20**: Teste filtros com ciclo de tesouraria (15 dias)
- **Amostra 2024-06-15**: Teste filtros com fornecedores específicos
- **Amostra 2024-08-10**: Teste filtros de valores baixos e motor aleatório
- **Amostra 2024-03-12**: Teste filtros com números de contrato específicos

## 🔄 Limpeza de Dados

Se quiser remover os dados mock e começar do zero:

```sql
-- Remover apenas os dados mock (amostras de 2024 e 2025)
DELETE FROM public.amostras_filtros_metadata 
WHERE amostra_id LIKE '2024-%' OR amostra_id LIKE '2025-%';

-- Verificar
SELECT COUNT(*) FROM public.amostras_filtros_metadata;
```

## ⚠️ Observações Importantes

1. **Amostras no histórico**: Este script apenas cria os metadados dos filtros. As amostras devem existir na tabela `contratos_filtrados` para aparecerem no histórico.

2. **IDs das amostras**: Os IDs usados (2024-10-15, 2024-09-20, etc.) são fictícios. Se você já tem amostras reais com esses IDs, os metadados serão associados a elas.

3. **Dados reais**: Este é um script de TESTE. Em produção, os metadados são salvos automaticamente quando você cria uma amostra.

4. **Arrays vazios**: Alguns filtros têm arrays vazios (`ARRAY[]::TEXT[]`) para simular filtros "Todos" ou "Nenhum filtro aplicado".

## 🎯 Próximos Passos

Após executar este script:

1. ✅ Teste a visualização dos filtros nos detalhes
2. ✅ Teste a reutilização de filtros
3. ✅ Verifique se os filtros são aplicados corretamente
4. ✅ Crie uma nova amostra real para ver o salvamento automático funcionando

## 📊 Estrutura dos Dados

Cada registro contém:
- `amostra_id`: ID da amostra
- `flow_type`: Array de tipos de fluxo
- `contract_value_min/max`: Faixa de valores do contrato
- `payment_value_min/max`: Faixa de valores de pagamento
- `due_date`: Tipo de vencimento (all, last-30-days, next-60-days, custom, overdue)
- `custom_start/end`: Datas customizadas (se due_date = 'custom')
- `treasury_cycle`: Ciclo de tesouraria
- `payment_status`: Array de status de pagamento
- `alert_type`: Array de tipos de alerta
- `risk_level`: Array de níveis de risco
- `supplier_name`: Array de fornecedores (opcional)
- `contract_number`: Array de números de contrato (opcional)
- `sample_size`: Tamanho da amostra
- `sampling_motor`: Motor de amostragem usado
- `contract_count`: Total de contratos disponíveis

## 🐛 Troubleshooting

### Erro: "relation amostras_filtros_metadata does not exist"
**Solução**: Execute primeiro a migration principal:
```sql
-- Execute o arquivo: supabase/migrations/20251024_sample_filters_metadata.sql
```

### Erro: "duplicate key value violates unique constraint"
**Solução**: Limpe os dados existentes antes de reinserir:
```sql
DELETE FROM public.amostras_filtros_metadata WHERE amostra_id LIKE '2024-%';
-- Depois execute o script novamente
```

### Os filtros não aparecem na aplicação
**Solução**: 
1. Abra o console do navegador (F12)
2. Verifique se há erros de conexão
3. Confirme que os dados foram inseridos:
   ```sql
   SELECT COUNT(*) FROM public.amostras_filtros_metadata;
   ```
4. Recarregue a página (Ctrl+F5)

---

**Criado em**: 24/10/2024  
**Arquivo**: `supabase/migrations/20251024_insert_mock_filter_metadata.sql`  
**Relacionado**: `GUIA_REUTILIZAR_FILTROS.md`

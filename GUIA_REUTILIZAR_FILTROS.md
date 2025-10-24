# Guia: Reutilizar Filtros de Amostras

## 📋 Visão Geral

Este guia explica como funciona a nova funcionalidade de **reutilização de filtros** das amostras salvas.

## ✨ Funcionalidades Implementadas

### 1. **Salvamento Automático dos Filtros**
Quando uma amostra é criada e definida, o sistema agora salva automaticamente todos os filtros que foram utilizados:

- ✅ Tipo de Fluxo
- ✅ Valor do Contrato (min/max)
- ✅ Valor do Pagamento (min/max)
- ✅ Data de Vencimento
- ✅ Intervalo de Datas Customizado
- ✅ Ciclo do Tesouraria
- ✅ Status de Pagamento
- ✅ Tipo de Alerta
- ✅ Nível de Risco
- ✅ Nome do Fornecedor
- ✅ Número do Contrato
- ✅ Tamanho da Amostra
- ✅ Motor de Amostragem
- ✅ Contagem de Contratos

### 2. **Visualização dos Filtros Utilizados**
No modal de histórico, ao clicar em "Ver Detalhes" de uma amostra:
- Exibe todos os filtros que foram utilizados na criação daquela amostra
- Mostra valores reais (não mais placeholders)
- Indica quando não há metadados salvos

### 3. **Reutilização dos Filtros**
Ao clicar no botão **"Reutilizar"** em uma amostra do histórico:
- ✅ Todos os filtros são automaticamente aplicados na tela de seleção
- ✅ O modal de histórico é fechado
- ✅ Usuário é redirecionado para a aba de "Seleção da Amostra"
- ✅ Os contratos são filtrados automaticamente com os mesmos critérios
- ✅ Toast de confirmação é exibido

## 🗄️ Estrutura do Banco de Dados

### Nova Tabela: `amostras_filtros_metadata`

```sql
CREATE TABLE public.amostras_filtros_metadata (
  id BIGSERIAL PRIMARY KEY,
  amostra_id TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Filtros básicos
  flow_type TEXT[],
  contract_value_min NUMERIC,
  contract_value_max NUMERIC,
  payment_value_min NUMERIC,
  payment_value_max NUMERIC,
  due_date TEXT,
  custom_start DATE,
  custom_end DATE,
  treasury_cycle TEXT,
  
  -- Filtros Vivo específicos
  payment_status TEXT[],
  alert_type TEXT[],
  risk_level TEXT[],
  
  -- Filtros avançados
  supplier_name TEXT[],
  contract_number TEXT[],
  
  -- Configurações da amostragem
  sample_size INTEGER,
  sampling_motor TEXT,
  contract_count INTEGER
);
```

## 🚀 Como Usar

### 1. Criar uma Amostra (já salva os filtros automaticamente)
1. Acesse a aba "Seleção da Amostra"
2. Aplique os filtros desejados
3. Selecione os contratos
4. Clique em "Finalizar Seleção"
5. Escolha o analista responsável
6. Clique em "Definir Amostra"
7. ✅ Os filtros são salvos automaticamente junto com a amostra!

### 2. Visualizar Filtros de uma Amostra
1. Clique no botão "Histórico" na aba de seleção
2. Na tabela de histórico, clique em "Ver Detalhes" na amostra desejada
3. Role até a seção "Filtros Utilizados na Amostragem"
4. Veja todos os filtros que foram aplicados naquela amostra

### 3. Reutilizar Filtros de uma Amostra
1. No histórico, localize a amostra com os filtros que deseja reutilizar
2. Clique no botão **"Reutilizar"** (ícone de ↻)
   - OU abra os detalhes e clique em "Reutilizar Critérios"
3. ✅ Os filtros são aplicados automaticamente!
4. O sistema fecha o modal e você volta para a tela de seleção
5. Agora você pode selecionar novos contratos com os mesmos filtros

## 🔧 Instalação da Migration

Para ativar essa funcionalidade, é necessário executar a migration SQL no Supabase:

### Opção 1: Via Dashboard do Supabase
1. Acesse o [Supabase Dashboard](https://app.supabase.com)
2. Selecione seu projeto
3. Vá em **SQL Editor** no menu lateral
4. Clique em **New Query**
5. Cole o conteúdo do arquivo: `supabase/migrations/20251024_sample_filters_metadata.sql`
6. Clique em **Run** para executar

### Opção 2: Via CLI do Supabase
```bash
# Na raiz do projeto
npx supabase migration up
```

### Opção 3: Via PowerShell (manual)
```powershell
# Execute o arquivo SQL diretamente
Get-Content "supabase\migrations\20251024_sample_filters_metadata.sql" | supabase db execute
```

## 📝 Notas Técnicas

### Amostras Antigas
- Amostras criadas **antes** da implementação desta funcionalidade **não terão** metadados de filtros salvos
- Ao tentar visualizar ou reutilizar filtros dessas amostras, aparecerá a mensagem: "Esta amostra não possui metadados de filtros salvos."
- Isso é esperado e normal!

### Amostras Novas
- Todas as amostras criadas **após** a execução da migration terão os filtros salvos automaticamente
- Os filtros podem ser reutilizados quantas vezes quiser

### Performance
- A tabela possui índices para otimizar as consultas por `amostra_id`
- O salvamento dos metadados não afeta a performance da criação de amostras (é feito de forma assíncrona)

## 🎯 Casos de Uso

### Caso 1: Análise Recorrente
"Todo mês preciso analisar contratos do tipo X com valor Y..."
- ✅ Crie a primeira amostra com os filtros
- ✅ No próximo mês, reutilize os mesmos filtros
- ✅ Economize tempo não precisando reconfigurar tudo

### Caso 2: Comparação Entre Períodos
"Quero comparar os contratos de Janeiro vs Fevereiro com os mesmos critérios"
- ✅ Crie amostra de Janeiro
- ✅ Reutilize os filtros para Fevereiro
- ✅ Garanta critérios idênticos para comparação justa

### Caso 3: Auditoria e Rastreabilidade
"Preciso saber exatamente quais filtros foram usados naquela amostra de Março"
- ✅ Abra o histórico
- ✅ Veja os detalhes da amostra
- ✅ Todos os filtros utilizados estão documentados

## 🐛 Troubleshooting

### "Esta amostra não possui metadados de filtros salvos"
**Causa**: Amostra criada antes da implementação desta funcionalidade
**Solução**: Normal e esperado. Use apenas amostras novas para reutilizar filtros.

### "Não foi possível carregar os filtros desta amostra"
**Causa**: A migration não foi executada ou houve erro na execução
**Solução**: Execute a migration conforme instruções acima

### Filtros não estão sendo aplicados
**Causa**: Possível problema de comunicação com o banco
**Solução**: 
1. Verifique o console do navegador (F12) para erros
2. Confirme que a tabela `amostras_filtros_metadata` existe no Supabase
3. Verifique as permissões RLS da tabela

## 📊 Exemplo de Uso Completo

```
1. CRIAR AMOSTRA COM FILTROS
   └─ Aplicar filtros: Tipo = "OPEX", Valor = R$ 100k-500k, Risco = "Alto"
   └─ Selecionar 15 contratos
   └─ Definir para analista "João Silva"
   └─ ✅ Amostra 2024-10-24 criada (filtros salvos automaticamente)

2. SEMANA SEGUINTE - REUTILIZAR
   └─ Abrir Histórico
   └─ Localizar amostra 2024-10-24
   └─ Clicar em "Reutilizar"
   └─ ✅ Filtros aplicados: Tipo = "OPEX", Valor = R$ 100k-500k, Risco = "Alto"
   └─ Selecionar novos 15 contratos com os mesmos critérios
   └─ Definir para analista "Maria Santos"
   └─ ✅ Nova amostra 2024-10-31 criada

3. AUDITORIA
   └─ Abrir Histórico
   └─ Ver detalhes de qualquer amostra
   └─ ✅ Visualizar exatamente quais filtros foram usados
```

## ✅ Checklist de Implementação

- [x] Criar migration SQL para tabela `amostras_filtros_metadata`
- [x] Salvar metadados ao criar amostra
- [x] Carregar metadados ao abrir detalhes
- [x] Exibir filtros reais (não placeholders) nos detalhes
- [x] Implementar função de reutilização de filtros
- [x] Adicionar botão "Reutilizar" na tabela de histórico
- [x] Adicionar botão "Reutilizar Critérios" no modal de detalhes
- [x] Aplicar filtros automaticamente ao reutilizar
- [x] Fechar modal e mudar para aba de seleção
- [x] Adicionar toasts de feedback
- [x] Tratamento de erros e casos especiais
- [x] Documentação completa

## 🎉 Resultado

Agora é possível:
- ✅ Salvar automaticamente os filtros usados em cada amostra
- ✅ Visualizar os filtros exatos de amostras anteriores
- ✅ Reutilizar os mesmos filtros em novas amostras com 1 clique
- ✅ Economizar tempo e garantir consistência entre análises
- ✅ Manter rastreabilidade e auditoria completa

---

**Data de Implementação**: 24/10/2024
**Versão**: 1.0
**Arquivo de Migration**: `supabase/migrations/20251024_sample_filters_metadata.sql`

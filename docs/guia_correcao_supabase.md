# 🔧 Guia de Correção da Tabela Supabase

## 📋 Scripts Disponíveis

### 1. `corrigir_tabela_contratos_filtrados.sql`
**Uso:** Correção completa da tabela (criação ou verificação)
- Verifica estrutura atual
- Cria tabela se não existir
- Adiciona índices de performance
- Insere dados de teste

### 2. `migrar_numero_contrato_para_varchar.sql`
**Uso:** Conversão específica do campo `numero_contrato` de INTEGER para VARCHAR
- Para tabelas que já existem com tipo errado
- Migração segura de dados existentes
- Método alternativo se a migração falhar

## 🚀 Como Usar

### Cenário 1: Tabela Não Existe ou Problemas Gerais
```sql
-- Execute no SQL Editor do Supabase:
-- Copie e cole todo o conteúdo de: corrigir_tabela_contratos_filtrados.sql
```

### Cenário 2: Campo numero_contrato Está Como INTEGER
```sql
-- Execute no SQL Editor do Supabase:
-- Copie e cole todo o conteúdo de: migrar_numero_contrato_para_varchar.sql
```

## ⚡ Comandos Rápidos de Diagnóstico

### Verificar Se Tabela Existe
```sql
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'contratos_filtrados';
```

### Verificar Estrutura da Tabela
```sql
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados'
ORDER BY ordinal_position;
```

### Verificar Dados Existentes
```sql
SELECT COUNT(*) as total, 
       COUNT(DISTINCT mes_referencia) as meses,
       MAX(data_analise) as ultima_analise
FROM contratos_filtrados;
```

## 🎯 Estrutura Esperada Final

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | SERIAL PRIMARY KEY | ID auto-incremento |
| `numero_contrato` | VARCHAR(255) | **STRING** - aceita "TEST-001", "CT-2024-001" |
| `mes_referencia` | VARCHAR(7) | Formato "MM-YYYY" ex: "10-2025" |
| `data_analise` | TIMESTAMP WITH TIME ZONE | Data/hora da análise |
| `usuario` | VARCHAR(255) | Nome do usuário |
| `created_at` | TIMESTAMP WITH TIME ZONE | Data de criação |
| `updated_at` | TIMESTAMP WITH TIME ZONE | Data de atualização |

## 🔍 Testes de Validação

### Teste 1: Inserção de String
```sql
INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES ('TEST-VALIDATION', '10-2025', 'fabio')
ON CONFLICT (numero_contrato, mes_referencia) DO NOTHING;
```

### Teste 2: Verificar Constraint Única
```sql
-- Deve falhar na segunda inserção:
INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES ('DUPLICATE-TEST', '10-2025', 'fabio');

INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES ('DUPLICATE-TEST', '10-2025', 'fabio');  -- Deve dar erro
```

### Teste 3: Inserção com Diferentes Formatos
```sql
INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES 
    ('12345', '10-2025', 'fabio'),           -- Número como string
    ('CT-2024-001', '10-2025', 'fabio'),     -- Alfanumérico
    ('TEST-ABC-123', '10-2025', 'fabio')     -- String complexa
ON CONFLICT (numero_contrato, mes_referencia) DO NOTHING;
```

## ⚠️ Comandos de Emergência

### Limpar Tabela Completamente
```sql
-- CUIDADO: Remove todos os dados!
DELETE FROM contratos_filtrados;
ALTER SEQUENCE contratos_filtrados_id_seq RESTART WITH 1;
```

### Recriar Tabela do Zero
```sql
-- CUIDADO: Remove tabela e todos os dados!
DROP TABLE IF EXISTS contratos_filtrados CASCADE;
-- Depois execute o script de criação
```

## 📊 Monitoramento

### Verificar Performance dos Índices
```sql
SELECT 
    schemaname,
    tablename,
    indexname,
    num_scans,
    tuples_read,
    tuples_fetched
FROM pg_stat_user_indexes 
WHERE tablename = 'contratos_filtrados';
```

### Estatísticas de Uso
```sql
SELECT 
    mes_referencia,
    COUNT(*) as contratos,
    COUNT(DISTINCT usuario) as usuarios,
    MIN(data_analise) as primeira,
    MAX(data_analise) as ultima
FROM contratos_filtrados 
GROUP BY mes_referencia 
ORDER BY mes_referencia DESC;
```
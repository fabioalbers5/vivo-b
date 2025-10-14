# 🔧 Correção Urgente: Erro "column data_vencimento does not exist"

## 🎯 Problema Identificado
O erro indica que sua tabela não tem a coluna `data_vencimento` que o código está tentando acessar.

## ⚡ Solução Rápida

### Opção 1: Execute o Script SQL Atualizado
1. **Vá para Supabase Dashboard** → SQL Editor
2. **Execute o script atualizado** em `database/setup-vivo-database.sql`
3. **Verifique os logs** - o script mostrará todas as colunas existentes
4. **Recarregue a aplicação**

### Opção 2: Comando SQL Direto (Mais Rápido)
Se quiser uma correção imediata, execute apenas este comando no SQL Editor do Supabase:

```sql
-- Verificar e adicionar colunas básicas que estão faltando
DO $$
DECLARE
    target_table text;
BEGIN
    -- Detectar a tabela correta
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos_vivo') THEN
        target_table := 'contratos_vivo';
    ELSIF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos') THEN
        target_table := 'contratos';
    ELSE
        RAISE EXCEPTION 'Nenhuma tabela de contratos encontrada';
    END IF;
    
    -- Adicionar colunas que podem estar faltando
    BEGIN
        EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS data_vencimento DATE', target_table);
        RAISE NOTICE 'Coluna data_vencimento adicionada/verificada';
    EXCEPTION WHEN OTHERS THEN
        -- PostgreSQL < 9.6 não suporta IF NOT EXISTS em ADD COLUMN
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'data_vencimento') THEN
            EXECUTE format('ALTER TABLE public.%I ADD COLUMN data_vencimento DATE', target_table);
            RAISE NOTICE 'Coluna data_vencimento adicionada';
        END IF;
    END;
    
    -- Adicionar outras colunas essenciais
    PERFORM * FROM (
        SELECT 
            CASE 
                WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'numero_contrato') 
                THEN (EXECUTE format('ALTER TABLE public.%I ADD COLUMN numero_contrato TEXT', target_table))
            END,
            CASE 
                WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'fornecedor') 
                THEN (EXECUTE format('ALTER TABLE public.%I ADD COLUMN fornecedor TEXT', target_table))
            END,
            CASE 
                WHEN NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'valor_contrato') 
                THEN (EXECUTE format('ALTER TABLE public.%I ADD COLUMN valor_contrato DECIMAL(15,2)', target_table))
            END
    ) AS t;
    
    RAISE NOTICE 'Tabela % atualizada com colunas essenciais', target_table;
END $$;
```

## 🔍 Verificar Estrutura da Tabela
Para entender exatamente quais colunas você tem, execute:

```sql
-- Mostrar todas as colunas da tabela de contratos
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name IN ('contratos', 'contratos_vivo')
ORDER BY table_name, ordinal_position;
```

## 📝 Próximos Passos
1. **Execute uma das soluções acima**
2. **Recarregue a aplicação** (Ctrl+F5)
3. **Teste os filtros** novamente
4. **Se ainda houver erro**, me envie o resultado da query de verificação

## 🚨 Se o Problema Persistir
O erro pode indicar que:
- A tabela tem nomes de colunas diferentes
- Precisa fazer mapeamento entre os nomes do código e da tabela
- A aplicação ainda está usando cache do código antigo

**Solução**: Recarregue completamente a página e verifique se o erro persiste com a mesma coluna.
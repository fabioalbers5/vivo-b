-- Script de Correção da Tabela contratos_filtrados no Supabase
-- Execute este script no SQL Editor do Supabase para corrigir qualquer problema na tabela

-- =============================================================================
-- SCRIPT DE CORREÇÃO - TABELA contratos_filtrados
-- =============================================================================

-- 1. VERIFICAR SE A TABELA EXISTE
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados'
ORDER BY ordinal_position;

-- 2. REMOVER TABELA EXISTENTE (SE HOUVER PROBLEMAS)
-- ⚠️ CUIDADO: Isso apagará todos os dados existentes!
-- Descomente apenas se necessário:
-- DROP TABLE IF EXISTS contratos_filtrados CASCADE;

-- 3. CRIAR/RECRIAR TABELA COM ESTRUTURA CORRETA
CREATE TABLE IF NOT EXISTS contratos_filtrados (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(255) NOT NULL,  -- STRING para aceitar "CT-2024-001", "TEST-001"
    mes_referencia VARCHAR(7) NOT NULL,     -- Formato: "MM-YYYY" ex: "10-2025"
    data_analise TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    usuario VARCHAR(255) NOT NULL DEFAULT 'fabio',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint única para evitar duplicações
    UNIQUE(numero_contrato, mes_referencia)
);

-- 4. ALTERAR COLUNA numero_contrato PARA VARCHAR (SE JÁ EXISTIR COMO INTEGER)
-- Execute apenas se a coluna estiver como INTEGER/NUMERIC:
-- ALTER TABLE contratos_filtrados 
-- ALTER COLUMN numero_contrato TYPE VARCHAR(255) USING numero_contrato::VARCHAR;

-- 5. CRIAR ÍNDICES PARA PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_cf_mes_referencia 
    ON contratos_filtrados(mes_referencia);

CREATE INDEX IF NOT EXISTS idx_cf_usuario 
    ON contratos_filtrados(usuario);

CREATE INDEX IF NOT EXISTS idx_cf_data_analise 
    ON contratos_filtrados(data_analise DESC);

CREATE INDEX IF NOT EXISTS idx_cf_numero_contrato 
    ON contratos_filtrados(numero_contrato);

-- 6. VERIFICAR ESTRUTURA FINAL
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados'
ORDER BY ordinal_position;

-- 7. INSERIR DADOS DE TESTE
INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES 
    ('TESTE-001', '10-2025', 'fabio'),
    ('CT-2024-001', '10-2025', 'fabio'),
    ('12345', '10-2025', 'admin')
ON CONFLICT (numero_contrato, mes_referencia) DO NOTHING;

-- 8. VERIFICAR DADOS INSERIDOS
SELECT * FROM contratos_filtrados ORDER BY created_at DESC LIMIT 5;

-- 9. ESTATÍSTICAS DA TABELA
SELECT 
    COUNT(*) as total_registros,
    COUNT(DISTINCT mes_referencia) as meses_distintos,
    COUNT(DISTINCT usuario) as usuarios_distintos,
    MIN(data_analise) as primeira_analise,
    MAX(data_analise) as ultima_analise
FROM contratos_filtrados;

-- =============================================================================
-- COMANDOS DE MANUTENÇÃO (EXECUTE CONFORME NECESSÁRIO)
-- =============================================================================

-- LIMPAR TODOS OS DADOS (CUIDADO!)
-- DELETE FROM contratos_filtrados;

-- RESETAR SEQUÊNCIA DO ID
-- ALTER SEQUENCE contratos_filtrados_id_seq RESTART WITH 1;

-- REMOVER DADOS DE UM MÊS ESPECÍFICO
-- DELETE FROM contratos_filtrados WHERE mes_referencia = '10-2025';

-- LISTAR CONTRATOS DUPLICADOS (PARA DEBUG)
-- SELECT 
--     numero_contrato, 
--     mes_referencia, 
--     COUNT(*) as duplicatas
-- FROM contratos_filtrados 
-- GROUP BY numero_contrato, mes_referencia 
-- HAVING COUNT(*) > 1;
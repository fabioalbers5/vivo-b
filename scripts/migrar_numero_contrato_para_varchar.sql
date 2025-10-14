-- SCRIPT DE MIGRAÇÃO - Converter numero_contrato de INTEGER para VARCHAR
-- Execute este script APENAS se a tabela já existir com numero_contrato como INTEGER

-- =============================================================================
-- MIGRAÇÃO: INTEGER → VARCHAR para numero_contrato
-- =============================================================================

-- 1. VERIFICAR TIPO ATUAL DA COLUNA
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados' 
    AND column_name = 'numero_contrato';

-- 2. BACKUP DOS DADOS EXISTENTES (OPCIONAL)
-- CREATE TABLE contratos_filtrados_backup AS SELECT * FROM contratos_filtrados;

-- 3. CONVERTER COLUNA DE INTEGER PARA VARCHAR
-- Método 1: Conversão direta (se não houver dados críticos)
ALTER TABLE contratos_filtrados 
ALTER COLUMN numero_contrato TYPE VARCHAR(255) USING numero_contrato::VARCHAR;

-- 4. VERIFICAR SE A CONVERSÃO FOI BEM-SUCEDIDA
SELECT 
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados' 
    AND column_name = 'numero_contrato';

-- 5. TESTAR INSERÇÃO COM STRINGS
INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES ('TEST-MIGRATION', '10-2025', 'fabio')
ON CONFLICT (numero_contrato, mes_referencia) DO NOTHING;

-- 6. VERIFICAR DADOS APÓS MIGRAÇÃO
SELECT * FROM contratos_filtrados ORDER BY id DESC LIMIT 5;

-- =============================================================================
-- SE A MIGRAÇÃO FALHAR, USE ESTA ABORDAGEM ALTERNATIVA:
-- =============================================================================

-- MÉTODO ALTERNATIVO - Recriar tabela completa
/*
-- 1. Criar nova tabela com estrutura correta
CREATE TABLE contratos_filtrados_new (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(255) NOT NULL,
    mes_referencia VARCHAR(7) NOT NULL,
    data_analise TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    usuario VARCHAR(255) NOT NULL DEFAULT 'fabio',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(numero_contrato, mes_referencia)
);

-- 2. Migrar dados existentes
INSERT INTO contratos_filtrados_new 
    SELECT 
        id,
        numero_contrato::VARCHAR,  -- Converter para string
        mes_referencia,
        data_analise,
        usuario,
        created_at,
        updated_at
    FROM contratos_filtrados;

-- 3. Remover tabela antiga e renomear
DROP TABLE contratos_filtrados;
ALTER TABLE contratos_filtrados_new RENAME TO contratos_filtrados;

-- 4. Recriar índices
CREATE INDEX idx_cf_mes_referencia ON contratos_filtrados(mes_referencia);
CREATE INDEX idx_cf_usuario ON contratos_filtrados(usuario);
CREATE INDEX idx_cf_data_analise ON contratos_filtrados(data_analise DESC);
CREATE INDEX idx_cf_numero_contrato ON contratos_filtrados(numero_contrato);
*/
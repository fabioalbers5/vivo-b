-- Script SQL para criar a tabela contratos_filtrados no Supabase
-- Execute este script no SQL Editor do Supabase

-- 1. Criar a tabela contratos_filtrados
CREATE TABLE IF NOT EXISTS contratos_filtrados (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(255) NOT NULL,  -- Aceita strings como "TEST-001", "CT-2024-001" 
    mes_referencia VARCHAR(7) NOT NULL,     -- Formato: "MM-YYYY" ex: "10-2025"
    data_analise TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    usuario VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraint única para evitar duplicações
    UNIQUE(numero_contrato, mes_referencia)
);

-- 2. Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_mes_referencia 
    ON contratos_filtrados(mes_referencia);

CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_usuario 
    ON contratos_filtrados(usuario);

CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_data_analise 
    ON contratos_filtrados(data_analise);

-- 3. Configurar RLS (Row Level Security) - OPCIONAL
-- Descomente se quiser controle de acesso por usuário
-- ALTER TABLE contratos_filtrados ENABLE ROW LEVEL SECURITY;

-- 4. Inserir dados de teste (opcional)
INSERT INTO contratos_filtrados (numero_contrato, mes_referencia, usuario) 
VALUES ('TESTE-001', '10-2025', 'fabio')
ON CONFLICT (numero_contrato, mes_referencia) DO NOTHING;

-- 5. Verificar se foi criada corretamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'contratos_filtrados'
ORDER BY ordinal_position;
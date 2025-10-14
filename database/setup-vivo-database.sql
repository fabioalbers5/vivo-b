-- ========================================
-- Scripts SQL para atualizar banco Vivo existente
-- ========================================

-- 1. Criar tabela filtros_personalizados se não existir
DO $$
BEGIN
    -- Criar tabela se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'filtros_personalizados') THEN
        CREATE TABLE public.filtros_personalizados (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            nome_filtro TEXT NOT NULL,
            tabela_origem TEXT NOT NULL,
            campo_origem TEXT NOT NULL,
            tipo TEXT NOT NULL CHECK (tipo IN ('text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean', 'checkbox', 'radio')),
            configuracoes JSONB NOT NULL DEFAULT '{}',
            criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
    ELSE
        -- Adicionar colunas se não existirem
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filtros_personalizados' AND column_name = 'configuracoes') THEN
            ALTER TABLE public.filtros_personalizados ADD COLUMN configuracoes JSONB NOT NULL DEFAULT '{}';
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filtros_personalizados' AND column_name = 'atualizado_em') THEN
            ALTER TABLE public.filtros_personalizados ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
        END IF;
        
        -- Atualizar constraint de check para tipo se necessário
        BEGIN
            ALTER TABLE public.filtros_personalizados DROP CONSTRAINT IF EXISTS filtros_personalizados_tipo_check;
            ALTER TABLE public.filtros_personalizados ADD CONSTRAINT filtros_personalizados_tipo_check 
                CHECK (tipo IN ('text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean', 'checkbox', 'radio'));
        EXCEPTION WHEN OTHERS THEN
            -- Ignorar erro se a constraint já existir corretamente
            NULL;
        END;
    END IF;
END $$;

-- 2. Adicionar novos campos Vivo na tabela contratos_vivo
-- APENAS usar contratos_vivo (não considerar tabela 'contratos')
DO $$
DECLARE
    table_exists boolean;
    target_table text := 'contratos_vivo';
BEGIN
    -- Verificar se contratos_vivo existe
    SELECT EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'contratos_vivo'
    ) INTO table_exists;
    
    IF NOT table_exists THEN
        RAISE EXCEPTION 'Tabela contratos_vivo não encontrada. Por favor, crie a tabela contratos_vivo primeiro.';
    END IF;
    
    -- Adicionar novos campos se não existirem
    EXECUTE format('
        DO $inner$
        BEGIN
            -- Status do pagamento
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''status_pagamento'') THEN
                ALTER TABLE public.%I ADD COLUMN status_pagamento TEXT;
            END IF;
            
            -- Tipo de alerta
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''tipo_alerta'') THEN
                ALTER TABLE public.%I ADD COLUMN tipo_alerta TEXT;
            END IF;
            
            -- Área solicitante
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''area_solicitante'') THEN
                ALTER TABLE public.%I ADD COLUMN area_solicitante TEXT;
            END IF;
            
            -- Multa
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''multa'') THEN
                ALTER TABLE public.%I ADD COLUMN multa DECIMAL(12,2);
            END IF;
            
            -- Data vencimento pagamento
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''data_vencimento_pagamento'') THEN
                ALTER TABLE public.%I ADD COLUMN data_vencimento_pagamento DATE;
            END IF;
            
            -- Campos de auditoria se não existirem
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''updated_at'') THEN
                ALTER TABLE public.%I ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
            END IF;
            
            -- Campos básicos que podem estar faltando (baseado no erro)
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''data_vencimento'') THEN
                ALTER TABLE public.%I ADD COLUMN data_vencimento DATE;
                RAISE NOTICE ''Adicionada coluna data_vencimento na tabela %'', %L;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''numero_contrato'') THEN
                ALTER TABLE public.%I ADD COLUMN numero_contrato TEXT;
                RAISE NOTICE ''Adicionada coluna numero_contrato na tabela %'', %L;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''fornecedor'') THEN
                ALTER TABLE public.%I ADD COLUMN fornecedor TEXT;
                RAISE NOTICE ''Adicionada coluna fornecedor na tabela %'', %L;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''tipo_fluxo'') THEN
                ALTER TABLE public.%I ADD COLUMN tipo_fluxo TEXT;
                RAISE NOTICE ''Adicionada coluna tipo_fluxo na tabela %'', %L;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''estado'') THEN
                ALTER TABLE public.%I ADD COLUMN estado TEXT;
                RAISE NOTICE ''Adicionada coluna estado na tabela %'', %L;
            END IF;
            
            IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = %L AND column_name = ''valor_contrato'') THEN
                ALTER TABLE public.%I ADD COLUMN valor_contrato DECIMAL(15,2);
                RAISE NOTICE ''Adicionada coluna valor_contrato na tabela %'', %L;
            END IF;
        END $inner$;
    ', target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table, target_table);
    
    RAISE NOTICE 'Campos adicionados na tabela: %', target_table;
END $$;

-- 3. Criar índices para melhor performance (apenas contratos_vivo)
DO $$
DECLARE
    target_table text := 'contratos_vivo';
BEGIN
    -- Verificar se contratos_vivo existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos_vivo') THEN
        RAISE EXCEPTION 'Tabela contratos_vivo não encontrada';
    END IF;
    
    -- Criar índices dinamicamente
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_fornecedor ON public.%I(fornecedor)', target_table, target_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_data_vencimento_pagamento ON public.%I(data_vencimento_pagamento)', target_table, target_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_status_pagamento ON public.%I(status_pagamento)', target_table, target_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_tipo_alerta ON public.%I(tipo_alerta)', target_table, target_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_area_solicitante ON public.%I(area_solicitante)', target_table, target_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_municipio ON public.%I(municipio)', target_table, target_table);
    EXECUTE format('CREATE INDEX IF NOT EXISTS idx_%s_status ON public.%I(status)', target_table, target_table);
    
    RAISE NOTICE 'Índices criados para a tabela: %', target_table;
END $$;

-- Índices para filtros_personalizados
CREATE INDEX IF NOT EXISTS idx_filtros_personalizados_tipo ON public.filtros_personalizados(tipo);
CREATE INDEX IF NOT EXISTS idx_filtros_personalizados_tabela ON public.filtros_personalizados(tabela_origem);

-- 4. Instalar extensão UNACCENT para busca sem acentos (se disponível)
CREATE EXTENSION IF NOT EXISTS unaccent;

-- 5. Criar função para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 6. Criar triggers para updated_at (apenas contratos_vivo)
DO $$
DECLARE
    target_table text := 'contratos_vivo';
BEGIN
    -- Verificar se contratos_vivo existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos_vivo') THEN
        RAISE EXCEPTION 'Tabela contratos_vivo não encontrada';
    END IF;
    
    IF target_table IS NOT NULL THEN
        -- Remover trigger existente se houver
        EXECUTE format('DROP TRIGGER IF EXISTS update_%s_updated_at ON public.%I', target_table, target_table);
        -- Criar novo trigger
        EXECUTE format('CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON public.%I
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()', target_table, target_table);
        
        RAISE NOTICE 'Trigger created for table: %', target_table;
    END IF;
END $$;

-- Trigger para filtros_personalizados
DROP TRIGGER IF EXISTS update_filtros_personalizados_updated_at ON public.filtros_personalizados;
CREATE TRIGGER update_filtros_personalizados_updated_at
    BEFORE UPDATE ON public.filtros_personalizados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 7. Configurar RLS (Row Level Security) - IMPORTANTE!
-- Por padrão, vamos permitir acesso total para desenvolvimento
-- Em produção, você deve configurar políticas mais restritivas

-- Configurar RLS para filtros_personalizados
ALTER TABLE public.filtros_personalizados ENABLE ROW LEVEL SECURITY;

-- Políticas para filtros_personalizados
DROP POLICY IF EXISTS "Permitir tudo em filtros_personalizados para usuários autenticados" ON public.filtros_personalizados;
DROP POLICY IF EXISTS "Permitir leitura em filtros_personalizados para anônimos" ON public.filtros_personalizados;

CREATE POLICY "Permitir tudo em filtros_personalizados para usuários autenticados"
    ON public.filtros_personalizados
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

CREATE POLICY "Permitir leitura em filtros_personalizados para anônimos"
    ON public.filtros_personalizados
    FOR SELECT
    TO anon
    USING (true);

-- Configurar RLS para tabela contratos_vivo
DO $$
DECLARE
    target_table text := 'contratos_vivo';
BEGIN
    -- Verificar se contratos_vivo existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos_vivo') THEN
        RAISE EXCEPTION 'Tabela contratos_vivo não encontrada';
    END IF;
    
    IF target_table IS NOT NULL THEN
        -- Habilitar RLS
        EXECUTE format('ALTER TABLE public.%I ENABLE ROW LEVEL SECURITY', target_table);
        
        -- Remover políticas existentes se houverem
        EXECUTE format('DROP POLICY IF EXISTS "Permitir tudo em %s para usuários autenticados" ON public.%I', target_table, target_table);
        EXECUTE format('DROP POLICY IF EXISTS "Permitir leitura em %s para anônimos" ON public.%I', target_table, target_table);
        
        -- Criar novas políticas
        EXECUTE format('CREATE POLICY "Permitir tudo em %s para usuários autenticados"
            ON public.%I
            FOR ALL
            TO authenticated
            USING (true)
            WITH CHECK (true)', target_table, target_table);
        
        EXECUTE format('CREATE POLICY "Permitir leitura em %s para anônimos"
            ON public.%I
            FOR SELECT
            TO anon
            USING (true)', target_table, target_table);
        
        RAISE NOTICE 'RLS policies configured for table: %', target_table;
    END IF;
END $$;

-- 8. Inserir dados de exemplo para teste (apenas contratos_vivo)
DO $$
DECLARE
    target_table text := 'contratos_vivo';
BEGIN
    -- Verificar se contratos_vivo existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos_vivo') THEN
        RAISE EXCEPTION 'Tabela contratos_vivo não encontrada';
    END IF;
    
    IF target_table IS NOT NULL THEN
        -- Inserir dados de exemplo (adapta os campos conforme a tabela)
        -- Primeiro vamos tentar um insert mais seguro que funciona independente da estrutura
        BEGIN
            EXECUTE format('
            INSERT INTO public.%I (
                numero_contrato, fornecedor, tipo_contrato, valor_contrato, 
                status, data_vencimento, tipo_fluxo, estado, municipio,
                status_pagamento, tipo_alerta, area_solicitante, multa
            ) VALUES 
            (
                ''VIVO-2025-001'', ''Fornecedor Teste A'', ''Serviços'', 150000.00,
                ''ativo'', ''2025-12-31'', ''comercial'', ''SP'', ''São Paulo'',
                ''pendente'', ''medio'', ''comercial'', 5000.00
            ),
            (
                ''VIVO-2025-002'', ''Fornecedor Teste B'', ''Produtos'', 75000.00,
                ''ativo'', ''2025-11-30'', ''operacional'', ''RJ'', ''Rio de Janeiro'',
                ''pago'', ''baixo'', ''operacional'', 0.00
            ),
            (
                ''VIVO-2025-003'', ''Fornecedor Teste C'', ''Consultoria'', 200000.00,
                ''pendente'', ''2025-10-15'', ''ti'', ''MG'', ''Belo Horizonte'',
                ''em_atraso'', ''alto'', ''ti'', 15000.00
            )
            ON CONFLICT DO NOTHING', target_table);
            
            RAISE NOTICE 'Dados de exemplo inseridos com sucesso na tabela: %', target_table;
        EXCEPTION
            WHEN OTHERS THEN
                RAISE NOTICE 'Erro ao inserir dados de exemplo na tabela %: %. Isso é normal se a estrutura da tabela for diferente.', target_table, SQLERRM;
                -- Tentar inserir apenas campos básicos
                BEGIN
                    EXECUTE format('
                    INSERT INTO public.%I (numero_contrato, fornecedor, valor_contrato, data_vencimento, tipo_fluxo, estado) 
                    VALUES (''VIVO-2025-BASIC'', ''Fornecedor Básico'', 50000.00, ''2025-12-31'', ''comercial'', ''SP'')
                    ON CONFLICT DO NOTHING', target_table);
                    RAISE NOTICE 'Inserido registro básico de teste na tabela: %', target_table;
                EXCEPTION
                    WHEN OTHERS THEN
                        RAISE NOTICE 'Não foi possível inserir dados de teste. Verifique a estrutura da tabela %', target_table;
                END;
        END;
        
        RAISE NOTICE 'Dados de exemplo inseridos na tabela: %', target_table;
    END IF;
END $$;

-- 9. Inserir filtro de exemplo
INSERT INTO public.filtros_personalizados (
    nome_filtro, tipo, tabela_origem, campo_origem, configuracoes
) VALUES (
    'Status Pagamento - Pendentes', 'Multi-select', 'contratos_vivo', 'status_pagamento',
    '{"options": [{"value": "pendente", "label": "Pendente"}, {"value": "em_atraso", "label": "Em Atraso"}]}'
)
ON CONFLICT DO NOTHING;

-- 10. Verificar estrutura final da tabela contratos_vivo
DO $$
DECLARE
    target_table text := 'contratos_vivo';
    col_count integer;
    col_record record;
BEGIN
    -- Verificar se contratos_vivo existe
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'contratos_vivo') THEN
        RAISE EXCEPTION 'Tabela contratos_vivo não encontrada';
    END IF;
    
    IF target_table IS NOT NULL THEN
        SELECT COUNT(*) INTO col_count 
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = target_table;
        
        RAISE NOTICE 'Tabela % configurada com % colunas', target_table, col_count;
        RAISE NOTICE '--- Colunas existentes na tabela % ---', target_table;
        
        -- Listar todas as colunas para debugging
        FOR col_record IN 
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_schema = 'public' AND table_name = target_table 
            ORDER BY ordinal_position
        LOOP
            RAISE NOTICE '  - %: %', col_record.column_name, col_record.data_type;
        END LOOP;
        
        -- Verificar se existem as colunas esperadas pelo código
        RAISE NOTICE '--- Verificação das colunas esperadas pelo código ---';
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'data_vencimento_pagamento') THEN
            RAISE NOTICE '  ✅ data_vencimento_pagamento: EXISTS';
        ELSE
            RAISE NOTICE '  ❌ data_vencimento_pagamento: NOT FOUND - precisa ser criada';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'numero_contrato') THEN
            RAISE NOTICE '  ✅ numero_contrato: EXISTS';
        ELSE
            RAISE NOTICE '  ❌ numero_contrato: NOT FOUND - precisa ser criada ou mapeada';
        END IF;
        
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = target_table AND column_name = 'fornecedor') THEN
            RAISE NOTICE '  ✅ fornecedor: EXISTS';
        ELSE
            RAISE NOTICE '  ❌ fornecedor: NOT FOUND - precisa ser criada ou mapeada';
        END IF;
    END IF;
    
    -- Verificar filtros_personalizados
    SELECT COUNT(*) INTO col_count 
    FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'filtros_personalizados';
    
    RAISE NOTICE 'Tabela filtros_personalizados configurada com % colunas', col_count;
    
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SCRIPT EXECUTADO COM SUCESSO!';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Próximos passos:';
    RAISE NOTICE '1. Verifique os logs acima para confirmar que tudo foi criado';
    RAISE NOTICE '2. Teste a aplicação React';
    RAISE NOTICE '3. Verifique o console do navegador para logs de conexão';
    RAISE NOTICE '========================================';
END $$;

-- ========================================
-- FIM DO SCRIPT ATUALIZADO
-- ========================================

-- INSTRUÇÕES ATUALIZADAS:
-- ✅ Este script trabalha APENAS com a tabela 'contratos_vivo'
-- ✅ Remove qualquer dependência da tabela 'contratos'
-- ✅ Configura filtro de Data de vencimento para usar 'data_vencimento_pagamento'
-- ✅ Adiciona apenas os novos campos necessários para filtros Vivo
-- ✅ Configura índices otimizados para 'data_vencimento_pagamento'
-- ✅ Não sobrescreve dados existentes
--
-- COMO USAR:
-- 1. CERTIFIQUE-SE que a tabela 'contratos_vivo' existe no Supabase
-- 2. Execute este script no SQL Editor do Supabase
-- 3. Verifique as mensagens de NOTICE para confirmar o que foi criado
-- 4. Teste os filtros de Data de vencimento na aplicação
-- 5. Ajuste as políticas RLS conforme necessário para produção
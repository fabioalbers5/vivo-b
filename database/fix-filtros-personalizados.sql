-- ========================================
-- Script de correção para filtros_personalizados existente
-- Execute este script no Supabase Dashboard para resolver o erro 406/400
-- ========================================

-- 1. Verificar e corrigir tabela filtros_personalizados existente
DO $$
BEGIN
    -- Adicionar colunas se não existirem
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filtros_personalizados' AND column_name = 'configuracoes') THEN
        ALTER TABLE public.filtros_personalizados ADD COLUMN configuracoes JSONB NOT NULL DEFAULT '{}';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filtros_personalizados' AND column_name = 'criado_em') THEN
        ALTER TABLE public.filtros_personalizados ADD COLUMN criado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'filtros_personalizados' AND column_name = 'atualizado_em') THEN
        ALTER TABLE public.filtros_personalizados ADD COLUMN atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- Remover constraint antiga se existir
    BEGIN
        ALTER TABLE public.filtros_personalizados DROP CONSTRAINT IF EXISTS filtros_personalizados_tipo_check;
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignorar se não existir
    END;
    
    -- Adicionar nova constraint com todos os tipos suportados
    ALTER TABLE public.filtros_personalizados 
    ADD CONSTRAINT filtros_personalizados_tipo_check 
    CHECK (tipo IN ('text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean', 'checkbox', 'radio'));
    
END $$;

-- 2. Criar índices otimizados (apenas se não existirem)
CREATE INDEX IF NOT EXISTS idx_filtros_personalizados_tipo ON public.filtros_personalizados(tipo);
CREATE INDEX IF NOT EXISTS idx_filtros_personalizados_tabela ON public.filtros_personalizados(tabela_origem);
CREATE INDEX IF NOT EXISTS idx_filtros_personalizados_campo ON public.filtros_personalizados(campo_origem);
CREATE INDEX IF NOT EXISTS idx_filtros_personalizados_nome ON public.filtros_personalizados(nome_filtro);

-- 3. Criar função para atualizar timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 4. Criar trigger para atualização automática (apenas se não existir)
DROP TRIGGER IF EXISTS update_filtros_personalizados_updated_at ON public.filtros_personalizados;
CREATE TRIGGER update_filtros_personalizados_updated_at
    BEFORE UPDATE ON public.filtros_personalizados
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 5. Configurar RLS (Row Level Security)
ALTER TABLE public.filtros_personalizados ENABLE ROW LEVEL SECURITY;

-- 6. Criar políticas RLS (apenas se não existirem)
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

-- 7. Tabela pronta para receber filtros criados pela aplicação
-- (Não inserir dados pré-definidos - deixar vazia para os usuários criarem)

-- 8. Verificação final
SELECT 'Tabela filtros_personalizados configurada e pronta para receber filtros da aplicação!' as resultado;
SELECT count(*) as total_filtros_existentes FROM public.filtros_personalizados;
-- ========================================
-- Script MÍNIMO para permitir filtros criados pela aplicação
-- Execute APENAS este comando no Supabase Dashboard
-- ========================================

-- Corrigir constraint do campo tipo para aceitar os valores da aplicação
ALTER TABLE public.filtros_personalizados 
DROP CONSTRAINT IF EXISTS filtros_personalizados_tipo_check;

ALTER TABLE public.filtros_personalizados 
ADD CONSTRAINT filtros_personalizados_tipo_check 
CHECK (tipo IN ('text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean', 'checkbox', 'radio'));

-- Habilitar RLS para permitir acesso da aplicação
ALTER TABLE public.filtros_personalizados ENABLE ROW LEVEL SECURITY;

-- Permitir que aplicação crie filtros
DROP POLICY IF EXISTS "Permitir CRUD de filtros para aplicação" ON public.filtros_personalizados;
CREATE POLICY "Permitir CRUD de filtros para aplicação" 
    ON public.filtros_personalizados 
    FOR ALL 
    USING (true) 
    WITH CHECK (true);

-- Verificar se funcionou
SELECT 'Tabela pronta para receber filtros da aplicação!' as resultado;
-- Execute este comando ÚNICO no Supabase SQL Editor:

ALTER TABLE public.filtros_personalizados 
DROP CONSTRAINT IF EXISTS filtros_personalizados_tipo_check;

ALTER TABLE public.filtros_personalizados 
ADD CONSTRAINT filtros_personalizados_tipo_check 
CHECK (tipo IN ('text', 'number', 'date', 'select', 'multiselect', 'range', 'boolean', 'checkbox', 'radio'));

ALTER TABLE public.filtros_personalizados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Enable all for authenticated users" ON public.filtros_personalizados;
CREATE POLICY "Enable all for authenticated users" 
ON public.filtros_personalizados 
FOR ALL 
USING (true) 
WITH CHECK (true);

SELECT 'Filtros funcionando!' as status;
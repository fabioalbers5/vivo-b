-- Adicionar campo amostra_id à tabela contratos_filtrados
-- Este campo permitirá agrupar contratos por sessão de filtragem

ALTER TABLE public.contratos_filtrados 
ADD COLUMN IF NOT EXISTS amostra_id integer NOT NULL DEFAULT 1;

-- Criar índice para melhorar performance nas consultas por amostra_id
CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_amostra_id 
ON public.contratos_filtrados(amostra_id);

-- Criar índice composto para otimizar busca por amostra_id e mês
CREATE INDEX IF NOT EXISTS idx_contratos_filtrados_amostra_mes 
ON public.contratos_filtrados(amostra_id, mes_referencia);

-- Atualizar RLS policies para incluir o novo campo se necessário
-- (As policies existentes já cobrem o acesso necessário)
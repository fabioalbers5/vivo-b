-- Criar tabela para armazenar metadados dos filtros usados em cada amostra
CREATE TABLE IF NOT EXISTS public.amostras_filtros_metadata (
  id BIGSERIAL PRIMARY KEY,
  amostra_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  
  -- Filtros básicos
  flow_type TEXT[],
  contract_value_min NUMERIC,
  contract_value_max NUMERIC,
  payment_value_min NUMERIC,
  payment_value_max NUMERIC,
  due_date TEXT,
  custom_start DATE,
  custom_end DATE,
  treasury_cycle TEXT,
  
  -- Filtros Vivo específicos
  payment_status TEXT[],
  alert_type TEXT[],
  risk_level TEXT[],
  
  -- Filtros avançados
  supplier_name TEXT[],
  contract_number TEXT[],
  
  -- Configurações da amostragem
  sample_size INTEGER,
  sampling_motor TEXT,
  contract_count INTEGER,
  
  -- Índice único por amostra_id
  UNIQUE(amostra_id)
);

-- Criar índice para melhorar performance
CREATE INDEX IF NOT EXISTS idx_amostras_filtros_amostra_id 
ON public.amostras_filtros_metadata(amostra_id);

-- Enable RLS
ALTER TABLE public.amostras_filtros_metadata ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow public read access to amostras_filtros_metadata" 
ON public.amostras_filtros_metadata 
FOR SELECT 
USING (true);

CREATE POLICY "Allow public insert access to amostras_filtros_metadata" 
ON public.amostras_filtros_metadata 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Allow public update access to amostras_filtros_metadata" 
ON public.amostras_filtros_metadata 
FOR UPDATE 
USING (true);

CREATE POLICY "Allow public delete access to amostras_filtros_metadata" 
ON public.amostras_filtros_metadata 
FOR DELETE 
USING (true);

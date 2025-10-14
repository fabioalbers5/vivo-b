O botão "Adicionar Novos Filtros" deve permitir o usuário escolher o nome do filtro e a coluna da tabela em que esse filtro irá atuar. A tabela será a tabela 'contratos_vivo' do meu banco de dados. O filtro será personalizado de acordo com qual coluna o usuário escolher e essas configuração deverá ser salvo na tabela 'filtros_personalizados'.

Não precisamos oferecer opção para o usuário escolher entre as seguinte colunas, pois os filtros já existem:
numero_contrato, fornecedor, tipo_fluxo, valor_contrato, valor_pagamento, data_vencimento_pagamento, regiao, estado

As opções possíveis devem ser:
status_pagamento: filtro dropdown com as opções 'Aprovado com análise', 'Aprovado em massa', 'Pendente', 'Rejeitado'
tipo_alerta: filtro dropdown com as opções 'Assinatura', 'Cláusulas contraditórias', 'Dados das partes', 'Obrigadoriedades legais', 'Operacional', 'Pagamento'
area_solicitante: filtro dropdown com as opções 'Compras', 'Financeiro', 'Jurídico', 'Logística', 'Marketing', 'RH', 'Operações'
risco: dropdown com as opções 'Baixo', 'Médio', 'Alto'
multa: range financeiro com thumbs nas duas pontas variando entre R$ 0 e R$ 1000000 com passo de R$ 1000, também incluia inputs numérico de valor mínimo e máximo caso o usuário prefira digitar
municipio: input de texto

Faça as configurações para que acentuações e caracteres como 'ç' não interfiram na consulta

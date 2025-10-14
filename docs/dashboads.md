Vamos adicionar um segundo botão para uma segunda tela. O botão deve ser de 'Análise da amostra'.
Essa tela apresentará dashboards para avaliação dos contratos selecionados na filtragem.
Um primeiro container superior apresentará dados de:
Total de contratos da amostra / Numero de contratos com alerta / Porcentagem de alerta
Esse numero de contratos com alerta será a soma dos contratos com 'contratos_vivo.tipo_alerta' != 'Contrato aprovado' 

Um outro container logo abaixo deve apresentar gráficos, esses gráficos ficarão alocados em diferentes abas e o usuário poderá visualizar em cada aba, dentre eles:
Tipo de fluxo: gráfico de barras referente a 'contratos_vivo.tipo_fluxo'
Valor do contrato: gráfico de barras referente a 'contratos_vivo.valor_contrato', esse gráfico deve ser separado com zonas de preço (menor que $100.000, entre R$100.000 e R$500.000, entre R$500.000 e R$1 milhão, entre R$1 milhão e R$3 milhões, entre R$3 milhões e R$5 milhões, entre R$5 milhões e R$8 milhões, maior que R$8 milhões).
Valor do pagamento: gráfico de barras referente a 'contratos_vivo.valor_pagamento', esse gráfico deve ser separado com zonas de preço (menor que $100.000, entre R$100.000 e R$500.000, entre R$500.000 e R$1 milhão, entre R$1 milhão e R$3 milhões, entre R$3 milhões e R$5 milhões, entre R$5 milhões e R$8 milhões, maior que R$8 milhões).
Status do pagamento: gráfico de barras referente a 'contratos_vivo.status_pagamento'
Tipo de alerta: gráfico de barras referente a 'contratos_vivo.tipo_alerta'
Área solicitante:  gráfico de barras referente a 'contratos_vivo.area_solicitante'
Risco:  gráfico de barras referente a 'contratos_vivo.risco'
Multa: gráfico de barras referente a 'contratos_vivo.multa', esse gráfico deve ser separado com zonas de preço (menor que $1.000, entre R$1.000 e R$50.000, entre R$50.000 e R$100.000, entre R$100.000 e R$300.000, entre R$300.000 e R$500.000, entre R$500.000 e R$800.000, maior que R$800.000).
Região:  gráfico de barras referente a 'contratos_vivo.regiao'.
Estado:  gráfico de barras referente a 'contratos_vivo.estado'

Todos os dados dessa página devem ser elaborados de acordo com a amostra que estiver selecionada na tabela de contratos filtrados
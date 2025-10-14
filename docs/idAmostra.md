CONTEXTO:
- Tenho duas tabelas no Supabase: contratos_vivo e contratos_filtrados
- Ambas relacionadas pelo campo "numero_contrato"
- contratos_filtrados tem os campos: numero_contrato, amostra_id, e outros campos relevantes

REQUISITOS:
1. Quando o usuário clicar em "Aplicar Filtros":
   - Buscar o último amostra_id usado na tabela2
   - Incrementar +1 para criar o novo amostra_id
   - Salvar TODOS os contratos selecionados nessa rodada com o mesmo amostra_id
   - Se for a primeira amostra, começar com amostra_id = 1

3. Exemplo do fluxo:
   - 1ª filtragem: 10 contratos → salvos com amostra_id = 1
   - 2ª filtragem: 5 contratos → salvos com amostra_id = 2
   - 3ª filtragem: 8 contratos → salvos com amostra_id = 3

IMPLEMENTAÇÃO:
- Atualizar a função que salva os contratos selecionados
- Garantir tratamento de erros
- Mostrar feedback ao usuário (ex: "Amostra 3 criada com 8 contratos")
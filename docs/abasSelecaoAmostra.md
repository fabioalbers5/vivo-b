Implemente a seguinte melhoria na área de filtros da tela de Seleção de Amostra (seguir rigorosamente os padrões de UI e componentes já existentes no projeto):

Objetivo

A opção de selecionar filtros deve ficar colada à galeria/lista de pagamentos (sem espaçamento grande entre eles).

Cada filtro deve ter Label acima e controle abaixo (drop-down ou combo box, conforme componente padrão do projeto).

A opção selecionada precisa ficar sempre visível para o usuário (fora do menu), para indicar claramente o estado atual dos filtros.

Requisitos de UI/UX

Posicionamento

Renderize o container de filtros imediatamente acima e colado à galeria de pagamentos.

Respeite grid/spacing do design system (usar os tokens/variáveis do projeto).

Estrutura de cada filtro

Label (texto curto, ex.: “Tipo de Fluxo”) acima do controle.

Abaixo do label, use o componente padrão de Select/Combobox do projeto (single-select por padrão; suportar multi-select se o componente já tiver essa capacidade).

Estado visível da seleção

Ao selecionar uma opção, exibir sempre seu valor visível fora do menu:

Para single-select: exibir o valor selecionado no próprio input e um chip/badge logo abaixo do controle (ou ao lado do label, conforme padrão do projeto).

Para multi-select (se suportado): exibir chips/badges empilhados com opção de remover (X).

Incluir um Clear/“Limpar” por filtro (ícone ou link) para retirar a seleção rapidamente.

Resumo compacto (opcional e colado à galeria)

Abaixo da fileira de filtros e imediatamente acima da galeria, renderizar uma faixa de resumo com os filtros ativos (chips).

Exemplo: Tipo de Fluxo: Proposta, Vencimento: Out/2025–Jan/2026.

Se nenhum filtro estiver ativo, não renderizar a faixa.

Acessibilidade e responsividade

Associar label e aria-describedby ao controle.

Teclado: abrir/fechar, navegar e selecionar via teclado.

Em telas estreitas, alinhar filtros em uma coluna, mantendo label acima e chips logo abaixo do controle.

Manter contraste e tamanhos conforme DS.

Persistência (se já houver no projeto)

Persistir filtros selecionados (ex.: URL query params ou store) e restaurar ao reabrir a tela.

Mensagens e placeholders

Placeholder neutro: “Selecione…”.

Quando sem seleção, não mostrar chip.

Quando houver erro/validação, usar o padrão de erro do form do projeto.

Aceite / Critérios de Teste

O container de filtros está colado à galeria (sem “buraco” visual).

Cada filtro exibe label acima e o valor selecionado é sempre visível fora do menu.

Existe forma clara e rápida de limpar a seleção (por filtro).

Em multi-select (se aplicável), todas as seleções aparecem como chips removíveis.

O resumo compacto (chips) aparece apenas quando existem filtros ativos.

Totalmente navegável por teclado e com aria-* corretos.

Mantém os padrões de tipografia, espaçamento, cores e componentes do projeto.

Notas técnicas

Reutilize os componentes do DS: FormField, Label, Select/Combobox, Chip/Badge, IconButton (close).

Componentize: FilterField (label+controle+chips), ActiveFiltersBar (resumo colado).

Expor data-testid em FilterField e nos chips para testes.

Não alterar estilos via CSS ad-hoc; usar tokens/utilitários do projeto.
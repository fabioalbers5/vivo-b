Contexto: Tela Seleção da Amostra da aplicação “Verificação Inteligente de Pagamentos”.
Importante: NÃO mudar regras de negócio, APIs, queries ou lógica dos motores. A alteração é apenas de UI/UX. Siga rigorosamente nosso Design System (cores, tipografia, espaçamentos, componentes).

🎯 Objetivo

Reduzir camadas para aplicar filtro: os filtros devem ficar logo acima e colados à galeria/lista de pagamentos (sem ter que abrir painel/nível extra).

Estado sempre visível: quando houver filtros selecionados, o usuário vê quais são sem abrir nada (chips/resumo inline).

Manter funcionalidades existentes (mesmos filtros, mesmos eventos, mesma integração de dados).

🧩 Requisitos de UI

Posicionamento: Renderize um container de filtros imediatamente acima da tabela/galeria. Remova a necessidade de clicar em “Filtros” para abrir outro nível.

Estrutura do filtro: Para cada filtro existente (Tipo de Fluxo, Data de Vencimento, Ciclo de Tesouraria, Valor do Pagamento, Valor do Contrato, Nível de Risco, Tipo de Alerta, etc.):

Label visível (ex.: “Tipo de Fluxo”) acima do controle.

Abaixo do label, use o componente padrão Select/Combobox (single ou multi conforme já implementado).

Placeholder: “Selecione…”.

Estado visível da seleção (fora do menu):

Single-select: mostrar o valor no input e um chip/badge logo abaixo do controle (ou ao lado do label, conforme nosso padrão).

Multi-select: chips/badges para cada valor, com ícone X para remover.

Barra de resumo de filtros ativos: uma faixa compacta entre o container de filtros e a galeria listando chips do tipo Campo: Valor. Incluir ação “Limpar todos” (mantendo a que já existe).

Ações por filtro:

Botão/link “Limpar” por filtro (reseta apenas aquele campo).

Tooltip curto no label explicando o campo (se já existir texto de ajuda).

Visual/Spacing: Container de filtros colado à galeria (use tokens/spacing do DS; evitar “buraco” visual). Respeitar grid atual.

♿ Acessibilidade e Responsividade

label associado ao controle (htmlFor/aria-labelledby), aria-expanded, aria-controls no dropdown.

Navegação 100% por teclado (abrir/fechar/select).

Em telas estreitas, uma coluna: label acima, controle abaixo, chips logo em seguida.

🔁 Estado e Persistência (sem alterar back-end)

Continuar usando o mesmo estado/fonte de verdade dos filtros (store/context/hooks atuais).

Se já persistimos em URL/localStorage, preservar.

A barra de resumo deve refletir em tempo real o estado global dos filtros.

🧪 Critérios de Aceite

Os filtros aparecem sempre visíveis logo acima da galeria; não é preciso abrir camadas.

Ao selecionar, o valor fica visível (input + chip).

A barra de resumo mostra todos os filtros ativos; “Limpar todos” limpa e a galeria atualiza.

“Limpar” por filtro remove apenas aquele filtro.

Nada de regressão: resultados, contadores e ações (Gerar amostra, Finalizar) continuam iguais.

Padrões do Design System preservados (cores, ícones, tipografia, espaçamentos).

Testes manuais: teclado, screen reader básico, e layouts desktop/mobile.

🏗️ Técnica (orientação)

Reutilizar componentes existentes do DS: FormField, Label, Select/Combobox, Chip/Badge, IconButton (close), InlineAlert (para “Filtros ativos”).

Criar componentes leves e desacoplados:

FilterField (label + controle + chips + limpar)

ActiveFiltersBar (lista de chips + “Limpar todos”)

FiltersContainer (grid responsivo, colado à galeria)

Não criar CSS ad-hoc; usar tokens/utilitários do projeto.

Expor data-testid em:

filters-container, active-filters-bar, filter-field-[nome], chip-[campo]-[valor], clear-filter-[campo], clear-all-filters.

✅ Entregáveis

Código refatorado com o novo container de filtros colado à galeria.

Barra de resumo funcional.

Sem mudanças em APIs/queries/motores.

Pequenos testes unitários/RTL para FilterField e ActiveFiltersBar (interação de seleção e limpar).
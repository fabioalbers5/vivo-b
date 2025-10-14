Estou implementando uma aplicação de análise de contratos.

Contexto do sistema:
- Tenho uma tabela principal `contratos_vivo` onde estão armazenados todos os contratos.
- Criei uma nova tabela auxiliar `contratos_filtrados` com a seguinte estrutura:

CREATE TABLE contratos_filtrados (
    id SERIAL PRIMARY KEY,
    numero_contrato INT NOT NULL,
    mes_referencia CHAR(7) NOT NULL,
    data_analise TIMESTAMP DEFAULT NOW(),
    usuario VARCHAR(100) NULL,
    UNIQUE (numero_contrato, mes_referencia),
    FOREIGN KEY (numero_contrato) REFERENCES contratos_vivo(numero_contrato)
);

- Minha aplicação já possui a lógica de filtragem diária de contratos. Ela seleciona X contratos por dia.
- Agora preciso garantir que, após selecionar os contratos, eles sejam salvos em `contratos_filtrados` para que não apareçam novamente no mesmo mês.

O que você deve fazer:
1. Implementar uma função que, ao receber a lista de contratos filtrados, insira no banco os registros correspondentes em `contratos_filtrados`. 
   - Essa função deve detectar automaticamente o mês corrente no formato MM-AAAA, que será salvo em 'contratos_filtrados.mes_referencia' .
   - Utilizar lógica idempotente (`ON CONFLICT DO NOTHING` ou equivalente no SQLAlchemy) para evitar duplicações.
   - O contratos_filtrados.numero_contrato deve ser referente ao contratos_vivo.numero_contrato.
   - contratos_filtrados.data_analise é a data da filtragem no formato DD-MM-AAAA
   - contratos_filtrados.usuario pode preencher sempre com 'fabio'
3. Manter a estrutura de filtragem já existente sem reimplementar, apenas adicionar o passo de persistência.

Saída esperada:
- Código Python bem estruturado e comentado.
- Uma função clara chamada, por exemplo, `registrar_contratos_filtrados(contratos, usuario)` para salvar os contratos filtrados do dia.
- Exemplo de uso completo: pegar a lista de contratos filtrados e registrar.

Não reescreva minha parte de filtragem, apenas mostre como persistir corretamente os contratos no banco em `contratos_filtrados`.
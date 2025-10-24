# 🎯 Filtros Mock - Valores Reais para Teste

## ✅ Script Atualizado com Valores da Aplicação

Os dados mock foram atualizados para usar **valores exatos** que a aplicação reconhece e pode aplicar corretamente.

---

## 📋 Detalhamento das 8 Amostras

### 🔹 Amostra 1: **2024-10-15**
**Tema**: RE e FI com pagamentos milionários e ciclo de tesouraria

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | RE, FI |
| **Valor Contrato** | R$ 0 - R$ 10.000.000 |
| **Valor Pagamento** | R$ 3.000.000 - R$ 6.000.000 ⭐ |
| **Ciclo Tesouraria** | Sim ⭐ |
| **Status Pagamento** | Pendente, Aprovado com análise |
| **Tipo de Alerta** | Pagamento, Operacional |
| **Risco** | Alto, Médio |
| **Motor** | Highest Value (Maior Valor) |
| **Tamanho** | 25 contratos |

**Use para testar**: Filtros de valor de pagamento específico + ciclo tesouraria "Sim"

---

### 🔹 Amostra 2: **2024-09-20**
**Tema**: Real State com alertas legais e sem ciclo

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | Real State |
| **Valor Contrato** | R$ 500.000 - R$ 5.000.000 |
| **Valor Pagamento** | R$ 0 - R$ 10.000.000 |
| **Ciclo Tesouraria** | Não ⭐ |
| **Status Pagamento** | Rejeitado, Pendente |
| **Tipo de Alerta** | Clausulas contraditorias, Dados das partes, Obrigatoriedades legais ⭐ |
| **Risco** | Alto |
| **Motor** | Stratified (Estratificado) |
| **Tamanho** | 15 contratos |

**Use para testar**: Múltiplos alertas legais + ciclo "Não"

---

### 🔹 Amostra 3: **2024-08-10**
**Tema**: Proposta e Engenharia com baixo risco

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | Proposta, Engenharia ⭐ |
| **Valor Contrato** | R$ 0 - R$ 2.000.000 |
| **Valor Pagamento** | R$ 0 - R$ 1.500.000 |
| **Ciclo Tesouraria** | Todos (all) |
| **Status Pagamento** | Aprovado em massa, Aprovado com análise |
| **Tipo de Alerta** | Contrato aprovado, Assinatura |
| **Risco** | Baixo ⭐ |
| **Motor** | Random (Aleatório) |
| **Tamanho** | 30 contratos |

**Use para testar**: Tipos menos comuns (Proposta/Engenharia) + risco baixo

---

### 🔹 Amostra 4: **2024-07-25**
**Tema**: Todos os tipos com valores altíssimos

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | Todos (sem filtro) |
| **Valor Contrato** | R$ 5.000.000 - R$ 10.000.000 ⭐ |
| **Valor Pagamento** | R$ 4.000.000 - R$ 10.000.000 ⭐ |
| **Ciclo Tesouraria** | Sim |
| **Status Pagamento** | Rejeitado |
| **Tipo de Alerta** | Pagamento, Clausulas contraditorias, Obrigatoriedades legais |
| **Risco** | Alto, Médio |
| **Motor** | Highest Value |
| **Tamanho** | 10 contratos |

**Use para testar**: Filtro de valores muito altos + sem filtro de tipo

---

### 🔹 Amostra 5: **2024-06-15**
**Tema**: RC com período customizado e fornecedores

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | RC ⭐ |
| **Valor Contrato** | R$ 1.000.000 - R$ 4.000.000 |
| **Valor Pagamento** | R$ 800.000 - R$ 3.500.000 |
| **Período** | Custom: 01/06/2024 - 30/06/2024 ⭐ |
| **Ciclo Tesouraria** | Não |
| **Status Pagamento** | Pendente, Aprovado com análise |
| **Tipo de Alerta** | Dados das partes, Operacional |
| **Risco** | Médio |
| **Fornecedores** | Empresa A Ltda, Empresa B S.A. ⭐ |
| **Motor** | Stratified |
| **Tamanho** | 20 contratos |

**Use para testar**: Datas customizadas + filtro de fornecedor

---

### 🔹 Amostra 6: **2024-05-08**
**Tema**: FI e Proposta com aprovação em massa

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | FI, Proposta |
| **Valor Contrato** | R$ 100.000 - R$ 2.500.000 |
| **Valor Pagamento** | R$ 50.000 - R$ 2.000.000 |
| **Ciclo Tesouraria** | Todos (all) |
| **Status Pagamento** | Aprovado em massa ⭐ |
| **Tipo de Alerta** | Assinatura |
| **Risco** | Baixo, Médio |
| **Motor** | Random |
| **Tamanho** | 50 contratos |

**Use para testar**: Status "Aprovado em massa" + alerta único

---

### 🔹 Amostra 7: **2024-04-18**
**Tema**: Múltiplos tipos com alto risco

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | RE, Engenharia, Real State ⭐ |
| **Valor Contrato** | R$ 2.000.000 - R$ 8.000.000 |
| **Valor Pagamento** | R$ 1.500.000 - R$ 7.000.000 |
| **Ciclo Tesouraria** | Sim |
| **Status Pagamento** | Pendente, Aprovado com análise, Rejeitado ⭐ |
| **Tipo de Alerta** | Pagamento, Operacional, Clausulas contraditorias |
| **Risco** | Alto |
| **Motor** | Highest Value |
| **Tamanho** | 18 contratos |

**Use para testar**: Combinação de 3 tipos + múltiplos status

---

### 🔹 Amostra 8: **2024-03-12**
**Tema**: Apenas contratos específicos por número

| Filtro | Valor |
|--------|-------|
| **Tipo de Fluxo** | Todos (sem filtro) |
| **Valor Contrato** | R$ 0 - R$ 10.000.000 (sem limite) |
| **Valor Pagamento** | R$ 0 - R$ 10.000.000 (sem limite) |
| **Ciclo Tesouraria** | Todos (all) |
| **Status Pagamento** | Todos (sem filtro) |
| **Tipo de Alerta** | Todos (sem filtro) |
| **Risco** | Todos (sem filtro) |
| **Números Contrato** | CT-2025-001, CT-2025-002, CT-2025-003 ⭐ |
| **Motor** | Highest Value |
| **Tamanho** | 12 contratos |

**Use para testar**: Filtro exclusivo por números de contrato

---

## 🎯 Valores Válidos na Aplicação

### Tipos de Fluxo
- `RE` - Receita
- `Real State` - Imobiliário
- `FI` - Financeiro
- `Proposta` - Comercial
- `Engenharia` - Técnico
- `RC` - Recursos

### Ciclo Tesouraria
- `all` - Todos
- `Sim` - Sim
- `Não` - Não

### Status de Pagamento
- `Aprovado com análise`
- `Aprovado em massa`
- `Pendente`
- `Rejeitado`

### Tipo de Alerta
- `Assinatura`
- `Clausulas contraditorias`
- `Contrato aprovado`
- `Dados das partes`
- `Obrigatoriedades legais`
- `Operacional`
- `Pagamento`

### Nível de Risco
- `Baixo`
- `Médio`
- `Alto`

### Motor de Amostragem
- `highest-value` - Maior Valor
- `random` - Aleatório
- `stratified` - Estratificado

---

## 🧪 Como Testar

### Teste 1: Amostra com Pagamento Milionário
```
1. Abra o Histórico
2. Localize amostra 2024-10-15
3. Clique em "Reutilizar"
4. Verifique:
   ✓ Tipo de Fluxo: RE e FI selecionados
   ✓ Valor Pagamento: 3M a 6M
   ✓ Ciclo Tesouraria: "Sim"
```

### Teste 2: Amostra com Datas Customizadas
```
1. Abra o Histórico
2. Localize amostra 2024-06-15
3. Clique em "Ver Detalhes"
4. Verifique na seção "Filtros Utilizados":
   ✓ Período: 01/06/2024 até 30/06/2024
   ✓ Fornecedores: Empresa A Ltda, Empresa B S.A.
5. Clique em "Reutilizar Critérios"
6. Confirme que os filtros foram aplicados
```

### Teste 3: Amostra sem Filtros (Todos)
```
1. Abra o Histórico
2. Localize amostra 2024-03-12
3. Clique em "Ver Detalhes"
4. Verifique:
   ✓ Tipo de Fluxo: "Todos"
   ✓ Status: "Todos"
   ✓ Alerta: "Todos"
   ✓ Risco: "Todos"
   ✓ Números Contrato: CT-2025-001, CT-2025-002, CT-2025-003
```

---

## ✅ Checklist de Verificação

- [ ] **Tipos de Fluxo**: RE, FI, Real State, Proposta, Engenharia, RC aparecem corretamente
- [ ] **Ciclo Tesouraria**: "Sim", "Não" e "Todos" são exibidos e aplicados
- [ ] **Status Pagamento**: "Aprovado com análise", "Aprovado em massa", "Pendente", "Rejeitado" funcionam
- [ ] **Alertas**: Todos os 7 tipos aparecem nos filtros
- [ ] **Riscos**: Baixo, Médio, Alto são aplicados corretamente
- [ ] **Valores**: Ranges de R$ 3M-6M são aplicados
- [ ] **Datas Custom**: Período 01/06-30/06/2024 funciona
- [ ] **Fornecedores**: Lista de fornecedores é aplicada
- [ ] **Números Contrato**: CT-2025-001, etc. são filtrados
- [ ] **Arrays Vazios**: "Todos" é exibido quando não há filtro

---

## 🐛 Se algo não funcionar

### Filtros não aparecem nos detalhes
1. Verifique se a migration foi executada
2. Confirme que o script de insert foi rodado
3. Execute no SQL Editor:
   ```sql
   SELECT * FROM public.amostras_filtros_metadata 
   WHERE amostra_id = '2024-10-15';
   ```

### Filtros não são aplicados ao reutilizar
1. Abra o Console do navegador (F12)
2. Procure por erros em vermelho
3. Verifique se o `as any` está no código TypeScript
4. Confirme que os valores correspondem aos enums

### Valores aparecem "undefined" ou "null"
- Provavelmente a migration não foi executada
- Execute primeiro: `20251024_sample_filters_metadata.sql`
- Depois: `20251024_insert_mock_filter_metadata.sql`

---

**Última atualização**: 24/10/2024  
**Valores**: 100% compatíveis com a aplicação  
**Status**: ✅ Pronto para uso

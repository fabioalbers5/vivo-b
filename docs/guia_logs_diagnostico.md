# 🔍 Guia de Logs - Sistema de Contratos Filtrados

## 📊 Logs Implementados

O sistema agora possui logs detalhados para diagnosticar problemas na inserção automática de contratos filtrados.

### 🚀 **Logs do PaymentVerificationApp.tsx**

Quando você aplicar filtros e criar uma amostra, verá:

```javascript
// Início do processo
🚀 [PAYMENT_APP] Iniciando registro de contratos filtrados: {
  totalContratos: 45,
  usuario: 'fabio',
  primeiros5: ['CT-2024-001', 'CT-2024-002', ...]
}

// Resultado do processo
✅ [PAYMENT_APP] Resultado do registro: {
  sucesso: true,
  novos_registros: 12,
  duplicados_ignorados: 33,
  mes_referencia: "10-2025",
  ...
}

// Confirmação na tela
✅ Contratos registrados com sucesso: 12 novos, 33 duplicados
```

### 📋 **Logs do ContratosFiltradosClient.ts**

Para cada contrato processado:

```javascript
// Processamento individual
📋 Processando contrato: {
  contrato: { id: '1', number: 'CT-2024-001', ... },
  numeroExtraido: 'CT-2024-001',
  camposDisponiveis: ['id', 'number', 'supplier', ...]
}

// Preparação dos registros
📋 [CONTRATOS_FILTRADOS] Preparando registros: {
  totalRegistros: 45,
  mesReferencia: "10-2025",
  usuario: "fabio",
  todosContratos: ['CT-2024-001', 'CT-2024-002', ...]
}

// Verificação de duplicados
🔍 [CONTRATOS_FILTRADOS] Verificação de existentes: {
  existentes: [{ numero_contrato: 'CT-2024-001' }],
  quantidadeExistentes: 1,
  contratosConsultados: 45
}

// Inserção no banco
➕ [CONTRATOS_FILTRADOS] Novos registros para inserir: {
  quantidade: 12,
  todosNovos: ['CT-2024-002 (10-2025)', 'CT-2024-003 (10-2025)', ...]
}

// Resultado da inserção
💾 [CONTRATOS_FILTRADOS] Resultado da inserção: {
  data: [{ id: 123 }, { id: 124 }, ...],
  quantidadeInserida: 12,
  idsInseridos: [123, 124, 125, ...]
}

// Resumo final
✅ [CONTRATOS_FILTRADOS] REGISTRO CONCLUÍDO: {
  resultado: { sucesso: true, novos_registros: 12, ... },
  resumo: "12 novos, 33 duplicados ignorados de 45 contratos"
}
```

## 🔧 **Como Diagnosticar Problemas**

### 1. **Problema: Nenhum contrato registrado**
Verifique se aparecem logs de contratos rejeitados:
```javascript
⚠️ [CONTRATOS_FILTRADOS] Contratos rejeitados: {
  quantidade: 45,
  detalhes: [{ contrato: {...}, motivo: 'Número do contrato não encontrado' }]
}
```
**Solução:** Os contratos não têm campo `number`, `id`, `numero_contrato` ou `numeroContrato` válido.

### 2. **Problema: Erro na inserção**
Procure por logs de erro:
```javascript
❌ [CONTRATOS_FILTRADOS] ERRO na inserção: {
  error: { message: "...", code: "...", details: "..." }
}
```
**Soluções:**
- Tabela não existe → Execute o script SQL
- Tipo de campo errado → Execute script de migração
- Problemas de permissão → Verifique configuração do Supabase

### 3. **Problema: Função não é chamada**
Se não aparecer o log inicial, verifique se:
- Você está aplicando filtros E criando amostra
- O componente PaymentVerificationApp está sendo usado
- Não há erros de JavaScript no console

## 🎯 **Fluxo Esperado (Sucesso)**

1. **Usuário aplica filtros** → Seleciona contratos
2. **Clica "Aplicar Filtros"** → Cria amostra representativa
3. **Sistema detecta criação da amostra** → Chama registrarContratosFiltrados
4. **Logs aparecem em sequência:**
   ```
   🚀 [PAYMENT_APP] Iniciando registro...
   🔍 [CONTRATOS_FILTRADOS] Processando contratos individuais...
   📋 Processando contrato: (para cada contrato)
   📋 [CONTRATOS_FILTRADOS] Preparando registros...
   🔍 [CONTRATOS_FILTRADOS] Verificação de existentes...
   ➕ [CONTRATOS_FILTRADOS] Novos registros para inserir...
   💾 [CONTRATOS_FILTRADOS] Resultado da inserção...
   ✅ [CONTRATOS_FILTRADOS] REGISTRO CONCLUÍDO...
   ✅ [PAYMENT_APP] Resultado do registro...
   ```
5. **Toast de sucesso aparece** → "📊 Contratos Registrados"
6. **Dados salvos no Supabase** → Tabela contratos_filtrados

## 🛠️ **Comandos para Verificar no Supabase**

```sql
-- Ver registros recentes
SELECT * FROM contratos_filtrados 
ORDER BY data_analise DESC 
LIMIT 10;

-- Contar por mês
SELECT mes_referencia, COUNT(*) 
FROM contratos_filtrados 
GROUP BY mes_referencia;

-- Ver todos os campos
SELECT 
    numero_contrato,
    mes_referencia,
    usuario,
    data_analise
FROM contratos_filtrados 
WHERE mes_referencia = '10-2025';
```

## ⚠️ **Mensagens de Erro Comuns**

| Erro | Causa | Solução |
|------|-------|---------|
| `relation "contratos_filtrados" does not exist` | Tabela não criada | Execute script SQL |
| `column "numero_contrato" is of type integer` | Tipo errado | Execute migração |
| `null value in column "numero_contrato"` | Contratos sem ID | Verifique estrutura dos dados |
| `duplicate key value violates unique constraint` | Tentativa de duplicação | Normal, será ignorado |

## 🏁 **Teste Rápido**

1. Abra Developer Tools (F12)
2. Vá para a aba Console
3. Aplique qualquer filtro na aplicação
4. Clique "Aplicar Filtros"
5. Verifique se aparecem os logs em sequência
6. Vá no Supabase e confirme os dados na tabela
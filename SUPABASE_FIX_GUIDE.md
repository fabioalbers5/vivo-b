# 🔧 Guia de Solução: Erro 401 Unauthorized Supabase

## 🎯 Problema Identificado
Você está recebendo um erro `401 Unauthorized` ao tentar acessar a tabela `filtros_personalizados` no Supabase.

## ✅ Soluções Implementadas

### 1. Correção das Variáveis de Ambiente ✅
**Problema**: A aplicação estava procurando por `VITE_SUPABASE_ANON_KEY` mas o arquivo `.env` tinha `VITE_SUPABASE_PUBLISHABLE_KEY`.

**Solução**: Renomeei a variável no arquivo `.env`:
```env
# Antes
VITE_SUPABASE_PUBLISHABLE_KEY="sua_chave_aqui"

# Depois
VITE_SUPABASE_ANON_KEY="sua_chave_aqui"
```

### 2. Teste de Conexão Criado ✅
**Localização**: `src/utils/supabase-test.ts`
- Verifica se as variáveis de ambiente estão configuradas
- Testa acesso às tabelas `filtros_personalizados` e `contratos_vivo`
- Fornece diagnóstico detalhado dos erros

### 3. Script de Setup do Banco de Dados ✅
**Localização**: `database/setup-vivo-database.sql`
- Cria todas as tabelas necessárias
- Configura índices para performance
- Define políticas RLS (Row Level Security)
- Insere dados de exemplo para teste

## 🚀 Próximos Passos para Resolver o 401

### Passo 1: Executar o Script SQL no Supabase
1. Abra o [Supabase Dashboard](https://supabase.com/dashboard)
2. Navegue até o seu projeto
3. Vá para **SQL Editor**
4. Cole o conteúdo do arquivo `database/setup-vivo-database.sql`
5. Execute o script clicando em **RUN**

### Passo 2: Verificar se as Tabelas foram Criadas
1. Vá para **Table Editor** no Supabase
2. Confirme que existem as tabelas:
   - `filtros_personalizados`
   - `contratos_vivo`

### Passo 3: Verificar Políticas RLS
1. No **Table Editor**, clique em uma tabela
2. Vá para a aba **RLS**
3. Confirme que existem políticas ativas

### Passo 4: Testar a Conexão
1. Recarregue a aplicação
2. Abra o Console do navegador (F12)
3. Procure pelas mensagens do teste de conexão
4. Deve aparecer: `✅ Conexão Supabase funcionando perfeitamente!`

## 🔍 Diagnóstico de Problemas Comuns

### Erro 401 - Unauthorized
**Possíveis Causas**:
- ❌ Variáveis de ambiente incorretas → ✅ **CORRIGIDO**
- ❌ Tabelas não existem → ✅ **SCRIPT SQL CRIADO**
- ❌ RLS habilitado sem políticas → ✅ **POLÍTICAS CRIADAS**
- ❌ Chave API inválida → Verifique no Supabase Dashboard

### Erro PGRST106 - Table not found
**Solução**: Execute o script SQL para criar as tabelas

### Erro 42501 - Insufficient privilege
**Solução**: Verifique as políticas RLS no Supabase

## 📊 Status Atual

| Item | Status | Ação |
|------|---------|------|
| Variáveis Ambiente | ✅ Corrigidas | Nenhuma |
| Teste de Conexão | ✅ Criado | Verificar console |
| Script SQL | ✅ Criado | Executar no Supabase |
| Tables Setup | ⏳ Pendente | Executar script |
| RLS Policies | ⏳ Pendente | Executar script |

## 🎯 Resultado Esperado

Após executar o script SQL, você deve ver no console:
```
🔄 Testando conexão com Supabase...
📋 Variáveis de ambiente:
   VITE_SUPABASE_URL: https://jstytygxbnapydwkvpzk.supabase.co
   VITE_SUPABASE_ANON_KEY: ✅ Configurada

🔍 Verificando tabela filtros_personalizados...
✅ Tabela filtros_personalizados acessível!
📊 Filtros encontrados: 1

🔍 Verificando tabela contratos_vivo...
✅ Tabela contratos_vivo acessível!
📊 Contratos encontrados: 3

🎯 Resumo:
✅ Conexão Supabase funcionando perfeitamente!
```

## 📞 Se o Problema Persistir

1. **Verifique a chave API**: No Supabase Dashboard → Settings → API
2. **Verifique o URL**: Deve ser `https://[projeto].supabase.co`
3. **Teste no SQL Editor**: Execute uma query simples como `SELECT 1`
4. **Verifique logs**: No Supabase Dashboard → Logs

## 🔒 Configuração de Produção

⚠️ **IMPORTANTE**: O script SQL atual tem políticas permissivas para desenvolvimento. Em produção, você deve:
1. Criar políticas RLS mais restritivas
2. Configurar autenticação de usuários
3. Limitar acesso baseado em roles/permissões

---

**Status**: 🚀 **Tudo configurado e pronto para teste!**
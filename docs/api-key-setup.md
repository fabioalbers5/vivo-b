# Como Configurar sua API KEY do Supabase

## Passos para Configuração

### 1. Criar arquivo .env

Na raiz do projeto, crie um arquivo `.env` (se ainda não existir):

```bash
# Na raiz do projeto: vivo-contract-insight-main/
touch .env
```

### 2. Adicionar suas credenciais

Abra o arquivo `.env` e adicione suas credenciais do Supabase:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://jstytygxbnapydwkvpzk.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_API_KEY_AQUI
```

**⚠️ IMPORTANTE**: Substitua `SUA_API_KEY_AQUI` pela sua chave real do Supabase.

### 3. Encontrar sua API Key no Supabase

1. Acesse [https://supabase.com](https://supabase.com)
2. Faça login na sua conta
3. Acesse seu projeto: `jstytygxbnapydwkvpzk`
4. Vá em **Settings** → **API**
5. Copie a **anon public** key

### 4. Verificar se está funcionando

Após configurar a `.env`, inicie o servidor de desenvolvimento:

```bash
npm run dev
```

Se configurado corretamente, você **NÃO** verá mais a mensagem:
```
⚠️ Using placeholder API_KEY. Please set VITE_SUPABASE_ANON_KEY in your .env file
```

### 5. Testar a integração

Use os exemplos criados em `src/examples/supabase-integration-examples.ts` para testar a integração.

## Estrutura Final dos Arquivos

```
vivo-contract-insight-main/
├── .env                          # ← Suas credenciais aqui
├── .env.example                  # ← Template de exemplo
├── src/
│   ├── core/                     # ← Clean Architecture
│   ├── infra/                    # ← Repositories e DI
│   ├── integrations/supabase/    # ← Cliente configurado
│   ├── hooks/                    # ← Hooks atualizados
│   └── examples/                 # ← Exemplos de uso
└── docs/
    └── supabase-integration.md   # ← Documentação completa
```

## ✅ Funcionalidades Implementadas

- **✅ Client Supabase** configurado com variáveis de ambiente
- **✅ Clean Architecture** com repositories e services
- **✅ Entities e Types** bem definidos
- **✅ Hooks atualizados** para usar a nova arquitetura
- **✅ Validações** de negócio implementadas
- **✅ Tratamento de erros** robusto
- **✅ Documentação** completa
- **✅ Exemplos** de uso práticos

## 🔧 Como Usar

```typescript
import { contractService, customFilterService } from '@/infra/di/container';

// Buscar contratos
const contracts = await contractService.getAllContracts();

// Criar novo contrato
const newContract = await contractService.createContract({
  numeroContrato: 'CT-2024-001',
  fornecedor: 'Fornecedor Teste',
  valorContrato: 50000,
  dataVencimento: new Date('2024-12-31'),
  tipoFluxo: 'RE',
  estado: 'SP'
});

// Filtros avançados
const filtered = await contractService.getContractsByFilters({
  estado: ['SP', 'RJ'],
  valorMin: 10000,
  valorMax: 100000
});
```

**Pronto! Sua aplicação está 100% integrada com Supabase seguindo as melhores práticas de engenharia de software! 🚀**
# Integração Supabase - Vivo Contract Insight

## Visão Geral

A aplicação foi integrada completamente com o Supabase seguindo os princípios de **Clean Architecture** e **boas práticas de engenharia de software**.

## Arquitetura Implementada

```
src/
├── core/                          # Domínio e regras de negócio
│   ├── entities/                  # Entidades de domínio
│   │   ├── Contract.ts           # Entidade Contract e tipos relacionados
│   │   └── CustomFilter.ts       # Entidade CustomFilter e tipos relacionados
│   ├── repositories/              # Interfaces dos repositories
│   │   ├── IContractRepository.ts # Interface para operações de contrato
│   │   └── ICustomFilterRepository.ts # Interface para filtros personalizados
│   └── services/                  # Services com regras de negócio
│       ├── ContractService.ts     # Lógica de negócio para contratos
│       └── CustomFilterService.ts # Lógica de negócio para filtros
├── infra/                         # Infraestrutura e implementações
│   ├── repositories/              # Implementações dos repositories
│   │   ├── SupabaseContractRepository.ts # Repository de contratos usando Supabase
│   │   └── SupabaseCustomFilterRepository.ts # Repository de filtros usando Supabase
│   └── di/                        # Injeção de dependência
│       └── container.ts           # Container DI com singleton pattern
└── integrations/supabase/         # Configuração do Supabase
    ├── client.ts                  # Cliente configurado com variáveis de ambiente
    └── types.ts                   # Tipos gerados automaticamente
```

## Configuração

### 1. Variáveis de Ambiente

Copie o arquivo `.env.example` para `.env` e configure suas credenciais:

```bash
cp .env.example .env
```

Configure no arquivo `.env`:
```
VITE_SUPABASE_URL=https://jstytygxbnapydwkvpzk.supabase.co
VITE_SUPABASE_ANON_KEY=sua_api_key_aqui
```

### 2. Instalação de Dependências

As dependências do Supabase já foram instaladas:
```bash
npm install @supabase/supabase-js
```

## Como Usar

### Importando Services

```typescript
import { contractService, customFilterService } from '@/infra/di/container';
```

### Operações com Contratos

```typescript
// Buscar todos os contratos
const contracts = await contractService.getAllContracts();

// Buscar contratos com filtros
const filters = {
  estado: ['SP', 'RJ'],
  valorMin: 10000,
  valorMax: 100000
};
const filteredContracts = await contractService.getContractsByFilters(filters);

// Criar novo contrato
const newContract = await contractService.createContract({
  numeroContrato: 'CT-2024-001',
  fornecedor: 'Fornecedor Teste',
  valorContrato: 50000,
  dataVencimento: new Date('2024-12-31'),
  tipoFluxo: 'RE',
  estado: 'SP'
});

// Buscar contratos vencidos
const overdueContracts = await contractService.getOverdueContracts();

// Obter estatísticas
const stats = await contractService.getContractStatistics();
```

### Operações com Filtros Personalizados

```typescript
// Buscar todos os filtros
const filters = await customFilterService.getAllCustomFilters();

// Criar novo filtro
const newFilter = await customFilterService.createCustomFilter({
  nomeFiltro: 'Filtro de Região',
  tabelaOrigem: 'contratos',
  campoOrigem: 'regiao',
  tipo: 'select',
  configuracoes: {
    options: [
      { value: 'Norte', label: 'Norte' },
      { value: 'Sul', label: 'Sul' }
    ]
  }
});
```

## Hooks Atualizados

Os hooks existentes foram atualizados para usar a nova arquitetura:

### useContractFilters

```typescript
const { contracts, isLoading, applyFilters } = useContractFilters();

// O hook agora usa o ContractService internamente
await applyFilters({
  flowType: ['RE', 'FI'],
  contractValue: [10000, 100000],
  selectedStates: ['SP', 'RJ'],
  // ... outros filtros
});
```

### useCustomFilters

```typescript
const { customFilters, addFilter, removeFilter, isLoading } = useCustomFilters();

// O hook agora usa o CustomFilterService internamente
await addFilter({
  name: 'Novo Filtro',
  type: 'Dropdown',
  table: 'contratos',
  field: 'estado',
  options: [/* opções */]
});
```

## Funcionalidades Implementadas

### ✅ Operações CRUD Completas
- **Contratos**: Create, Read, Update, Delete
- **Filtros Personalizados**: Create, Read, Update, Delete

### ✅ Buscas Avançadas
- Filtros por fornecedor, região, estado, tipo de fluxo
- Filtros por faixa de valores e datas
- Contratos vencidos e com vencimento próximo
- Busca paginada

### ✅ Analytics e Estatísticas
- Contratos por status e região
- Valores totais por status
- Eficiência de pagamentos
- Valor médio de contratos

### ✅ Validações de Negócio
- Validação de dados obrigatórios
- Validação de valores numéricos
- Validação de datas
- Validação de configurações de filtros

### ✅ Tratamento de Erros
- Mensagens de erro informativas
- Logging de erros
- Fallback para casos de falha

## Benefícios da Arquitetura

1. **Separação de Responsabilidades**: Domínio separado da infraestrutura
2. **Testabilidade**: Interfaces permitem fácil mock para testes
3. **Manutenibilidade**: Código organizado e bem estruturado
4. **Escalabilidade**: Fácil adicionar novas funcionalidades
5. **Flexibilidade**: Possível trocar Supabase por outro banco sem afetar o domínio

## Próximos Passos

Para continuar expandindo a aplicação:

1. **Autenticação**: Implementar autenticação de usuários
2. **Autorização**: Adicionar controle de acesso por roles
3. **Cache**: Implementar cache para melhorar performance
4. **Testes**: Adicionar testes unitários e de integração
5. **Logs**: Implementar sistema de logs mais robusto

## Troubleshooting

### Erro de API Key
Se aparecer o aviso "Using placeholder API_KEY":
- Verifique se o arquivo `.env` existe
- Confirme se `VITE_SUPABASE_ANON_KEY` está configurado corretamente
- Reinicie o servidor de desenvolvimento

### Erros de Conexão
- Verifique se a URL do Supabase está correta
- Confirme se as políticas RLS estão configuradas adequadamente
- Verifique se as tabelas existem no banco

### Problemas de Tipos
- Execute `npm run build` para verificar erros de TypeScript
- Os tipos são gerados automaticamente pelo Supabase CLI
- Verifique se as entidades de domínio correspondem ao schema do banco
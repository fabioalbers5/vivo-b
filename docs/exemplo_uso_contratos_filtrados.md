# Exemplo de Uso - Sistema de Contratos Filtrados

## Visão Geral
O sistema de contratos filtrados impede duplicações em análises mensais através de registro automático dos contratos processados.

## Funcionamento Automático

### Frontend (React/TypeScript)
O sistema opera automaticamente quando uma amostra representativa é criada:

```typescript
// Em PaymentVerificationApp.tsx - Execução automática após criar amostra
registrarContratosFiltrados(finalSample, 'fabio')
  .then(resultado => {
    if (resultado.sucesso) {
      // ✅ Registrado: X novos, Y duplicados ignorados
    } else {
      // ❌ Erro: resultado.erro
    }
  });
```

### Backend (Python/SQLAlchemy)
Registro idempotente na base de dados:

```python
from src.services.contratos_filtrados_service import ContratosFilteredService

# Registrar contratos filtrados do mês atual
service = ContratosFilteredService()
resultado = service.registrar_contratos_filtrados(
    contratos=["12345", "67890", "11111"],
    usuario="fabio"
)

print(f"✅ Novos: {resultado['novos_registros']}")
print(f"🔄 Duplicados: {resultado['duplicados_ignorados']}")
```

## Estrutura da Base de Dados

### Tabela: contratos_filtrados
```sql
CREATE TABLE contratos_filtrados (
    id SERIAL PRIMARY KEY,
    numero_contrato VARCHAR(255) NOT NULL,
    mes_referencia VARCHAR(7) NOT NULL,     -- Formato: "01-2025"
    data_analise TIMESTAMP NOT NULL,
    usuario VARCHAR(255) NOT NULL,
    UNIQUE(numero_contrato, mes_referencia)
);
```

## Fluxo de Operação

### 1. Primeiro Processamento do Mês
```
Entrada: ["12345", "67890", "11111"]
Usuario: "fabio" 
Mês: "01-2025"

Resultado:
✅ novos_registros: 3
🔄 duplicados_ignorados: 0
📊 total_processados: 3
```

### 2. Segundo Processamento (Mesmo Mês)
```
Entrada: ["12345", "67890", "22222"] 
Usuario: "fabio"
Mês: "01-2025"

Resultado:
✅ novos_registros: 1 (apenas "22222")
🔄 duplicados_ignorados: 2 ("12345", "67890")
📊 total_processados: 3
```

## Configuração de Ambiente

### 1. Variáveis de Ambiente (.env)
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/dbname
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
```

### 2. Dependências Python
```bash
pip install sqlalchemy psycopg2-binary python-dotenv
```

### 3. Dependências TypeScript
```bash
npm install @supabase/supabase-js
```

## Uso Manual (Opcional)

### Python - Consulta Mensal
```python
from datetime import datetime
from src.models.contratos_filtrados import ContratoFiltrado
from src.database.config import get_db_session

# Consultar contratos do mês atual
mes_atual = datetime.now().strftime("%m-%Y")

with get_db_session() as session:
    contratos_mes = session.query(ContratoFiltrado)\
        .filter(ContratoFiltrado.mes_referencia == mes_atual)\
        .all()
    
    print(f"📊 Contratos analisados em {mes_atual}: {len(contratos_mes)}")
    
    for contrato in contratos_mes:
        print(f"  📋 {contrato.numero_contrato} - {contrato.usuario} - {contrato.data_analise}")
```

### TypeScript - Verificação de Status
```typescript
import { ContratosFiltradosService } from '@/services/contratosFiltradosClient';

const service = new ContratosFiltradosService();

// Verificar contratos já processados
const contratos = ["12345", "67890"];
const resultado = await service.registrarContratosFiltrados(contratos, "fabio");

if (resultado.sucesso) {
  console.log(`🆕 Novos: ${resultado.novos_registros}`);
  console.log(`🔄 Duplicados: ${resultado.duplicados_ignorados}`);
} else {
  console.error(`❌ Erro: ${resultado.erro}`);
}
```

## Funcionalidades Implementadas

✅ **Detecção Automática de Mês**: Usa formato MM-YYYY baseado na data atual  
✅ **Operações Idempotentes**: ON CONFLICT DO NOTHING previne duplicações  
✅ **Integração React Hooks**: useContratosFiltrados para componentes  
✅ **Tratamento de Erros**: Logging e fallback gracioso  
✅ **Supabase Integration**: Cliente TypeScript com upsert nativo  
✅ **Session Management**: Context managers para conexões PostgreSQL  

## Monitoramento e Debug

### Logs do Sistema
```typescript
// Console logs desabilitados em produção
// Ativar apenas para debug:
// console.log(`✅ Contratos registrados: ${resultado.novos_registros}`);
```

### Verificação de Base de Dados
```sql
-- Consultar registros recentes
SELECT 
    numero_contrato,
    mes_referencia,
    data_analise,
    usuario
FROM contratos_filtrados 
ORDER BY data_analise DESC 
LIMIT 10;

-- Estatísticas mensais
SELECT 
    mes_referencia,
    COUNT(*) as total_contratos,
    COUNT(DISTINCT usuario) as usuarios_distintos
FROM contratos_filtrados 
GROUP BY mes_referencia 
ORDER BY mes_referencia DESC;
```

## Benefícios

🎯 **Evita Duplicações**: Contratos não são analisados múltiplas vezes no mesmo mês  
📊 **Auditoria Completa**: Histórico de quais contratos foram processados e quando  
⚡ **Performance**: Operações UPSERT otimizadas com índices únicos  
🔄 **Idempotência**: Execuções múltiplas são seguras e consistentes  
👥 **Multi-usuário**: Suporte a diferentes analistas simultaneamente  
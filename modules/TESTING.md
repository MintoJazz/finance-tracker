# Estratégia e índice de testes

Cada módulo tem um `TESTING.md` com os casos de teste no formato IEEE 829 (resumido) e a ligação com o teste automatizado que os executa. Os testes ficam **ao lado do código**, como `*.spec.ts`.

| Módulo | Casos documentados |
| --- | --- |
| [cards](cards/TESTING.md) | use-cases de escrita e leitura, schema (EP/BVA) |
| [wallets](wallets/TESTING.md) | use-cases de escrita e leitura, schema (EP/BVA) |
| [categories](categories/TESTING.md) | política de hierarquia (6 regras), use-cases, schema |
| [movements](movements/TESTING.md) | use-cases, tabela contábil de tipos, schemas |
| [cycles](cycles/TESTING.md) | motor de janelas, estratégias por frequência, serviços puros, use-cases |
| [recurrences](recurrences/TESTING.md) | estados (arquivar, restaurar, ativar), opções, schemas |
| [space](space/TESTING.md) | permissões por papel, acesso, troca de contexto |
| [auth](auth/TESTING.md) | login, cadastro, perfil, avatar, hash de senha |
| [storage](storage/TESTING.md) | políticas de upload, solicitar, confirmar e limpar |
| [operations](operations/TESTING.md) | compilador do plano (DAG), validação de valor e data |

## Como executar

```bash
npm test                                   # suíte inteira
npx tsx --test "modules/<módulo>/**/*.spec.ts"   # um módulo
npx tsx --test --experimental-test-coverage "modules/**/*.spec.ts"   # com cobertura
```

## Convenções

- **Dublês sem banco:** use-cases são testados com repositórios e provedores falsos. Exceções que dependem de **Postgres**: `wallet-prisma.queries.spec.ts`, `cycle-prisma.queries.spec.ts` e demais `*-prisma.*.spec.ts`.
- **Técnicas:** EP (partição de equivalência), BVA (valor limite), CP (caixa-preta funcional), CB (caixa-branca, cobertura de ramos).
- **Defeitos conhecidos** ficam como testes `todo` do `node:test`: descrevem o comportamento correto, falham hoje e não quebram a suíte. Ao corrigir o defeito, remova a marca `todo`.
- **Decisões de produto** que não são defeitos: carteiras podem ter saldo negativo; o pagamento de obrigações está desabilitado até o próximo ciclo.

## Defeitos conhecidos (testes `todo`)

| ID | Defeito | Teste |
| --- | --- | --- |
| NC-01 | Membro removido ou pendente mantém acesso | `space/application/use-cases/space.use-cases.spec.ts` |
| NC-02 | Permissão `canEditEntries` inexistente bloqueia comprovantes | `storage/application/use-cases/storage.use-cases.spec.ts` |
| NC-03 | Valores acima de 32 bits aceitos em 5 campos | `operations/models/money-int32-bounds.spec.ts` |
| NC-04 | Data de vencimento sem validação (`31/02` vira `03/03`) | `operations/models/operation-base.schema.spec.ts` |
| NC-05 | CPF sem dígitos verificadores | `auth/models/signup.schema.validation.spec.ts` |
| NC-06 | Senha sem teto; bcrypt considera só 72 bytes | `auth/infra/cryptography/bcrypt-hasher.spec.ts` |
| NC-07 | Data de nascimento futura aceita | `auth/models/signup.schema.validation.spec.ts` |
| NC-08 | Motor de ciclos corta em 500 janelas sem avisar | `cycles/application/services/cycle-window.engine.limits.spec.ts` |

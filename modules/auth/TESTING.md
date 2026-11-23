# Testes do módulo `auth`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/auth/**/*.spec.ts"`.

**Dublês:** repositórios, unidade de trabalho (Unit of Work) e armazenamento são falsos; o hash de senha usa `bcryptjs` real somente em `bcrypt-hasher.spec.ts`.

## Casos de aplicação (use-cases)

| ID | Caso | Entrada / pré-condição | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-AUT-001 | Login válido | E-mail cadastrado e senha correta | Devolve `partyId`, e-mail e contexto padrão; registra o último login | CP | `application/use-cases/auth.use-cases.spec.ts` › LoginUseCase |
| CT-AUT-002 | Login sem contexto padrão | Usuário sem contexto marcado como padrão | Usa o `partyId` como contexto | EP | idem |
| CT-AUT-003 | E-mail inexistente e senha errada | Duas tentativas inválidas | **Mesma mensagem** "E-mail ou senha inválidos." (não revela qual falhou); último login não é gravado | CP | idem |
| CT-AUT-004 | E-mail em formato inválido | `nao-e-email` | Rejeitado antes de consultar o banco | EP | idem |
| CT-AUT-010 | Cadastro válido | Dados corretos, e-mail e CPF livres | Cria pessoa, credencial e espaço "Espaço de {nome}" na mesma transação; e-mail em minúsculas; CPF só com dígitos | CP | idem › SignupUseCase |
| CT-AUT-011 | E-mail ou CPF já cadastrado | Já existem | "E-mail já cadastrado" / "CPF já cadastrado" | EP | idem |
| CT-AUT-012 | Validação do formulário | E-mail inválido; senha com 5 caracteres; confirmação diferente; nome com 1 caractere; CPF com 3 dígitos | Mensagem específica de cada regra | EP + BVA | idem |
| CT-AUT-013 | Corrida na unicidade | Violação P2002 de `email`, `documentNumber` ou outro campo | Mensagem do campo duplicado / "Registro duplicado encontrado" | CB | idem |
| CT-AUT-014 | Erro inesperado no cadastro | Exceção qualquer | "Erro ao cadastrar usuário" | CB | idem |
| CT-AUT-020 | Perfil: identificador e inexistente | `partyId = 0`, `-1`; perfil `null` | "Identificador de usuário inválido." / "Perfil de usuário não encontrado." | BVA | idem › GetProfileUseCase |
| CT-AUT-021 | Perfil: avatar | Chave do storage; URL `http(s)://` ou `/…`; sem storage; sem avatar | Assina a URL (24 h); mantém URLs e caminhos; devolve como está | EP | idem |
| CT-AUT-022 | Perfil: falha ao assinar | Storage lança erro | Perfil devolvido com `avatarUrl = null` | CB | idem |
| CT-AUT-030 | Atualizar avatar | Anexo confirmado do próprio usuário | Grava a chave e devolve a URL assinada; sem storage, devolve a chave | CP | idem › UpdateAvatarUseCase |
| CT-AUT-031 | Atualizar avatar: anexo inválido | Inexistente; de outro usuário; não confirmado | Mensagens específicas; nada é gravado | EP | idem |

## Hash de senha (`BcryptHasher`)

| ID | Caso | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- |
| CT-AUT-040 | Hash e conferência | Hash diferente da senha, formato bcrypt com custo 10; senha correta confere; errada e vazia não | CP | `infra/cryptography/bcrypt-hasher.spec.ts` |
| CT-AUT-041 | Salt aleatório | Duas chamadas geram hashes distintos | CP | idem |
| CT-AUT-042 | Limite de 72 bytes | Senhas que diferem dentro dos 72 primeiros bytes são distinguidas | BVA | idem |
| CT-AUT-043 | **Senhas que diferem após o byte 72** | Deveriam ser distinguidas | BVA | idem (`todo`) — **Defeito NC-06** |

## Validação do cadastro (`SignupSchema`)

| ID | Campo | Valores | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-AUT-050 | Normalização | `"  ANA@Exemplo.com "`, `529.982.247-25` | `ana@exemplo.com`; `52998224725` | CP | `models/signup.schema.validation.spec.ts` |
| CT-AUT-051 | CPF: quantidade de dígitos | 10, 11 e 12 dígitos | Rejeita, aceita, rejeita | BVA | idem |
| CT-AUT-052 | Senha: tamanho mínimo | 5 e 6 caracteres | Rejeita, aceita | BVA | idem |
| CT-AUT-053 | **CPF com dígitos verificadores inválidos** | `111.111.111-11`, `123.456.789-00` | Deveria rejeitar | EP | idem (`todo`) — **Defeito NC-05** |
| CT-AUT-054 | **Data de nascimento futura** | `2999-01-01` | Deveria rejeitar | EP | idem (`todo`) — **Defeito NC-07** |
| CT-AUT-055 | **Senha acima de 72 bytes** | 73 caracteres | Deveria rejeitar (limite efetivo do bcrypt) | BVA | idem (`todo`) — **Defeito NC-06** |

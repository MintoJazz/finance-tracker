# Testes do módulo `storage`

Casos de teste no formato IEEE 829 (resumido), ligados aos testes automatizados.
Executar: `npx tsx --test "modules/storage/**/*.spec.ts"`.

**Dublês:** repositório de anexos, armazenamento de arquivos (S3) e provedor de acesso são falsos; nenhum teste usa rede ou banco.

## Políticas de upload

| ID | Caso | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- |
| CT-STO-001 | Avatar | Só PNG, JPEG e WebP; até 5 MB; não exige contexto; chave `parties/{id}/avatar` | CP | `application/use-cases/storage.use-cases.spec.ts` › UPLOAD_POLICIES |
| CT-STO-002 | Comprovante de lançamento | Imagens e PDF; até 10 MB; exige contexto; chave `contexts/{id}/receipts` | CP | idem |
| CT-STO-003 | Tipos permitidos têm extensão | Todo MIME permitido existe em `MIME_TO_EXTENSION` | CB | idem |

## Solicitar upload (`RequestUploadUseCase`)

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-STO-010 | Avatar válido | PNG de 1.000 bytes | Cria anexo pendente com chave `parties/5/avatar/{uuid}.png`, `contextId = null`, e devolve a URL de upload (expira em 300 s) | CP | idem › RequestUploadUseCase |
| CT-STO-011 | Limite de tamanho | 5 MB e 5 MB + 1 byte | Aceita; "Tamanho do arquivo excede o limite permitido" | BVA | idem |
| CT-STO-012 | Tipo fora da política | PDF como avatar | "Tipo de arquivo não permitido" | EP | idem |
| CT-STO-013 | Entrada inválida | `size = 0` | Mensagem do schema "O tamanho do arquivo deve ser positivo" | EP | idem |
| CT-STO-014 | Comprovante sem contexto | Sessão sem `contextId` | "Contexto financeiro não especificado" | EP | idem |
| CT-STO-015 | Comprovante: acesso ao contexto | Acesso negado; permissão exigida ausente / presente | Erro do espaço; "Sem permissão para anexar…"; cria o anexo com o `contextId` | CP | idem |
| CT-STO-016 | **Comprovante com as permissões reais do Space** | Usuário com `canManageBalances` | Deveria permitir o envio | CP | idem (`todo`) — **Defeito NC-02**: a política exige `canEditEntries`, que nenhum código produz |
| CT-STO-017 | Falha do armazenamento | S3 lança erro | "erro interno" genérico | CB | idem |

## Confirmar upload (`ConfirmUploadUseCase`)

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-STO-020 | Confirmação válida | Anexo pendente do usuário; objeto existe com mesmo tamanho e tipo | Marca como `CONFIRMED` | CP | idem › ConfirmUploadUseCase |
| CT-STO-021 | Idempotência | Anexo já confirmado | Devolve sucesso sem consultar o storage nem gravar de novo | EP | idem |
| CT-STO-022 | Identificador inválido | `"123"` (não é UUID) | "ID de anexo inválido" | EP | idem |
| CT-STO-023 | Anexo inexistente ou de outro usuário | `null` / dono diferente | "Anexo não encontrado" / "Sem permissão para confirmar este anexo" | EP | idem |
| CT-STO-024 | Divergência com o registro | Objeto ausente; tamanho diferente; tipo diferente | Mensagem específica de cada divergência | EP | idem |

## Limpeza de pendentes (`CleanupStaleUploadsUseCase`)

| ID | Caso | Entrada | Resultado esperado | Técnica | Teste automatizado |
| --- | --- | --- | --- | --- | --- |
| CT-STO-030 | Limite de idade | Data informada; sem data | Usa a data informada; padrão de 1 hora atrás | BVA | idem › CleanupStaleUploadsUseCase |
| CT-STO-031 | Remoção em ordem segura | Anexos pendentes | Remove o objeto no storage e depois o registro | CP | idem |
| CT-STO-032 | Falha ao remover no storage | Um objeto falha | Registro preservado (nova tentativa depois); id vai para `failedIds` | CB | idem |
| CT-STO-033 | Falha ao remover o registro | Banco falha | Id contado como falha | CB | idem |
| CT-STO-034 | Lotes de 20 | 20, 21 e 45 anexos | Todos processados, sem perda nos limites do lote | BVA | idem |

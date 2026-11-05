# Especificação Técnica 2: Árvore de Cobranças e Cascata de Rateios

## 1. Visão Geral

Esta especificação define o protocolo de Cobrança Inter-contextos (_Claim_). O motor atua como uma primitiva contábil universal para transferir responsabilidade financeira (caixa) e orçamentária (categoria) entre contextos distintos, preservando a pureza e a imutabilidade dos lançamentos locais.

## 2. Desacoplamento da Origem

A arquitetura proíbe que lançamentos operacionais locais (`DIRECT` ou `SETTLEMENT`) carreguem vínculos ou conhecimento sobre rateios e cobranças. Toda compra ou provisão nasce limpa.
A árvore de cobrança é afixada ou desapegada dessas origens exclusivamente pelo lançamento que a inaugura (`CLAIM_OPENING`), permitindo que cobranças sejam criadas, editadas, redivididas ou estornadas sem exigir a alteração dos fatos geradores.

## 3. A Unidade Atômica da Cobrança

Qualquer nó na árvore de cobrança conecta **6 Contas (`Balances`)**, independentemente da sua profundidade na cascata:

- **No Credor:** `RECEIVABLE` (O direito $R$), `CATEGORY_C` (Origem orçamentária), `WALLET_C` (Caixa receptor).
- **No Devedor:** `PAYABLE` (A obrigação $P$), `CATEGORY_D` (Destino orçamentário), `WALLET_D` (Caixa pagador).

## 4. O Mecanismo Estrutural via `Balance.parentId`

Em vez de poluir o Ledger com pares de movimentos nulos ($\pm x$) para roteamento, o sistema delega toda a amarração orçamentária e a cascata de repasses à hierarquia estrutural de **`Balance.parentId`**:

1. **`RECEIVABLE` Raiz (Credor Inicial):** Nasce com `parentId = CATEGORY_C` (a categoria de origem que será aliviada quando a cobrança for quitada).
2. **`RECEIVABLE` em Cascata / Repasse (Intermediário):** Nasce com `parentId = PAYABLE_PAI` (a dívida que o intermediário possui com o credor anterior dentro do mesmo contexto).
3. **`PAYABLE` (Devedor):** Nasce com `parentId = NULL` (pendente de aceite) e recebe `parentId = CATEGORY_D` no momento em que o Devedor reconhece a dívida e destina o custo.

Dessa forma, o Ledger permanece 100% limpo: todo `Movement` no banco representa uma movimentação financeira ou orçamentária real, eliminando qualquer necessidade de movimentos nulos ou de soma zero.

## 5. Máquina de Estados e Etapas do Ciclo

A progressão de uma cobrança percorre lançamentos padronizados e a navegação estrutural por `parentId`:

### I. Abertura (`CLAIM_OPENING`)

- **Papel:** Instancia o contrato bilateral e ancora a cobrança estruturalmente.
- **Movimentos Financeiros:** Debita $P$ (-x) e credita $R$ (+x).
- **Vínculo Estrutural (`parentId`):**
  - **Se for Nó Raiz:** O `RECEIVABLE` é criado com `parentId = CATEGORY_C` (categoria do Credor a ser aliviada).
  - **Se for Nó Filho (Repasse):** O `RECEIVABLE` é criado com `parentId = PAYABLE_PAI` (dívida do intermediário no mesmo contexto). O devedor filho recebe um novo `PAYABLE` com `parentId = NULL`.

### II. Aceite pelo Devedor

- **Papel:** O Devedor reconhece a dívida e destina o custo para seu planejamento orçamentário.
- **Operação:** Ocorre via atualização estrutural de conta (`UPDATE Balance SET parentId = :categoryDId WHERE id = :payableId`), sem a necessidade de lançamentos contábeis fantasmas no Ledger.

### III. Pagamento (`CLAIM_PAYMENT`)

- **Papel:** Liquidação do passivo por parte do Devedor.
- **Movimentos Financeiros:** O Devedor retira saldo de sua `WALLET_D` (-x) e credita o `PAYABLE` (+x), zerando sua obrigação financeira local. O $R$ do Credor permanece aguardando.

### IV. Recebimento (`CLAIM_RECEIPT`)

- **Papel:** Liquidação do ativo pelo Credor e migração orçamentária bilateral.
- **Dinâmica Universal de Resolução via `parentId`:**
  Neste lançamento, o motor debita $R$ (-x) e credita a `WALLET_C` (+x) do Credor. Simultaneamente, o motor resolve a origem e o destino navegando na árvore de `Balance.parentId`:
  - **Oneração Orçamentária:** Sobe `PAYABLE.parentId` até encontrar a `CATEGORY_D` e debita/adiciona saldo a ela.
  - **Alívio Orçamentário:** Sobe `RECEIVABLE.parentId` até encontrar a `CATEGORY` de origem (no nó raiz, é o pai imediato; no nó intermediário, sobe `RECEIVABLE -> PAYABLE -> CATEGORY`).
  
_(Para intermediários na árvore, este passo equaliza perfeitamente a categoria de passagem, pois a oneração oriunda do recebimento do pai é anulada pelo alívio oriundo da resolução dos filhos)._

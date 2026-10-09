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

## 4. O Mecanismo do "Par de Ligação" ($\pm x$)

Como o sistema evita chaves estrangeiras (`FK`) diretas em `Entry` para não ferir o modelo de grafo, os ponteiros entre eventos são construídos via injeção de **Pares de Ligação**: dois `Movements` de mesmo valor e sinais opostos ($-x$ e $+x$) gravados em um mesmo `Balance`.
O par possui efeito líquido zero sobre o saldo financeiro da conta, servindo exclusivamente como uma aresta rastreável pelo motor para descobrir origens e vincular destinos.

## 5. Máquina de Estados e Etapas do Ciclo

A progressão de uma cobrança percorre 4 lançamentos padronizados:

### I. Abertura (`CLAIM_OPENING`)

- **Papel:** Instancia o contrato bilateral e ancora a cobrança na origem.
- **Movimentos Financeiros:** Debita $P$ e credita $R$.
- **Injeção do Par de Ligação (A Âncora):**
- **Se for Nó Raiz:** O `CLAIM_OPENING` injeta um par $\pm x$ diretamente na `CATEGORY` (ou `COMMITMENT`) do Credor que deve ser aliviada no fechamento.
- **Se for Nó Filho (Repasse):** O `CLAIM_OPENING` injeta um par $\pm x$ no `PAYABLE` da cobrança pai pertencente ao intermediário, criando a cascata e impondo um teto físico para os repasses.

### II. Aceite (`CLAIM_ACCEPTANCE`)

- **Papel:** O Devedor reconhece a dívida e destina o custo. Ocorre 100% no contexto do Devedor.
- **Movimentos Financeiros:** Nenhum.
- **Injeção do Par de Ligação (O Destino):** Injeta um par $\pm x$ no `PAYABLE` atual e outro par $\pm x$ na `CATEGORY_D` escolhida pelo Devedor. O motor utilizará essa rota no fechamento.

### III. Pagamento (`CLAIM_PAYMENT`)

- **Papel:** Liquidação do passivo por parte do Devedor.
- **Movimentos Financeiros:** O Devedor retira saldo de sua `WALLET_D` e credita o `PAYABLE`, zerando sua obrigação financeira local. O $R$ do Credor permanece aguardando.

### IV. Recebimento (`CLAIM_RECEIPT`)

- **Papel:** Liquidação do ativo pelo Credor e migração orçamentária.
- **Dinâmica Universal de Resolução:** Neste único lançamento, o motor debita $R$ e credita a `WALLET_C` do Credor. Simultaneamente, o motor resolve a origem e o destino seguindo os pares de ligação deixados nos Passos I e II:
- Remove saldo da categoria apontada na base da cadeia (alívio orçamentário).
- Adiciona saldo à categoria escolhida no aceite do Devedor (oneração orçamentária).

_(Para intermediários na árvore, este passo equaliza perfeitamente a categoria de passagem, pois a oneração oriunda da aceitação do pai é anulada pelo alívio oriundo da resolução dos filhos)._

# Especificação Técnica 1: Motor de Acordos e Obrigações Derivadas

## 1. Visão Geral

Esta especificação define a separação arquitetural entre **Contratos** (regras estruturais de faturamento) e **Obrigações** (o impacto financeiro derivado). O sistema elimina a necessidade de persistir tabelas de faturas estáticas, adotando o padrão de **Estado Derivado** orientado por janelas de competência.

## 2. Dicionário de Domínio: Contrato vs. Obrigação

### A. O Contrato (`Agreement` & `CycleRule`)

O Contrato representa a **regra do jogo**. Ele não possui valor financeiro, apenas estabelece _se_ existe um vínculo de tempo, _quando_ o ciclo fecha e _quando_ vence.

- **`Agreement`:** Entidade que decreta a existência de um vínculo em um `Balance` e sua vigência global (início e fim do contrato). Toda conta de obrigação ou direito (`PAYABLE` ou `RECEIVABLE`), seja ela recorrente (ex: aluguel, assinatura) ou pontual (ex: cobrança de rateio, empréstimo avulso), possui um `Agreement` atrelado e referencia sua categoria orçamentária padrão através de `Balance.parentId`.
- **`CycleRule`:** O motor de versionamento das regras. Define a frequência (`ONCE` para obrigações pontuais, `MONTHLY`, `WEEKLY`, `YEARLY` para contínuos), intervalo, dia de fechamento e dia de vencimento. O campo `effectiveFrom` garante que alterações contratuais gerem uma nova regra sem corromper a leitura de ciclos passados. Obrigações pontuais (`ONCE`) geram exatamente $1$ ciclo no motor.

### B. A Obrigação (O Ciclo Financeiro Derivado)

A Obrigação (ou Fatura) é o **fato matemático**. Ela não existe como linha no banco de dados; é o resultado da agregação de todas as movimentações (`Movements`) de um `Balance` cujas datas se encaixam na janela temporal gerada pelas regras do Contrato.

## 3. O Relógio Duplo: Caixa vs. Competência

Para que o Estado Derivado não corrompa o extrato bancário, o modelo de lançamentos (`Entry`) adota uma separação estrita de vetores temporais:

- **`dueDate` (Vetor de Caixa):** A data do mundo real. Representa o instante em que o dinheiro efetivamente sai ou entra na carteira (`WALLET`). Dita a ordem do extrato bancário.
- **`competenceDate` (Vetor de Obrigação):** A data de pertencimento. É a âncora utilizada pelo motor para encaixar o movimento dentro da janela de um ciclo contratual.

## 4. Resolução e Liquidação de Ciclos

1. **Geração da Janela:** O sistema lê a `CycleRule` vigente para o mês consultado e delimita o `start_date` e `end_date` da competência.
2. **Saldo em Aberto (Cálculo):** Realiza-se a soma algébrica de todos os `Movements` no `Balance` consultado onde a `competenceDate` cai dentro da janela delimitada.
3. **Liquidação (`SETTLEMENT`):** O ato de pagar um ciclo consiste em registrar um lançamento com a `dueDate` configurada para a data do pagamento real, mas preservando a `competenceDate` injetada obrigatoriamente dentro da janela do ciclo pago. Isso garante que a soma algébrica do ciclo alvo chegue a zero, independentemente de atrasos ou adiantamentos no pagamento.

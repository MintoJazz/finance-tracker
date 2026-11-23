-- Parcelamento como OBRIGAÇÃO (ver specs/arvore_cobrancas.md e specs/contrato_obrigacoes.md):
--  * o Balance INSTALLMENT passa a ter Agreement/CycleRule e a RECEBER Movements, como um PAYABLE;
--  * cada parcela é um ACCRUAL (INSTALLMENT -v / CATEGORY +v); em fatura a dívida passa ao cartão por um
--    TRANSFER (INSTALLMENT +v / CREDIT -v); no mês a mês a quitação é um SETTLEMENT de carteira;
--  * o vínculo parcela -> parcelamento é a perna de Movement no Balance: some Entry.installmentId/installmentNumber.
-- Etapas: derruba a view, apaga o parcelamento de teste do modelo antigo, remove as colunas e recria as views.

DROP VIEW IF EXISTS vw_installment_summary;

-- Dados do modelo antigo (parcelamento de teste criado à mão, agrupado por Entry.installmentId).
-- Movements saem por cascade das Entries; BalanceAppearance sai por cascade do Balance.
DELETE FROM "Entry"
WHERE "reversesEntryId" IN (SELECT id FROM "Entry" WHERE "installmentId" IS NOT NULL);

DELETE FROM "Entry" WHERE "installmentId" IS NOT NULL;

DELETE FROM "Balance" b
WHERE b."balanceType" = 'INSTALLMENT'
  AND NOT EXISTS (SELECT 1 FROM "Agreement" a WHERE a."balanceId" = b.id);

-- Remove o vínculo direto Entry -> Balance
ALTER TABLE "Entry" DROP CONSTRAINT "Entry_installmentId_fkey";
DROP INDEX "Entry_installmentId_installmentNumber_key";
DROP INDEX "Entry_installmentId_idx";
ALTER TABLE "Entry" DROP COLUMN "installmentId", DROP COLUMN "installmentNumber";

-- vw_entry_category: INSTALLMENT também herda a categoria pelo parentId quando a liquidação
-- não casa a competência de uma provisão (cycle_settlement).
DROP VIEW IF EXISTS "vw_entry_category";

CREATE VIEW "vw_entry_category" AS
WITH
entry_ctx AS NOT MATERIALIZED (
  SELECT DISTINCT m."entryId", b."contextId"
  FROM "Movement" m
  JOIN "Balance" b ON b.id = m."balanceId"
),

cat_footprint AS NOT MATERIALIZED (
  SELECT m."entryId", b."contextId", m."balanceId" AS "categoryBalanceId",
         COALESCE(SUM(m.amount) FILTER (WHERE m.direction = 'CREDIT'), 0) AS credit,
         COALESCE(SUM(m.amount) FILTER (WHERE m.direction = 'DEBIT'),  0) AS debit
  FROM "Movement" m
  JOIN "Balance" b ON b.id = m."balanceId"
  WHERE b."balanceType" = 'CATEGORY'
  GROUP BY m."entryId", b."contextId", m."balanceId"
),
real_cat AS NOT MATERIALIZED (
  SELECT * FROM cat_footprint WHERE credit <> debit
),

-- Entradas que tocam diretamente uma categoria (DIRECT, ACCRUAL, REVERSAL, CLAIM_RECEIPT)
own AS NOT MATERIALIZED (
  SELECT e.id AS "entryId", r."contextId",
         CASE WHEN COUNT(*) = 1 THEN 'category' ELSE 'multiple' END AS kind,
         CASE WHEN COUNT(*) = 1 THEN MIN(r."categoryBalanceId") END AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM "Entry" e
  JOIN real_cat r ON r."entryId" = e.id
  GROUP BY e.id, r."contextId"
),

-- Pass-through em CLAIM_RECEIPT no intermediário (sem real_cat local, navegando no parentId)
pass AS NOT MATERIALIZED (
  SELECT e.id AS "entryId", b."contextId",
         'pass-through' AS kind,
         COALESCE(cat1.id, cat2.id) AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM "Entry" e
  JOIN "Movement" m ON m."entryId" = e.id
  JOIN "Balance" b  ON b.id = m."balanceId" AND b."balanceType" = 'RECEIVABLE'
  LEFT JOIN "Balance" p1 ON p1.id = b."parentId"
  LEFT JOIN "Balance" cat1 ON cat1.id = p1.id AND cat1."balanceType" = 'CATEGORY'
  LEFT JOIN "Balance" cat2 ON cat2.id = p1."parentId" AND cat2."balanceType" = 'CATEGORY'
  WHERE e.type = 'CLAIM_RECEIPT'
    AND NOT EXISTS (
      SELECT 1 FROM real_cat r
      WHERE r."entryId" = e.id AND r."contextId" = b."contextId"
    )
  GROUP BY e.id, b."contextId", COALESCE(cat1.id, cat2.id)
),

-- Liquidação de fatura de cartão de crédito
credit_settlement AS NOT MATERIALIZED (
  SELECT s."entryId", ec."contextId",
         'credit-settlement' AS kind,
         NULL::int AS "categoryBalanceId",
         s."balanceId" AS "creditBalanceId"
  FROM vw_entry_cycle_rule s
  JOIN "Balance" cb ON cb.id = s."balanceId" AND cb."balanceType" = 'CREDIT'
  JOIN "Entry" e    ON e.id = s."entryId" AND e.type = 'SETTLEMENT'
  JOIN entry_ctx ec ON ec."entryId" = s."entryId"
  -- Só a perna que REDUZ a dívida do cartão (amount > 0) é pagamento de fatura; uma liquidação
  -- que aumenta a dívida do cartão não é pagamento.
  WHERE EXISTS (
    SELECT 1 FROM "Movement" cm
    WHERE cm."entryId" = s."entryId" AND cm."balanceId" = s."balanceId" AND cm.amount > 0
  )
),

-- Liquidação de contratos com regras de ciclo (suporta multicategorias no ciclo)
cycle_settlement AS NOT MATERIALIZED (
  SELECT s."entryId", r."contextId",
         CASE WHEN COUNT(DISTINCT r."categoryBalanceId") = 1
              THEN 'category' ELSE 'multiple' END AS kind,
         CASE WHEN COUNT(DISTINCT r."categoryBalanceId") = 1
              THEN MIN(r."categoryBalanceId") END AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM vw_entry_cycle_rule s
  JOIN "Entry" se   ON se.id = s."entryId" AND se.type = 'SETTLEMENT'
  JOIN "Balance" sb ON sb.id = s."balanceId" AND sb."balanceType" <> 'CREDIT'
  JOIN vw_entry_cycle_rule v
       ON v."balanceId" = s."balanceId" AND v."referenceDate" = s."referenceDate"
  JOIN "Entry" ae   ON ae.id = v."entryId" AND ae.type = 'ACCRUAL'
  JOIN real_cat r   ON r."entryId" = ae.id
  JOIN entry_ctx ec ON ec."entryId" = s."entryId" AND ec."contextId" = r."contextId"
  -- Só a perna que REDUZ a obrigação conta como liquidação (polaridade -1 em PAYABLE, +1 em RECEIVABLE).
  WHERE EXISTS (
    SELECT 1 FROM "Movement" sm
    WHERE sm."entryId" = s."entryId" AND sm."balanceId" = s."balanceId"
      AND sm.amount * CASE WHEN sb."balanceType" = 'RECEIVABLE' THEN 1 ELSE -1 END < 0
  )
  GROUP BY s."entryId", r."contextId"
),

-- Herança estrutural via parentId para PAYABLE, RECEIVABLE e INSTALLMENT (CLAIM_PAYMENT, CLAIM_OPENING, SETTLEMENT direto)
inherited_parent_cat AS NOT MATERIALIZED (
  SELECT m."entryId", b."contextId",
         CASE WHEN COUNT(DISTINCT COALESCE(cat1.id, cat2.id)) = 1 THEN 'category' ELSE 'multiple' END AS kind,
         CASE WHEN COUNT(DISTINCT COALESCE(cat1.id, cat2.id)) = 1 THEN MIN(COALESCE(cat1.id, cat2.id)) END AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM "Movement" m
  JOIN "Balance" b ON b.id = m."balanceId"
  LEFT JOIN "Balance" p1 ON p1.id = b."parentId"
  LEFT JOIN "Balance" cat1 ON cat1.id = p1.id AND cat1."balanceType" = 'CATEGORY'
  LEFT JOIN "Balance" cat2 ON cat2.id = p1."parentId" AND cat2."balanceType" = 'CATEGORY'
  WHERE b."balanceType" IN ('PAYABLE', 'RECEIVABLE', 'INSTALLMENT')
    AND COALESCE(cat1.id, cat2.id) IS NOT NULL
    AND NOT EXISTS (
      SELECT 1 FROM own o WHERE o."entryId" = m."entryId" AND o."contextId" = b."contextId"
    )
    AND NOT EXISTS (
      SELECT 1 FROM pass ps WHERE ps."entryId" = m."entryId" AND ps."contextId" = b."contextId"
    )
    AND NOT EXISTS (
      SELECT 1 FROM credit_settlement cs WHERE cs."entryId" = m."entryId" AND cs."contextId" = b."contextId"
    )
    AND NOT EXISTS (
      SELECT 1 FROM cycle_settlement cys WHERE cys."entryId" = m."entryId" AND cys."contextId" = b."contextId"
    )
  GROUP BY m."entryId", b."contextId"
),

resolved AS NOT MATERIALIZED (
  SELECT * FROM own
  UNION ALL SELECT * FROM pass
  UNION ALL SELECT * FROM credit_settlement
  UNION ALL SELECT * FROM cycle_settlement
  UNION ALL SELECT * FROM inherited_parent_cat
)

SELECT ec."entryId", ec."contextId",
       COALESCE(r.kind, 'none') AS kind,
       r."categoryBalanceId",
       r."creditBalanceId"
FROM entry_ctx ec
LEFT JOIN resolved r USING ("entryId", "contextId");

-- Resumo por parcelamento (1 linha por Balance INSTALLMENT com parcelas), derivado das pernas de Movement
-- no próprio Balance (sem FK no Entry):
--  * parcela = ACCRUAL vivo com perna no parcelamento; valor = -amount da perna; referência = competência;
--  * em fatura, a parcela tem um TRANSFER vivo (mesma referência) com perna num cartão CREDIT; o tipo
--    (fatura x mês a mês) não é armazenado: o domínio o deriva da presença de cardBalanceId;
--  * parcela em fatura "paga" = saldo da fatura onde ela cai <= 0. Saldo = -SUM(amount) dos Movements do
--    cartão cuja referência cai na janela de fechamento (a soma com sinal que o motor de ciclos usa);
--  * parcela mês a mês "paga" = existe SETTLEMENT redutor (amount > 0) no parcelamento com a mesma referência;
--  * total = soma das parcelas reais (a última absorve o resto da divisão); parcela = valor da 1ª.
-- Vencimento efetivo: em fatura, o da fatura (regra vigente do cartão); senão a data da parcela.
-- Datas efetivas saem às 12:00 (como as do ledger) para não virarem o dia anterior em fuso local.
-- Limite conhecido: a janela replica a regra do CycleWindowEngine e pode divergir na troca de CycleRule.
DROP VIEW IF EXISTS vw_installment_summary;

CREATE VIEW vw_installment_summary AS
WITH
inst AS NOT MATERIALIZED (
  SELECT b.id AS "balanceId", b."contextId", b."parentId" AS "categoryBalanceId"
  FROM "Balance" b
  WHERE b."balanceType" = 'INSTALLMENT' AND b."removedAt" IS NULL
),
acc AS NOT MATERIALIZED (
  SELECT i."balanceId", e."dueDate",
         COALESCE(e."competanceDate", e."dueDate")::date AS ref,
         (-m.amount) AS amount
  FROM inst i
  JOIN "Movement" m ON m."balanceId" = i."balanceId"
  JOIN "Entry" e    ON e.id = m."entryId" AND e.type = 'ACCRUAL'
  WHERE NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
),
xfer AS NOT MATERIALIZED (
  SELECT i."balanceId",
         COALESCE(e."competanceDate", e."dueDate")::date AS ref,
         MIN(cm."balanceId") AS "cardId"
  FROM inst i
  JOIN "Movement" m  ON m."balanceId" = i."balanceId"
  JOIN "Entry" e     ON e.id = m."entryId" AND e.type = 'TRANSFER'
  JOIN "Movement" cm ON cm."entryId" = e.id
  JOIN "Balance" cb  ON cb.id = cm."balanceId" AND cb."balanceType" = 'CREDIT'
  WHERE NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
  GROUP BY i."balanceId", COALESCE(e."competanceDate", e."dueDate")::date
),
part AS NOT MATERIALIZED (
  SELECT a.*, x."cardId"
  FROM acc a
  LEFT JOIN xfer x ON x."balanceId" = a."balanceId" AND x.ref = a.ref
),
part_closing AS NOT MATERIALIZED (
  -- Mês de fechamento da fatura da parcela: mesmo mês da referência se ela cai até o dia de fechamento
  -- vigente do cartão; senão, o mês seguinte.
  SELECT p.*,
         cr."closingDay" AS "ruleClosingDay", cr."dueDay" AS "ruleDueDay",
         COALESCE(cr."closingDay", cr."dueDay", 31) AS "closeDay",
         (date_trunc('month', p.ref)
           + CASE WHEN EXTRACT(day FROM p.ref) <= COALESCE(cr."closingDay", cr."dueDay", 31)
                  THEN INTERVAL '0 month' ELSE INTERVAL '1 month' END)::date AS "closingMonth"
  FROM part p
  LEFT JOIN LATERAL (
    SELECT r."closingDay", r."dueDay"
    FROM "CycleRule" r
    WHERE r."agreementId" = p."cardId" AND r."effectiveFrom" <= p.ref
    ORDER BY r."effectiveFrom" DESC
    LIMIT 1
  ) cr ON p."cardId" IS NOT NULL
),
part_window AS NOT MATERIALIZED (
  -- Janela de fechamento [winFrom, winTo] da fatura, com o dia de fechamento limitado ao último dia do mês.
  SELECT pc.*,
         (pc."closingMonth"
           + (LEAST(pc."closeDay", EXTRACT(day FROM (pc."closingMonth" + INTERVAL '1 month - 1 day'))::int) - 1)
             * INTERVAL '1 day')::date AS "winTo",
         ((pc."closingMonth" - INTERVAL '1 month')
           + (LEAST(pc."closeDay", EXTRACT(day FROM (pc."closingMonth" - INTERVAL '1 month' + INTERVAL '1 month - 1 day'))::int) - 1)
             * INTERVAL '1 day' + INTERVAL '1 day')::date AS "winFrom"
  FROM part_closing pc
),
inv_saldo AS NOT MATERIALIZED (
  -- Saldo de cada fatura, calculado uma vez por (cartão, janela): -SUM(amount) dos Movements do cartão
  -- cuja referência cai na janela, ignorando Entries estornados.
  SELECT w."cardId", w."winFrom", w."winTo",
         COALESCE(SUM(-m.amount), 0) AS saldo
  FROM (
    SELECT DISTINCT "cardId", "winFrom", "winTo" FROM part_window WHERE "cardId" IS NOT NULL
  ) w
  LEFT JOIN "Movement" m
    ON m."balanceId" = w."cardId"
   AND EXISTS (
     SELECT 1 FROM "Entry" e
     WHERE e.id = m."entryId"
       AND e."reversesEntryId" IS NULL
       AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
       AND COALESCE(e."competanceDate", e."dueDate")::date BETWEEN w."winFrom" AND w."winTo")
  GROUP BY w."cardId", w."winFrom", w."winTo"
),
part_status AS NOT MATERIALIZED (
  SELECT pw."balanceId", pw."dueDate", pw."cardId", pw.ref, pw.amount,
         -- Vencimento efetivo: em fatura, o da fatura (vence no mês do fechamento ou no seguinte, conforme o dia).
         CASE WHEN pw."cardId" IS NOT NULL AND pw."ruleDueDay" IS NOT NULL
              THEN (pw."closingMonth"
                    + CASE WHEN pw."ruleDueDay" <= COALESCE(pw."ruleClosingDay", pw."ruleDueDay")
                           THEN INTERVAL '1 month' ELSE INTERVAL '0 month' END
                    + (pw."ruleDueDay" - 1) * INTERVAL '1 day')::date
              ELSE pw."dueDate"::date END AS "effectiveDue",
         CASE
           WHEN pw."cardId" IS NOT NULL THEN COALESCE((
             SELECT s.saldo <= 0
             FROM inv_saldo s
             WHERE s."cardId" = pw."cardId" AND s."winFrom" = pw."winFrom" AND s."winTo" = pw."winTo"), false)
           ELSE EXISTS (
             SELECT 1
             FROM "Movement" sm
             JOIN "Entry" s ON s.id = sm."entryId" AND s.type = 'SETTLEMENT'
             WHERE sm."balanceId" = pw."balanceId"
               AND sm.amount > 0 -- perna que reduz o parcelamento (liquidação)
               AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = s.id)
               AND COALESCE(s."competanceDate", s."dueDate")::date = pw.ref)
         END AS "isPaid"
  FROM part_window pw
),
agg AS NOT MATERIALIZED (
  SELECT ps."balanceId",
         COUNT(*)::int AS "totalInstallments",
         (COUNT(*) FILTER (WHERE ps."isPaid"))::int AS "paidInstallments",
         (array_agg(ps.amount ORDER BY ps.ref))[1]::int AS "installmentAmount",
         SUM(ps.amount)::int AS "totalAmount",
         MIN(ps."dueDate") AS "firstDueDate",
         MIN(ps."effectiveDue") FILTER (WHERE NOT ps."isPaid") + INTERVAL '12 hours' AS "nextDueDate",
         MAX(ps."effectiveDue") + INTERVAL '12 hours' AS "endsAt",
         COALESCE(BOOL_OR(NOT ps."isPaid" AND ps."effectiveDue" < CURRENT_DATE), false) AS "isOverdue",
         MIN(ps."cardId") AS "cardBalanceId"
  FROM part_status ps
  GROUP BY ps."balanceId"
)
SELECT a."balanceId",
       i."contextId",
       a."totalInstallments",
       a."paidInstallments",
       a."installmentAmount",
       a."totalAmount",
       a."firstDueDate",
       a."nextDueDate",
       a."endsAt",
       a."isOverdue",
       a."cardBalanceId",
       i."categoryBalanceId"
FROM agg a
JOIN inst i ON i."balanceId" = a."balanceId";

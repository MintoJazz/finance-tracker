-- Evolução da vw_installment_summary:
--  * expõe removedAt e usa LEFT JOIN agg (suporta arquivados sem parcelas vivas; firstDueDate/endsAt anuláveis);
--  * separa parcelas pagas (paidInstallments/paidAmount) de consolidadas (consolidatedInstallments/consolidatedAmount):
--      - MONTHLY: consolidada = paga (SETTLEMENT ou CLAIM_PAYMENT redutor, não estornado);
--      - INVOICE: consolidada = fatura paga (saldo <= 0) OU fechada (winTo < CURRENT_DATE);
--  * installmentAmount = primeira parcela em aberto (fallback: última parcela quando 100% consolidado);
--  * cardBalanceId = cartão da primeira parcela em aberto (fallback: última parcela quando 100% consolidado);
--  * reforça filtro contra REVERSAL / reversesEntryId em todas as pernas.

DROP VIEW IF EXISTS vw_installment_summary;

CREATE VIEW vw_installment_summary AS
WITH
inst AS NOT MATERIALIZED (
  SELECT b.id AS "balanceId",
         b."contextId",
         b."parentId" AS "categoryBalanceId",
         b."removedAt"
  FROM "Balance" b
  WHERE b."balanceType" = 'INSTALLMENT'
),
acc AS NOT MATERIALIZED (
  SELECT i."balanceId", e."dueDate",
         COALESCE(e."competanceDate", e."dueDate")::date AS ref,
         (-m.amount) AS amount
  FROM inst i
  JOIN "Movement" m ON m."balanceId" = i."balanceId"
  JOIN "Entry" e    ON e.id = m."entryId" AND e.type = 'ACCRUAL'
  WHERE e."reversesEntryId" IS NULL
    AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
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
  WHERE e."reversesEntryId" IS NULL
    AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
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
part_paid AS NOT MATERIALIZED (
  SELECT pw."balanceId", pw."dueDate", pw."cardId", pw.ref, pw.amount, pw."winTo",
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
             JOIN "Entry" s ON s.id = sm."entryId" AND s.type IN ('SETTLEMENT', 'CLAIM_PAYMENT')
             WHERE sm."balanceId" = pw."balanceId"
               AND sm.amount > 0 -- perna que reduz o parcelamento (liquidação)
               AND s."reversesEntryId" IS NULL
               AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = s.id)
               AND COALESCE(s."competanceDate", s."dueDate")::date = pw.ref)
         END AS "isPaid"
  FROM part_window pw
),
part_status AS NOT MATERIALIZED (
  SELECT pp.*,
         CASE
           WHEN pp."cardId" IS NOT NULL THEN (pp."isPaid" OR pp."winTo" < CURRENT_DATE)
           ELSE pp."isPaid"
         END AS "isConsolidated"
  FROM part_paid pp
),
agg AS NOT MATERIALIZED (
  SELECT ps."balanceId",
         COUNT(*)::int AS "totalInstallments",
         (COUNT(*) FILTER (WHERE ps."isPaid"))::int AS "paidInstallments",
         COALESCE(SUM(ps.amount) FILTER (WHERE ps."isPaid"), 0)::int AS "paidAmount",
         (COUNT(*) FILTER (WHERE ps."isConsolidated"))::int AS "consolidatedInstallments",
         COALESCE(SUM(ps.amount) FILTER (WHERE ps."isConsolidated"), 0)::int AS "consolidatedAmount",
         COALESCE(
           (array_agg(ps.amount ORDER BY ps.ref) FILTER (WHERE NOT ps."isConsolidated"))[1],
           (array_agg(ps.amount ORDER BY ps.ref DESC))[1],
           0
         )::int AS "installmentAmount",
         SUM(ps.amount)::int AS "totalAmount",
         MIN(ps."dueDate") AS "firstDueDate",
         MIN(ps."effectiveDue") FILTER (WHERE NOT ps."isPaid") + INTERVAL '12 hours' AS "nextDueDate",
         MAX(ps."effectiveDue") + INTERVAL '12 hours' AS "endsAt",
         COALESCE(BOOL_OR(NOT ps."isPaid" AND ps."effectiveDue" < CURRENT_DATE), false) AS "isOverdue",
         COALESCE(
           (array_agg(ps."cardId" ORDER BY ps.ref) FILTER (WHERE NOT ps."isConsolidated" AND ps."cardId" IS NOT NULL))[1],
           (array_agg(ps."cardId" ORDER BY ps.ref DESC) FILTER (WHERE ps."cardId" IS NOT NULL))[1]
         ) AS "cardBalanceId"
  FROM part_status ps
  GROUP BY ps."balanceId"
)
SELECT i."balanceId",
       i."contextId",
       COALESCE(a."totalInstallments", 0)::int AS "totalInstallments",
       COALESCE(a."paidInstallments", 0)::int AS "paidInstallments",
       COALESCE(a."paidAmount", 0)::int AS "paidAmount",
       COALESCE(a."consolidatedInstallments", 0)::int AS "consolidatedInstallments",
       COALESCE(a."consolidatedAmount", 0)::int AS "consolidatedAmount",
       COALESCE(a."installmentAmount", 0)::int AS "installmentAmount",
       COALESCE(a."totalAmount", 0)::int AS "totalAmount",
       a."firstDueDate",
       a."nextDueDate",
       a."endsAt",
       COALESCE(a."isOverdue", false) AS "isOverdue",
       a."cardBalanceId",
       i."categoryBalanceId",
       i."removedAt"
FROM inst i
LEFT JOIN agg a ON a."balanceId" = i."balanceId";

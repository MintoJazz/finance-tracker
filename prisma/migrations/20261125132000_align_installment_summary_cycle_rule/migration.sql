-- Alinhamento da vw_installment_summary ao contrato canônico de competência e CycleRule:
--  * Mês a Mês passa a consultar a CycleRule vigente do próprio INSTALLMENT (assim como Em Fatura consulta a do cartão),
--    derivando effectiveDue de CycleRule.dueDay (com fallback para Entry.dueDate se não houver CycleRule);
--  * Aplica clamp ao último dia do mês em effectiveDue (corrige overflow de dueDay 29-31 em fevereiro);
--  * Mês a Mês passa a verificar quitação pela soma dos SETTLEMENT/CLAIM_PAYMENT redutores na janela [winFrom, winTo]
--    (>= valor da parcela), corrigindo falso positivo de pagamento parcial e rigidez de data exata.

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
  -- Regra vigente na competência da parcela: do cartão (Em Fatura) ou do próprio parcelamento (Mês a Mês).
  SELECT p.*,
         cr."closingDay" AS "ruleClosingDay",
         cr."dueDay" AS "ruleDueDay",
         CASE
           WHEN p."cardId" IS NOT NULL THEN COALESCE(cr."closingDay", cr."dueDay", 31)
           ELSE cr."closingDay"
         END AS "closeDay",
         CASE
           WHEN p."cardId" IS NOT NULL THEN
             (date_trunc('month', p.ref)
               + CASE WHEN EXTRACT(day FROM p.ref) <= COALESCE(cr."closingDay", cr."dueDay", 31)
                      THEN INTERVAL '0 month' ELSE INTERVAL '1 month' END)::date
           WHEN cr."closingDay" IS NOT NULL THEN
             (date_trunc('month', p.ref)
               + CASE WHEN EXTRACT(day FROM p.ref) <= cr."closingDay"
                      THEN INTERVAL '0 month' ELSE INTERVAL '1 month' END)::date
           ELSE date_trunc('month', p.ref)::date
         END AS "closingMonth"
  FROM part p
  LEFT JOIN LATERAL (
    SELECT r."closingDay", r."dueDay"
    FROM "CycleRule" r
    WHERE r."agreementId" = COALESCE(p."cardId", p."balanceId")
    ORDER BY (r."effectiveFrom" <= p.ref) DESC,
             CASE WHEN r."effectiveFrom" <= p.ref THEN r."effectiveFrom" END DESC NULLS LAST,
             r."effectiveFrom" ASC
    LIMIT 1
  ) cr ON TRUE
),
part_window AS NOT MATERIALIZED (
  -- Janela de competência [winFrom, winTo] e mês de vencimento (com clamp ao último dia do mês).
  SELECT pc.*,
         CASE
           WHEN pc."closeDay" IS NOT NULL THEN
             (pc."closingMonth"
               + (LEAST(pc."closeDay", EXTRACT(day FROM (pc."closingMonth" + INTERVAL '1 month - 1 day'))::int) - 1)
                 * INTERVAL '1 day')::date
           ELSE (pc."closingMonth" + INTERVAL '1 month - 1 day')::date
         END AS "winTo",
         CASE
           WHEN pc."closeDay" IS NOT NULL THEN
             ((pc."closingMonth" - INTERVAL '1 month')
               + (LEAST(pc."closeDay", EXTRACT(day FROM (pc."closingMonth" - INTERVAL '1 month' + INTERVAL '1 month - 1 day'))::int) - 1)
                 * INTERVAL '1 day' + INTERVAL '1 day')::date
           ELSE pc."closingMonth"
         END AS "winFrom",
         CASE
           WHEN pc."closeDay" IS NOT NULL AND pc."ruleDueDay" IS NOT NULL THEN
             (pc."closingMonth"
               + CASE WHEN pc."ruleDueDay" <= COALESCE(pc."ruleClosingDay", pc."ruleDueDay")
                      THEN INTERVAL '1 month' ELSE INTERVAL '0 month' END)::date
           ELSE pc."closingMonth"
         END AS "dueMonth"
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
         -- Vencimento efetivo derivado da CycleRule vigente (com clamp ao último dia do mês);
         -- fallback para Entry.dueDate apenas quando o parcelamento não possuir CycleRule.
         CASE
           WHEN pw."ruleDueDay" IS NOT NULL THEN
             (pw."dueMonth"
               + (LEAST(pw."ruleDueDay", EXTRACT(day FROM (pw."dueMonth" + INTERVAL '1 month - 1 day'))::int) - 1)
                 * INTERVAL '1 day')::date
           ELSE pw."dueDate"::date
         END AS "effectiveDue",
         CASE
           WHEN pw."cardId" IS NOT NULL THEN COALESCE((
             SELECT s.saldo <= 0
             FROM inv_saldo s
             WHERE s."cardId" = pw."cardId" AND s."winFrom" = pw."winFrom" AND s."winTo" = pw."winTo"), false)
           ELSE COALESCE((
             SELECT SUM(sm.amount)
             FROM "Movement" sm
             JOIN "Entry" s ON s.id = sm."entryId" AND s.type IN ('SETTLEMENT', 'CLAIM_PAYMENT')
             WHERE sm."balanceId" = pw."balanceId"
               AND sm.amount > 0 -- perna que reduz o parcelamento (liquidação)
               AND s."reversesEntryId" IS NULL
               AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = s.id)
               AND COALESCE(s."competanceDate", s."dueDate")::date BETWEEN pw."winFrom" AND pw."winTo"), 0) >= pw.amount
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

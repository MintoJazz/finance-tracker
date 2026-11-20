-- Resumo por parcelamento (1 linha por Balance INSTALLMENT com parcelas), com status coerente com o tipo:
--  * Em fatura (parcela com movement num cartão CREDIT): "paga" = a fatura onde a parcela caiu foi quitada
--    (SETTLEMENT no cartão com competência no mês de fechamento daquela fatura).
--  * Mês a mês (parcela ACCRUAL num PAYABLE): "paga" = existe SETTLEMENT do mesmo compromisso e mesma referência.
--  * Sem cartão nem compromisso: cai na semântica por data (vencimento já passou).
-- "Em atraso" = parcela não paga com vencimento (da fatura, nas parcelas em cartão) anterior a hoje. Parcelas estornadas são ignoradas.
-- Cartão e categoria vêm dos movements da parcela 1; valores em centavos.
-- Datas efetivas saem às 12:00 (como as do ledger) para não virarem o dia anterior ao formatar em fuso local.
-- nextDueDate/endsAt usam o vencimento efetivo (da fatura, nas parcelas em cartão); firstDueDate segue a data da parcela 1.
-- O tipo (fatura x mês a mês) não é armazenado: o domínio o deriva da presença de cardBalanceId.
DROP VIEW IF EXISTS vw_installment_summary;

CREATE VIEW vw_installment_summary AS
WITH
live AS NOT MATERIALIZED (
  SELECT e.id, e."installmentId", e."installmentNumber", e."dueDate",
         COALESCE(e."competanceDate", e."dueDate")::date AS ref
  FROM "Entry" e
  WHERE e."installmentId" IS NOT NULL
    AND e.type <> 'REVERSAL'
    AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
),
part AS NOT MATERIALIZED (
  SELECT l.*,
         (SELECT MIN(m."balanceId") FROM "Movement" m JOIN "Balance" b ON b.id = m."balanceId"
           WHERE m."entryId" = l.id AND b."balanceType" = 'CREDIT')  AS "cardId",
         (SELECT MIN(m."balanceId") FROM "Movement" m JOIN "Balance" b ON b.id = m."balanceId"
           WHERE m."entryId" = l.id AND b."balanceType" = 'PAYABLE') AS "commitId"
  FROM live l
),
part_closing AS NOT MATERIALIZED (
  -- Mês de fechamento da fatura da parcela: mesmo mês da referência se ela cai até o dia de fechamento
  -- vigente do cartão; senão, o mês seguinte.
  SELECT p.*,
         (date_trunc('month', p.ref)
           + CASE WHEN EXTRACT(day FROM p.ref) <= COALESCE(cr."closingDay", cr."dueDay", 31)
                  THEN INTERVAL '0 month' ELSE INTERVAL '1 month' END)::date AS "closingMonth",
         cr."closingDay" AS "ruleClosingDay", cr."dueDay" AS "ruleDueDay"
  FROM part p
  LEFT JOIN LATERAL (
    SELECT r."closingDay", r."dueDay"
    FROM "CycleRule" r
    WHERE r."agreementId" = p."cardId" AND r."effectiveFrom" <= p.ref
    ORDER BY r."effectiveFrom" DESC
    LIMIT 1
  ) cr ON p."cardId" IS NOT NULL
),
part_status AS NOT MATERIALIZED (
  SELECT pc."installmentId", pc."installmentNumber", pc."dueDate",
         -- Vencimento efetivo: em fatura, o da fatura (vence no mês do fechamento ou no seguinte, conforme o dia).
         CASE WHEN pc."cardId" IS NOT NULL AND pc."ruleDueDay" IS NOT NULL
              THEN (pc."closingMonth"
                    + CASE WHEN pc."ruleDueDay" <= COALESCE(pc."ruleClosingDay", pc."ruleDueDay")
                           THEN INTERVAL '1 month' ELSE INTERVAL '0 month' END
                    + (pc."ruleDueDay" - 1) * INTERVAL '1 day')::date
              ELSE pc."dueDate"::date END AS "effectiveDue",
         CASE
           WHEN pc."cardId" IS NOT NULL THEN EXISTS (
             SELECT 1
             FROM "Entry" s
             JOIN "Movement" sm ON sm."entryId" = s.id AND sm."balanceId" = pc."cardId"
             WHERE s.type = 'SETTLEMENT'
               AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = s.id)
               AND date_trunc('month', COALESCE(s."competanceDate", s."dueDate"))::date = pc."closingMonth")
           WHEN pc."commitId" IS NOT NULL THEN EXISTS (
             SELECT 1
             FROM "Entry" s
             JOIN "Movement" sm ON sm."entryId" = s.id AND sm."balanceId" = pc."commitId"
             WHERE s.type = 'SETTLEMENT'
               AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = s.id)
               AND COALESCE(s."competanceDate", s."dueDate")::date = pc.ref)
           ELSE pc."dueDate" <= now()
         END AS "isPaid"
  FROM part_closing pc
),
agg AS NOT MATERIALIZED (
  SELECT ps."installmentId" AS "balanceId",
         COUNT(*)::int AS "totalInstallments",
         (COUNT(*) FILTER (WHERE ps."isPaid"))::int AS "paidInstallments",
         MIN(ps."dueDate") AS "firstDueDate",
         MIN(ps."effectiveDue") FILTER (WHERE NOT ps."isPaid") + INTERVAL '12 hours' AS "nextDueDate",
         MAX(ps."effectiveDue") + INTERVAL '12 hours' AS "endsAt",
         COALESCE(BOOL_OR(NOT ps."isPaid" AND ps."effectiveDue" < CURRENT_DATE), false) AS "isOverdue"
  FROM part_status ps
  GROUP BY ps."installmentId"
),
first_entry AS NOT MATERIALIZED (
  SELECT DISTINCT ON (l."installmentId") l."installmentId" AS "balanceId", l.id AS "entryId"
  FROM live l
  ORDER BY l."installmentId", l."installmentNumber"
),
first_parts AS NOT MATERIALIZED (
  SELECT fe."balanceId",
         MIN(m."balanceId") FILTER (WHERE b."balanceType" = 'CREDIT')   AS "cardBalanceId",
         MIN(m."balanceId") FILTER (WHERE b."balanceType" = 'CATEGORY') AS "categoryBalanceId",
         COALESCE(SUM(ABS(m.amount)) FILTER (WHERE b."balanceType" = 'CATEGORY'), 0)::int AS "installmentAmount"
  FROM first_entry fe
  JOIN "Movement" m ON m."entryId" = fe."entryId"
  JOIN "Balance" b  ON b.id = m."balanceId"
  GROUP BY fe."balanceId"
)
SELECT a."balanceId",
       ib."contextId",
       a."totalInstallments",
       a."paidInstallments",
       fp."installmentAmount",
       (fp."installmentAmount" * a."totalInstallments")::int AS "totalAmount",
       a."firstDueDate",
       a."nextDueDate",
       a."endsAt",
       a."isOverdue",
       fp."cardBalanceId",
       fp."categoryBalanceId"
FROM agg a
JOIN "Balance" ib         ON ib.id = a."balanceId" AND ib."balanceType" = 'INSTALLMENT' AND ib."removedAt" IS NULL
LEFT JOIN first_parts fp  ON fp."balanceId" = a."balanceId";

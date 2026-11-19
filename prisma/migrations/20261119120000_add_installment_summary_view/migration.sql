-- Resumo por parcelamento (1 linha por Balance INSTALLMENT com parcelas).
-- "Paga" = vencimento já passou (semântica por data). Parcelas estornadas são ignoradas.
-- Cartão e categoria vêm dos movements da parcela 1; valores em centavos.
-- O tipo (fatura x mês a mês) não é armazenado: o domínio o deriva da presença de cardBalanceId.
DROP VIEW IF EXISTS vw_installment_summary;

CREATE VIEW vw_installment_summary AS
WITH
live AS NOT MATERIALIZED (
  SELECT e.id, e."installmentId", e."installmentNumber", e."dueDate"
  FROM "Entry" e
  WHERE e."installmentId" IS NOT NULL
    AND e.type <> 'REVERSAL'
    AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = e.id)
),
agg AS NOT MATERIALIZED (
  SELECT l."installmentId" AS "balanceId",
         COUNT(*)::int AS "totalInstallments",
         (COUNT(*) FILTER (WHERE l."dueDate" <= now()))::int AS "paidInstallments",
         MIN(l."dueDate") AS "firstDueDate",
         MIN(l."dueDate") FILTER (WHERE l."dueDate" > now()) AS "nextDueDate",
         MAX(l."dueDate") AS "endsAt"
  FROM live l
  GROUP BY l."installmentId"
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
       fp."cardBalanceId",
       fp."categoryBalanceId"
FROM agg a
JOIN "Balance" ib         ON ib.id = a."balanceId" AND ib."balanceType" = 'INSTALLMENT' AND ib."removedAt" IS NULL
LEFT JOIN first_parts fp  ON fp."balanceId" = a."balanceId";

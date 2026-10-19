-- Projeção de categoria por (entry, contexto). Depende de vw_entry_cycle_rule.
DROP VIEW IF EXISTS vw_entry_category;

CREATE VIEW vw_entry_category AS
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
link_cat AS NOT MATERIALIZED (
  SELECT * FROM cat_footprint WHERE credit = debit AND credit > 0
),

own AS NOT MATERIALIZED (
  SELECT e.id AS "entryId", r."contextId",
         CASE WHEN COUNT(*) = 1 THEN 'category' ELSE 'multiple' END AS kind,
         CASE WHEN COUNT(*) = 1 THEN MIN(r."categoryBalanceId") END AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM "Entry" e
  JOIN real_cat r ON r."entryId" = e.id
  WHERE e.type IN ('DIRECT', 'CLAIM_RECEIPT')
  GROUP BY e.id, r."contextId"
),

pass AS NOT MATERIALIZED (
  SELECT e.id AS "entryId", l."contextId",
         'pass-through' AS kind,
         MIN(l."categoryBalanceId") AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM "Entry" e
  JOIN link_cat l ON l."entryId" = e.id
  WHERE e.type = 'CLAIM_RECEIPT'
    AND NOT EXISTS (
      SELECT 1 FROM real_cat r
      WHERE r."entryId" = e.id AND r."contextId" = l."contextId"
    )
  GROUP BY e.id, l."contextId"
),

payment AS NOT MATERIALIZED (
  SELECT p.id AS "entryId", pb."contextId",
         CASE WHEN COUNT(DISTINCT l."categoryBalanceId") = 1
              THEN 'category' ELSE 'multiple' END AS kind,
         CASE WHEN COUNT(DISTINCT l."categoryBalanceId") = 1
              THEN MIN(l."categoryBalanceId") END AS "categoryBalanceId",
         NULL::int AS "creditBalanceId"
  FROM "Entry" p
  JOIN "Movement" pm ON pm."entryId" = p.id
  JOIN "Balance" pb  ON pb.id = pm."balanceId" AND pb."balanceType" = 'PAYABLE'
  JOIN "Movement" am ON am."balanceId" = pm."balanceId"
  JOIN "Entry" a     ON a.id = am."entryId" AND a.type = 'CLAIM_ACCEPTANCE'
  JOIN link_cat l    ON l."entryId" = a.id AND l."contextId" = pb."contextId"
  WHERE p.type = 'CLAIM_PAYMENT'
  GROUP BY p.id, pb."contextId"
),

credit_settlement AS NOT MATERIALIZED (
  SELECT s."entryId", ec."contextId",
         'credit-settlement' AS kind,
         NULL::int AS "categoryBalanceId",
         s."balanceId" AS "creditBalanceId"
  FROM vw_entry_cycle_rule s
  JOIN "Balance" cb ON cb.id = s."balanceId" AND cb."balanceType" = 'CREDIT'
  JOIN "Entry" e    ON e.id = s."entryId" AND e.type = 'SETTLEMENT'
  JOIN entry_ctx ec ON ec."entryId" = s."entryId"
),

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
  GROUP BY s."entryId", r."contextId"
),

resolved AS NOT MATERIALIZED (
  SELECT * FROM own
  UNION ALL SELECT * FROM pass
  UNION ALL SELECT * FROM payment
  UNION ALL SELECT * FROM credit_settlement
  UNION ALL SELECT * FROM cycle_settlement
)

SELECT ec."entryId", ec."contextId",
       COALESCE(r.kind, 'none') AS kind,
       r."categoryBalanceId",
       r."creditBalanceId"
FROM entry_ctx ec
LEFT JOIN resolved r USING ("entryId", "contextId");
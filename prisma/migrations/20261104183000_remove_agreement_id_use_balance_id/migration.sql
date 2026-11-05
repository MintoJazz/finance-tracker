-- 1. Drop dependent views
DROP VIEW IF EXISTS "vw_entry_category";
DROP VIEW IF EXISTS "vw_entry_cycle_rule";

-- 2. Drop existing foreign keys and unique constraint on CycleRule
ALTER TABLE "AgreementAmountEntry" DROP CONSTRAINT IF EXISTS "AgreementAmountEntry_agreementId_fkey";
ALTER TABLE "CycleRule" DROP CONSTRAINT IF EXISTS "CycleRule_agreementId_fkey";
ALTER TABLE "CycleRule" DROP CONSTRAINT IF EXISTS "CycleRule_agreementId_effectiveFrom_key";
DROP INDEX IF EXISTS "CycleRule_agreementId_effectiveFrom_key";

-- 3. Migrate data: update agreementId to match Agreement.balanceId
UPDATE "CycleRule" cr
SET "agreementId" = a."balanceId"
FROM "Agreement" a
WHERE cr."agreementId" = a."id";

UPDATE "AgreementAmountEntry" aae
SET "agreementId" = a."balanceId"
FROM "Agreement" a
WHERE aae."agreementId" = a."id";

-- 4. Re-add unique constraint on CycleRule
ALTER TABLE "CycleRule" ADD CONSTRAINT "CycleRule_agreementId_effectiveFrom_key" UNIQUE ("agreementId", "effectiveFrom");

-- 5. Alter Agreement table: drop old PK and id column, promote balanceId to PK
DROP INDEX IF EXISTS "Agreement_balanceId_key";
ALTER TABLE "Agreement" DROP CONSTRAINT IF EXISTS "Agreement_pkey";
ALTER TABLE "Agreement" DROP COLUMN IF EXISTS "id";
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_pkey" PRIMARY KEY ("balanceId");

-- 6. Recreate foreign keys referencing Agreement("balanceId")
ALTER TABLE "CycleRule" ADD CONSTRAINT "CycleRule_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("balanceId") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "AgreementAmountEntry" ADD CONSTRAINT "AgreementAmountEntry_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("balanceId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- 7. Recreate vw_entry_cycle_rule
CREATE OR REPLACE VIEW "vw_entry_cycle_rule" AS
WITH rule_windows AS (
  SELECT 
    cr.id AS "cycleRuleId",
    cr."agreementId",
    cr."agreementId" AS "balanceId",
    cr."effectiveFrom",
    LEAD(cr."effectiveFrom") OVER (
      PARTITION BY cr."agreementId" 
      ORDER BY cr."effectiveFrom" ASC, cr.id ASC
    ) AS "effectiveTo"
  FROM "CycleRule" cr
  JOIN "Agreement" a ON a."balanceId" = cr."agreementId"
)
SELECT DISTINCT
  e.id AS "entryId",
  rw."cycleRuleId",
  rw."agreementId",
  rw."balanceId",
  COALESCE(e."competanceDate", e."dueDate") AS "referenceDate"
FROM "Entry" e
JOIN "Movement" m ON m."entryId" = e.id
JOIN rule_windows rw ON rw."balanceId" = m."balanceId"
WHERE COALESCE(e."competanceDate", e."dueDate") >= rw."effectiveFrom"
  AND (
    rw."effectiveTo" IS NULL 
    OR COALESCE(e."competanceDate", e."dueDate") < rw."effectiveTo"
  )
  AND e."reversesEntryId" IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Entry" rev WHERE rev."reversesEntryId" = e.id
  );

-- 8. Recreate vw_entry_category
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
  GROUP BY s."entryId", r."contextId"
),

-- Herança estrutural via parentId para PAYABLE e RECEIVABLE (CLAIM_PAYMENT, CLAIM_OPENING, SETTLEMENT direto)
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
  WHERE b."balanceType" IN ('PAYABLE', 'RECEIVABLE')
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

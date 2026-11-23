-- Classifica liquidações pelo SENTIDO da perna, não só pelo tipo do Entry (mesma regra do motor de ciclos,
-- ver specs/contrato_obrigacoes.md §5): só a perna que REDUZ o saldo da obrigação/cartão é pagamento.
--  * vw_entry_category: `credit_settlement` (pagamento de fatura) e `cycle_settlement` (liquidação de contrato).
--  * vw_installment_summary: a detecção de parcela paga (cartão e compromisso).
-- Em dados normais (liquidações sempre redutoras) o resultado das views não muda.

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
               AND sm.amount > 0 -- perna que reduz a dívida do cartão (pagamento da fatura)
               AND NOT EXISTS (SELECT 1 FROM "Entry" r WHERE r."reversesEntryId" = s.id)
               AND date_trunc('month', COALESCE(s."competanceDate", s."dueDate"))::date = pc."closingMonth")
           WHEN pc."commitId" IS NOT NULL THEN EXISTS (
             SELECT 1
             FROM "Entry" s
             JOIN "Movement" sm ON sm."entryId" = s.id AND sm."balanceId" = pc."commitId"
             WHERE s.type = 'SETTLEMENT'
               AND sm.amount > 0 -- perna que reduz o compromisso (liquidação)
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

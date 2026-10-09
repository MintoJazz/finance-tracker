-- 1. Renomear LimitEntry para AgreementAmountEntry e renomear chave primária
ALTER TABLE "LimitEntry" RENAME TO "AgreementAmountEntry";
ALTER TABLE "AgreementAmountEntry" RENAME CONSTRAINT "LimitEntry_pkey" TO "AgreementAmountEntry_pkey";
DROP INDEX IF EXISTS "LimitEntry_balanceId_idx";

-- 2. Adicionar coluna temporária/nova agreementId
ALTER TABLE "AgreementAmountEntry" ADD COLUMN "agreementId" INTEGER;

-- 3. Preencher agreementId a partir de Agreement.balanceId (relação 1:1)
UPDATE "AgreementAmountEntry" aae
SET "agreementId" = a."id"
FROM "Agreement" a
WHERE a."balanceId" = aae."balanceId";

-- 4. Verificação estrita de órfãos: falha com erro explícito se houver algum registro sem Agreement
DO $$
DECLARE
  orphan_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO orphan_count
  FROM "AgreementAmountEntry"
  WHERE "agreementId" IS NULL;

  IF orphan_count > 0 THEN
    RAISE EXCEPTION 'Migration falhou: existem % registro(s) de LimitEntry com balanceId sem Agreement associado.', orphan_count;
  END IF;
END $$;

-- 5. Tornar agreementId NOT NULL, remover balanceId e adicionar chave estrangeira e índices
ALTER TABLE "AgreementAmountEntry" ALTER COLUMN "agreementId" SET NOT NULL;
ALTER TABLE "AgreementAmountEntry" DROP CONSTRAINT IF EXISTS "LimitEntry_balanceId_fkey";
ALTER TABLE "AgreementAmountEntry" DROP COLUMN "balanceId";

ALTER TABLE "AgreementAmountEntry" ADD CONSTRAINT "AgreementAmountEntry_agreementId_fkey" 
  FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

CREATE INDEX "AgreementAmountEntry_agreementId_effectiveAt_idx" 
  ON "AgreementAmountEntry"("agreementId", "effectiveAt");

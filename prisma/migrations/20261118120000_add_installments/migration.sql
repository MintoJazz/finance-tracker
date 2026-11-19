-- AlterEnum
ALTER TYPE "BalanceType" ADD VALUE 'INSTALLMENT';

-- AlterTable
ALTER TABLE "Entry" ADD COLUMN     "installmentId" INTEGER,
ADD COLUMN     "installmentNumber" INTEGER;

-- CreateIndex
CREATE INDEX "Entry_installmentId_idx" ON "Entry"("installmentId");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_installmentId_installmentNumber_key" ON "Entry"("installmentId", "installmentNumber");

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_installmentId_fkey" FOREIGN KEY ("installmentId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

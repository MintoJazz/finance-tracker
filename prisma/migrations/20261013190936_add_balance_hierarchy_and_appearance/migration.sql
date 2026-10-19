/*
  Warnings:

  - A unique constraint covering the columns `[id,contextId,balanceType]` on the table `Balance` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Balance" ADD COLUMN     "parentId" INTEGER;

-- CreateTable
CREATE TABLE "BalanceAppearance" (
    "balanceId" INTEGER NOT NULL,
    "icon" TEXT,
    "color" TEXT,

    CONSTRAINT "BalanceAppearance_pkey" PRIMARY KEY ("balanceId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Balance_id_contextId_balanceType_key" ON "Balance"("id", "contextId", "balanceType");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BalanceAppearance" ADD CONSTRAINT "BalanceAppearance_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

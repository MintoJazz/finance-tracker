/*
  Warnings:

  - You are about to drop the column `frequency` on the `CycleRule` table. All the data in the column will be lost.
  - You are about to drop the column `interval` on the `CycleRule` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Agreement" ADD COLUMN     "frequency" "CycleFrequency" NOT NULL DEFAULT 'MONTHLY',
ADD COLUMN     "interval" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "CycleRule" DROP COLUMN "frequency",
DROP COLUMN "interval",
ADD COLUMN     "closingMonth" INTEGER,
ADD COLUMN     "dueMonth" INTEGER;

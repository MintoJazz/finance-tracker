/*
  Warnings:

  - Added the required column `type` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('EXPENSE', 'INCOME', 'TRANSFER');

-- CreateEnum
CREATE TYPE "TransactionKind" AS ENUM ('DEFAULT', 'INVOICE', 'ORDER');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "kind" "TransactionKind" NOT NULL DEFAULT 'DEFAULT',
ADD COLUMN     "type" "TransactionType" NOT NULL,
ALTER COLUMN "status" SET DEFAULT 'PROJECTED';

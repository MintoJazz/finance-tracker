/*
  Warnings:

  - You are about to drop the column `memberId` on the `Bucket` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `Bucket` table. All the data in the column will be lost.
  - You are about to drop the column `isShared` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `kind` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `workspaceId` on the `Transaction` table. All the data in the column will be lost.
  - You are about to drop the column `email` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `Membership` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Workspace` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `userId` to the `Bucket` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Bucket" DROP CONSTRAINT "Bucket_memberId_fkey";

-- DropForeignKey
ALTER TABLE "Bucket" DROP CONSTRAINT "Bucket_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_userId_fkey";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_workspaceId_fkey";

-- DropForeignKey
ALTER TABLE "Movement" DROP CONSTRAINT "Movement_bucketId_fkey";

-- DropForeignKey
ALTER TABLE "Transaction" DROP CONSTRAINT "Transaction_workspaceId_fkey";

-- DropIndex
DROP INDEX "User_email_key";

-- AlterTable
ALTER TABLE "Bucket" DROP COLUMN "memberId",
DROP COLUMN "workspaceId",
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Movement" ALTER COLUMN "bucketId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "isShared",
DROP COLUMN "kind",
DROP COLUMN "workspaceId";

-- AlterTable
ALTER TABLE "User" DROP COLUMN "email",
ADD COLUMN     "name" TEXT NOT NULL;

-- DropTable
DROP TABLE "Membership";

-- DropTable
DROP TABLE "Workspace";

-- DropEnum
DROP TYPE "TransactionKind";

-- AddForeignKey
ALTER TABLE "Bucket" ADD CONSTRAINT "Bucket_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_bucketId_fkey" FOREIGN KEY ("bucketId") REFERENCES "Bucket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

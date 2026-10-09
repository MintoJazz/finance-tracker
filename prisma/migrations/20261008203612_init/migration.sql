-- CreateEnum
CREATE TYPE "CycleFrequency" AS ENUM ('WEEKLY', 'MONTHLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "BalanceType" AS ENUM ('WALLET', 'CREDIT', 'RESERVE', 'CATEGORY', 'COMMITMENT', 'RECEIVABLE', 'PAYABLE');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('DIRECT', 'TRANSFER', 'ACCRUAL', 'CLAIM_OPENING', 'SETTLEMENT', 'CLAIM_PAYMENT', 'CLAIM_RECEIPT', 'ADJUSTMENT', 'CLAIM_ACCEPTANCE', 'REVERSAL');

-- CreateEnum
CREATE TYPE "MovementDirection" AS ENUM ('CREDIT', 'DEBIT');

-- CreateEnum
CREATE TYPE "FriendshipStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'BLOCKED');

-- CreateEnum
CREATE TYPE "ContextMemberRole" AS ENUM ('OWNER', 'ADMIN', 'MEMBER', 'DEPENDENT');

-- CreateEnum
CREATE TYPE "ContextMemberStatus" AS ENUM ('PENDING', 'ACTIVE', 'REMOVED');

-- CreateEnum
CREATE TYPE "AttachmentStatus" AS ENUM ('PENDING', 'CONFIRMED');

-- CreateEnum
CREATE TYPE "AttachmentPurpose" AS ENUM ('AVATAR', 'ENTRY_RECEIPT');

-- CreateTable
CREATE TABLE "Balance" (
    "id" SERIAL NOT NULL,
    "contextId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "balanceType" "BalanceType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "removedAt" TIMESTAMP(3),

    CONSTRAINT "Balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Agreement" (
    "id" SERIAL NOT NULL,
    "balanceId" INTEGER NOT NULL,
    "includeInProjection" BOOLEAN NOT NULL DEFAULT true,
    "startsAt" DATE NOT NULL,
    "endsAt" DATE,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agreement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CycleRule" (
    "id" SERIAL NOT NULL,
    "agreementId" INTEGER NOT NULL,
    "effectiveFrom" DATE NOT NULL,
    "frequency" "CycleFrequency" NOT NULL DEFAULT 'MONTHLY',
    "interval" INTEGER NOT NULL DEFAULT 1,
    "closingDay" INTEGER,
    "dueDay" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CycleRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LimitEntry" (
    "id" SERIAL NOT NULL,
    "balanceId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "effectiveAt" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LimitEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Party" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "birthDate" TIMESTAMP(3),
    "documentNumber" TEXT,
    "phone" TEXT,
    "managedByPartyId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Party_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Auth" (
    "partyId" INTEGER NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "emailVerifiedAt" TIMESTAMP(3),
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Auth_pkey" PRIMARY KEY ("partyId")
);

-- CreateTable
CREATE TABLE "Entry" (
    "id" SERIAL NOT NULL,
    "description" TEXT NOT NULL,
    "type" "EntryType" NOT NULL,
    "reversesEntryId" INTEGER,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "competanceDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Entry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Movement" (
    "id" SERIAL NOT NULL,
    "entryId" INTEGER NOT NULL,
    "balanceId" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "direction" "MovementDirection" NOT NULL,

    CONSTRAINT "Movement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Friendship" (
    "requesterId" INTEGER NOT NULL,
    "receiverId" INTEGER NOT NULL,
    "status" "FriendshipStatus" NOT NULL DEFAULT 'PENDING',
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "respondedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Friendship_pkey" PRIMARY KEY ("requesterId","receiverId")
);

-- CreateTable
CREATE TABLE "FinancialContext" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FinancialContext_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContextMember" (
    "contextId" INTEGER NOT NULL,
    "partyId" INTEGER NOT NULL,
    "invitedByPartyId" INTEGER,
    "role" "ContextMemberRole" NOT NULL,
    "status" "ContextMemberStatus" NOT NULL DEFAULT 'PENDING',
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "joinedAt" TIMESTAMP(3),
    "removedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContextMember_pkey" PRIMARY KEY ("contextId","partyId")
);

-- CreateTable
CREATE TABLE "Attachment" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "purpose" "AttachmentPurpose" NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "status" "AttachmentStatus" NOT NULL DEFAULT 'PENDING',
    "ownerPartyId" INTEGER NOT NULL,
    "contextId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),

    CONSTRAINT "Attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agreement_balanceId_key" ON "Agreement"("balanceId");

-- CreateIndex
CREATE INDEX "CycleRule_agreementId_idx" ON "CycleRule"("agreementId");

-- CreateIndex
CREATE UNIQUE INDEX "CycleRule_agreementId_effectiveFrom_key" ON "CycleRule"("agreementId", "effectiveFrom");

-- CreateIndex
CREATE INDEX "LimitEntry_balanceId_idx" ON "LimitEntry"("balanceId");

-- CreateIndex
CREATE UNIQUE INDEX "Party_documentNumber_key" ON "Party"("documentNumber");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_partyId_key" ON "Auth"("partyId");

-- CreateIndex
CREATE UNIQUE INDEX "Auth_email_key" ON "Auth"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Entry_reversesEntryId_key" ON "Entry"("reversesEntryId");

-- CreateIndex
CREATE INDEX "Movement_balanceId_idx" ON "Movement"("balanceId");

-- CreateIndex
CREATE UNIQUE INDEX "FinancialContext_id_key" ON "FinancialContext"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Attachment_key_key" ON "Attachment"("key");

-- CreateIndex
CREATE INDEX "Attachment_status_createdAt_idx" ON "Attachment"("status", "createdAt");

-- CreateIndex
CREATE INDEX "Attachment_ownerPartyId_idx" ON "Attachment"("ownerPartyId");

-- AddForeignKey
ALTER TABLE "Balance" ADD CONSTRAINT "Balance_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "FinancialContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agreement" ADD CONSTRAINT "Agreement_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CycleRule" ADD CONSTRAINT "CycleRule_agreementId_fkey" FOREIGN KEY ("agreementId") REFERENCES "Agreement"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LimitEntry" ADD CONSTRAINT "LimitEntry_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Party" ADD CONSTRAINT "Party_managedByPartyId_fkey" FOREIGN KEY ("managedByPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Auth" ADD CONSTRAINT "Auth_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Entry" ADD CONSTRAINT "Entry_reversesEntryId_fkey" FOREIGN KEY ("reversesEntryId") REFERENCES "Entry"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_entryId_fkey" FOREIGN KEY ("entryId") REFERENCES "Entry"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Movement" ADD CONSTRAINT "Movement_balanceId_fkey" FOREIGN KEY ("balanceId") REFERENCES "Balance"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "Auth"("partyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Friendship" ADD CONSTRAINT "Friendship_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "Auth"("partyId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextMember" ADD CONSTRAINT "ContextMember_contextId_fkey" FOREIGN KEY ("contextId") REFERENCES "FinancialContext"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextMember" ADD CONSTRAINT "ContextMember_partyId_fkey" FOREIGN KEY ("partyId") REFERENCES "Party"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContextMember" ADD CONSTRAINT "ContextMember_invitedByPartyId_fkey" FOREIGN KEY ("invitedByPartyId") REFERENCES "Party"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- View de pareamento temporal entre Entry e CycleRule
CREATE OR REPLACE VIEW "vw_entry_cycle_rule" AS
WITH rule_windows AS (
  SELECT 
    cr.id AS "cycleRuleId",
    cr."agreementId",
    a."balanceId",
    cr."effectiveFrom",
    LEAD(cr."effectiveFrom") OVER (
      PARTITION BY cr."agreementId" 
      ORDER BY cr."effectiveFrom" ASC, cr.id ASC
    ) AS "effectiveTo"
  FROM "CycleRule" cr
  JOIN "Agreement" a ON a.id = cr."agreementId"
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
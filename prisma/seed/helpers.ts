import { hash } from "bcryptjs";
import type { prisma as PrismaInstance } from "../../lib/prisma";

export type PrismaClientInstance = typeof PrismaInstance;

const SALT_ROUNDS = 10;

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export async function resetDatabase(prisma: PrismaClientInstance) {
  await prisma.$transaction(async (tx) => {
    await tx.movement.deleteMany();
    await tx.entry.deleteMany();
    await tx.cycleRule.deleteMany();
    await tx.recurrence.deleteMany();
    await tx.limitEntry.deleteMany();
    await tx.balance.deleteMany();
    await tx.friendship.deleteMany();
    await tx.contextMember.deleteMany();
    await tx.financialContext.deleteMany();
    await tx.auth.deleteMany();
    await tx.party.deleteMany();
  });
}
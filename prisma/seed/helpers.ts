import { readFileSync } from "node:fs";
import { join } from "node:path";
import { hash } from "bcryptjs";
import type { SeedData } from "./types";
import type { prisma as PrismaInstance } from "../../lib/prisma";

type Prisma = typeof PrismaInstance;

const SALT_ROUNDS = 10;

export function loadSeedData(): SeedData {
  // Resolve a partir da raiz do projeto (onde o comando de seed é executado)
  const path = join(process.cwd(), "prisma", "seed", "data.json");
  return JSON.parse(readFileSync(path, "utf-8")) as SeedData;
}

export function hashPassword(plain: string): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

/**
 * Apaga tudo, respeitando a ordem das FKs
 * (Movement -> Balance é Restrict, então Movement sai primeiro).
 */
export async function resetDatabase(prisma: Prisma) {
  await prisma.$transaction([
    prisma.movement.deleteMany(),
    prisma.entry.deleteMany(),
    prisma.balance.deleteMany(),
    prisma.friendship.deleteMany(),
    prisma.contextMember.deleteMany(),
    prisma.financialContext.deleteMany(),
    prisma.auth.deleteMany(),
    prisma.party.deleteMany(),
  ]);
}
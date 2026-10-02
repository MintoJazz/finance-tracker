import { hash } from "bcryptjs";
import type { prisma as PrismaInstance } from "../../../lib/prisma";

export type PrismaClientInstance = typeof PrismaInstance;

const SALT_ROUNDS = 10;
export const DEFAULT_PASSWORD = "123456";

export function hashPassword(plain: string = DEFAULT_PASSWORD): Promise<string> {
  return hash(plain, SALT_ROUNDS);
}

export async function resetDatabase(prisma: PrismaClientInstance): Promise<void> {
  const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`
    SELECT tablename 
    FROM pg_tables 
    WHERE schemaname = 'public' 
      AND tablename != '_prisma_migrations';
  `;

  if (tablenames.length === 0) return;

  const tables = tablenames
    .map(({ tablename }) => `"public"."${tablename}"`)
    .join(", ");

  await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} RESTART IDENTITY CASCADE;`);
}
import "dotenv/config";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/prisma/generated/prisma/client";

const globalForPrisma = globalThis as unknown as {
  prismaPool?: Pool;
  prisma?: PrismaClient;
};

const pool =
  globalForPrisma.prismaPool ??
  new Pool({ connectionString: process.env.DATABASE_URL });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter: new PrismaPg(pool),
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prismaPool = pool;
  globalForPrisma.prisma = prisma;
}
import type { Prisma, PrismaClient } from "@/prisma/generated/prisma/client";

/**
 * Cliente Prisma "global" ou o cliente de uma transação já aberta (ex.: vindo de uma UoW).
 * Repositórios aceitam qualquer um dos dois no construtor.
 *
 * Observação: o cliente de transação também expõe `$transaction`, e uma `$transaction`
 * aninhada executa na MESMA transação do banco (mesmo txid). Por isso os repositórios
 * podem chamar `this.prismaClient.$transaction(...)` normalmente: com o cliente global
 * abre uma nova transação; com o cliente de uma UoW, participa da transação dela.
 */
export type PrismaClientLike = PrismaClient | Prisma.TransactionClient;

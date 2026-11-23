import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { Prisma, type PrismaClient } from "@/prisma/generated/prisma/client";
import { CategoryPrismaRepository } from "@/modules/categories/infra/repositories/category-prisma.repository";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { success } from "@/types/result.types";
import type { InstallmentFormValues } from "../../models/schemas/installment-form.schema";
import type { IInstallmentUnitOfWork } from "../../application/interfaces/installment-uow.interface";
import { CreateInstallmentUseCase } from "../../application/use-cases/create-installment.use-case";
import { InstallmentPrismaUnitOfWork } from "../uow/installment-prisma.uow";
import { InstallmentPrismaRepository } from "./installment-prisma.repository";

/**
 * Integração do backend de escrita com o banco: cria parcelamentos de ponta a ponta (use-case,
 * repositórios, Prisma) e confere o ledger e o que as views enxergam.
 * Cada caso roda numa transação que SEMPRE sofre rollback.
 */

class Rollback extends Error {}

async function inRollback(fn: (tx: Prisma.TransactionClient) => Promise<void>) {
    try {
        await prisma.$transaction(
            async (tx) => {
                await fn(tx);
                throw new Rollback();
            },
            { timeout: 60_000 }
        );
    } catch (error) {
        if (!(error instanceof Rollback)) throw error;
    }
}

const draft = (name: string) => ({ name, color: "#06B6D4", icon: "Tag" });

async function setup(tx: Prisma.TransactionClient) {
    const context = await tx.financialContext.create({ data: { name: "spec-installment-write" } });
    const card = await tx.balance.create({
        data: {
            contextId: context.id,
            name: "Cartão",
            balanceType: "CREDIT",
            agreement: {
                create: {
                    isActive: true,
                    frequency: "MONTHLY",
                    interval: 1,
                    startsAt: new Date("2020-01-01"),
                    rules: {
                        create: { effectiveFrom: new Date("2020-01-01"), dueDay: 5, closingDay: 28 },
                    },
                },
            },
        },
    });

    const unitOfWork: IInstallmentUnitOfWork = {
        run: (work) =>
            work({
                categoryRepo: new CategoryPrismaRepository(tx),
                installmentRepo: new InstallmentPrismaRepository(tx),
            }),
    };
    const getSpaceAccess = {
        execute: async () => success({ canViewBalances: true, canManageBalances: true }),
    } as unknown as ISpaceAccessProvider;
    const useCase = new CreateInstallmentUseCase(unitOfWork, getSpaceAccess);
    const session = { contextId: context.id, partyId: 1 };

    const form = (overrides: Partial<InstallmentFormValues>): InstallmentFormValues => ({
        type: "INVOICE",
        name: "Notebook",
        totalAmount: 10000,
        totalInstallments: 3,
        purchaseDate: "2030-11-15",
        cardId: card.id,
        categoryId: null,
        newCategory: draft("Eletrônicos"),
        subcategoryId: null,
        newSubcategory: draft("Notebooks"),
        ...overrides,
    });

    const summary = async (installmentId: number) => {
        const rows = await tx.$queryRaw<
            {
                totalInstallments: number;
                paidInstallments: number;
                installmentAmount: number;
                totalAmount: number;
                cardBalanceId: number | null;
                categoryBalanceId: number | null;
            }[]
        >(
            Prisma.sql`SELECT "totalInstallments", "paidInstallments", "installmentAmount", "totalAmount",
                              "cardBalanceId", "categoryBalanceId"
                       FROM vw_installment_summary WHERE "balanceId" = ${installmentId}`
        );
        assert.equal(rows.length, 1, "o parcelamento deve aparecer na view");
        return rows[0];
    };

    const entriesOf = (installmentId: number) =>
        tx.entry.findMany({
            where: { movements: { some: { balanceId: installmentId } } },
            include: { movements: true },
            orderBy: { id: "asc" },
        });

    return { tx, context, card, useCase, session, form, summary, entriesOf };
}

describe("InstallmentPrismaRepository / CreateInstallmentUseCase - integração", () => {
    after(async () => {
        await prisma.$disconnect();
    });

    it("fatura: cria Balance, Agreement e 2N entries balanceados; a view enxerga o parcelamento", () =>
        inRollback(async (tx) => {
            const { card, useCase, session, form, summary, entriesOf } = await setup(tx);
            const result = await useCase.execute({ session, data: form({}) });
            assert.equal(result.success, true);
            if (!result.success) return;

            const balance = await tx.balance.findUniqueOrThrow({
                where: { id: result.data.id },
                include: { agreement: { include: { rules: true, amountEntries: true } } },
            });
            assert.equal(balance.balanceType, "INSTALLMENT");
            assert.equal(balance.name, "Notebook");
            assert.ok(balance.parentId != null, "parentId aponta para a subcategoria criada");
            assert.equal(balance.agreement?.frequency, "MONTHLY");
            assert.equal(balance.agreement?.startsAt.toISOString().slice(0, 10), "2030-11-15");
            assert.equal(balance.agreement?.endsAt?.toISOString().slice(0, 10), "2031-01-15");
            assert.equal(balance.agreement?.rules[0].dueDay, 15);
            assert.deepEqual(
                balance.agreement?.amountEntries.map((a) => a.amount).sort((a, b) => a - b),
                [1, 3333]
            );

            // subcategoria criada sob a categoria criada, ambas do tipo CATEGORY
            const sub = await tx.balance.findUniqueOrThrow({ where: { id: balance.parentId! } });
            assert.equal(sub.balanceType, "CATEGORY");
            assert.equal(sub.name, "Notebooks");
            const parent = await tx.balance.findUniqueOrThrow({ where: { id: sub.parentId! } });
            assert.equal(parent.name, "Eletrônicos");

            const entries = await entriesOf(balance.id);
            assert.equal(entries.length, 6);
            assert.deepEqual(
                entries.map((e) => e.type),
                ["ACCRUAL", "TRANSFER", "ACCRUAL", "TRANSFER", "ACCRUAL", "TRANSFER"]
            );
            for (const entry of entries) {
                assert.equal(entry.movements.length, 2);
                assert.equal(entry.movements.reduce((acc, m) => acc + m.amount, 0), 0);
            }
            assert.deepEqual(
                entries.filter((e) => e.type === "TRANSFER").map((e) => e.dueDate.toISOString()),
                ["2030-11-15T12:00:00.000Z", "2030-12-15T12:00:00.000Z", "2031-01-15T12:00:00.000Z"]
            );

            const row = await summary(balance.id);
            assert.equal(row.totalInstallments, 3);
            assert.equal(row.paidInstallments, 0);
            assert.equal(row.installmentAmount, 3333);
            assert.equal(row.totalAmount, 10000);
            assert.equal(row.cardBalanceId, card.id);
            assert.equal(row.categoryBalanceId, balance.parentId);
        }));

    it("mês a mês: N accruals, sem perna de cartão; tipo derivado sem cartão", () =>
        inRollback(async (tx) => {
            const { useCase, session, form, summary, entriesOf } = await setup(tx);
            const result = await useCase.execute({
                session,
                data: form({ type: "MONTHLY", cardId: null }),
            });
            assert.equal(result.success, true);
            if (!result.success) return;

            const entries = await entriesOf(result.data.id);
            assert.equal(entries.length, 3);
            assert.ok(entries.every((e) => e.type === "ACCRUAL"));

            const row = await summary(result.data.id);
            assert.equal(row.cardBalanceId, null);
            assert.equal(row.totalAmount, 10000);
            assert.equal(row.paidInstallments, 0);
        }));

    it("o limite do cartão passa a refletir o total e a fatura reconhece as parcelas", () =>
        inRollback(async (tx) => {
            const { card, useCase, session, form } = await setup(tx);
            const result = await useCase.execute({ session, data: form({}) });
            assert.equal(result.success, true);

            const grouped = await tx.movement.aggregate({
                where: { balanceId: card.id },
                _sum: { amount: true },
            });
            assert.equal(grouped._sum.amount, -10000);
        }));

    it("cartão arquivado: erro e nada é gravado", () =>
        inRollback(async (tx) => {
            const { card, useCase, session, form } = await setup(tx);
            await tx.balance.update({ where: { id: card.id }, data: { removedAt: new Date() } });

            const result = await useCase.execute({ session, data: form({}) });
            assert.equal(result.success, false);
            if (!result.success) assert.match(result.error, /arquivado/i);
            assert.equal(await tx.balance.count({ where: { balanceType: "INSTALLMENT", contextId: session.contextId } }), 0);
        }));

    it("cartão de outro contexto não é aceito", () =>
        inRollback(async (tx) => {
            const { useCase, session, form } = await setup(tx);
            const other = await tx.financialContext.create({ data: { name: "spec-outro-contexto" } });
            const foreignCard = await tx.balance.create({
                data: { contextId: other.id, name: "Cartão alheio", balanceType: "CREDIT" },
            });

            const result = await useCase.execute({ session, data: form({ cardId: foreignCard.id }) });
            assert.equal(result.success, false);
            if (!result.success) assert.match(result.error, /não encontrado/i);
        }));

    it("120 parcelas em fatura (240 entries) cabem numa transação", () =>
        inRollback(async (tx) => {
            const { useCase, session, form, summary, entriesOf } = await setup(tx);
            const result = await useCase.execute({
                session,
                data: form({ totalAmount: 1200000, totalInstallments: 120 }),
            });
            assert.equal(result.success, true);
            if (!result.success) return;

            assert.equal((await entriesOf(result.data.id)).length, 240);
            const row = await summary(result.data.id);
            assert.equal(row.totalInstallments, 120);
            assert.equal(row.totalAmount, 1200000);
        }));
});

describe("InstallmentPrismaUnitOfWork", () => {
    it("a transação real é desfeita por inteiro quando o trabalho falha (opções de timeout válidas)", async () => {
        const uow = new InstallmentPrismaUnitOfWork(prisma as unknown as PrismaClient);
        const context = await prisma.financialContext.create({ data: { name: "spec-uow-rollback" } });
        try {
            await assert.rejects(
                uow.run(async ({ installmentRepo }) => {
                    await installmentRepo.create({
                        contextId: context.id,
                        name: "Será desfeito",
                        type: "MONTHLY",
                        subcategoryId: (
                            await prisma.balance.create({
                                data: { contextId: context.id, name: "Cat", balanceType: "CATEGORY" },
                            })
                        ).id,
                        cardId: null,
                        schedule: [
                            { number: 1, date: "2030-11-15", amount: 100 },
                            { number: 2, date: "2030-12-15", amount: 100 },
                        ],
                    });
                    throw new Error("falha no meio");
                }),
                /falha no meio/
            );
            // o Balance INSTALLMENT criado dentro da transação não pode ter sobrado
            assert.equal(
                await prisma.balance.count({ where: { contextId: context.id, balanceType: "INSTALLMENT" } }),
                0
            );
        } finally {
            await prisma.financialContext.delete({ where: { id: context.id } });
        }
    });
});

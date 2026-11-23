import assert from "node:assert/strict";
import { after, describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { Prisma, type PrismaClient } from "@/prisma/generated/prisma/client";
import { CycleWindowEngine } from "@/modules/cycles/application/services/cycle-window.engine";
import { CyclePrismaQueries } from "@/modules/cycles/infra/repositories/cycle-prisma.queries";
import { CategoryPrismaRepository } from "@/modules/categories/infra/repositories/category-prisma.repository";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { success } from "@/types/result.types";
import type { IInstallmentUnitOfWork } from "../../application/interfaces/installment-uow.interface";
import { CreateInstallmentUseCase } from "../../application/use-cases/create-installment.use-case";
import { InstallmentPrismaRepository } from "./installment-prisma.repository";

/**
 * Paridade entre `vw_installment_summary` (que replica a janela do cartão em SQL) e o motor de ciclos
 * (`CycleWindowEngine` + `aggregateCycles`, a mesma fonte da tela de fatura): a parcela está "paga" na
 * view exatamente quando o ciclo do cartão que a contém está PAGO no motor.
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

const at = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d, 12));

async function scenario(tx: Prisma.TransactionClient, purchaseDate: string) {
    const context = await tx.financialContext.create({ data: { name: "spec-installment-parity" } });
    const startsAt = new Date("2020-01-01");
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
                    startsAt,
                    rules: { create: { effectiveFrom: startsAt, dueDay: 5, closingDay: 28 } },
                },
            },
        },
    });
    const wallet = await tx.balance.create({
        data: { contextId: context.id, name: "Carteira", balanceType: "WALLET" },
    });

    const unitOfWork: IInstallmentUnitOfWork = {
        run: (work) =>
            work({
                categoryRepo: new CategoryPrismaRepository(tx),
                installmentRepo: new InstallmentPrismaRepository(tx),
            }),
    };
    const useCase = new CreateInstallmentUseCase(unitOfWork, {
        execute: async () => success({ canViewBalances: true, canManageBalances: true }),
    } as unknown as ISpaceAccessProvider);

    const created = await useCase.execute({
        session: { contextId: context.id, partyId: 1 },
        data: {
            type: "INVOICE",
            name: "Notebook",
            totalAmount: 30000,
            totalInstallments: 3,
            purchaseDate,
            cardId: card.id,
            categoryId: null,
            newCategory: { name: "Eletrônicos", color: "#06B6D4", icon: "Tag" },
            subcategoryId: null,
            newSubcategory: { name: "Notebooks", color: "#06B6D4", icon: "Tag" },
        },
    });
    assert.equal(created.success, true);
    if (!created.success) throw new Error("falha ao criar o parcelamento");

    const pay = (date: Date, amount: number) =>
        tx.entry.create({
            data: {
                description: "pagamento de fatura",
                type: "SETTLEMENT",
                dueDate: date,
                competanceDate: date,
                movements: {
                    create: [
                        { balanceId: wallet.id, amount: -amount, direction: "DEBIT" },
                        { balanceId: card.id, amount, direction: "CREDIT" },
                    ],
                },
            },
        });

    /** parcela -> status do ciclo do cartão que a contém, segundo o motor. */
    const engineStatuses = async () => {
        const queries = new CyclePrismaQueries(tx as unknown as PrismaClient);
        const from = new Date(2030, 8, 1);
        const to = new Date(2031, 5, 30);
        const rules = await queries.findCycleRulesInWindow({ agreementId: card.id, from, to });
        const windows = CycleWindowEngine.generateWindows({
            agreement: { frequency: "MONTHLY", interval: 1, startsAt, endsAt: null },
            rules,
            window: { from, to },
            anchorMode: "OVERLAP",
        });
        const cycles = await queries.aggregateCycles({
            balanceId: card.id,
            balanceType: "CREDIT",
            windows,
            today: new Date("2030-10-01T12:00:00Z"),
            isOnce: false,
        });

        const entries = await tx.entry.findMany({
            where: {
                type: "TRANSFER",
                movements: { some: { balanceId: created.data.id } },
            },
            orderBy: { dueDate: "asc" },
        });
        return entries.map((entry) => {
            const ref = (entry.competanceDate ?? entry.dueDate).toISOString().slice(0, 10);
            const cycle = cycles.find(
                (c) => ref >= c.from.toISOString().slice(0, 10) && ref <= c.to.toISOString().slice(0, 10)
            );
            assert.ok(cycle, `ciclo do cartão para a parcela de ${ref}`);
            return cycle.status;
        });
    };

    const viewPaid = async () => {
        const [row] = await tx.$queryRaw<{ paidInstallments: number }[]>(
            Prisma.sql`SELECT "paidInstallments" FROM vw_installment_summary WHERE "balanceId" = ${created.data.id}`
        );
        return row.paidInstallments;
    };

    return { pay, engineStatuses, viewPaid };
}

describe("vw_installment_summary x motor de ciclos do cartão", () => {
    after(async () => {
        await prisma.$disconnect();
    });

    for (const purchaseDate of ["2030-11-15", "2030-11-29"]) {
        it(`compra em ${purchaseDate}: parcelas pagas na view = ciclos PAGOS no motor`, () =>
            inRollback(async (tx) => {
                const { pay, engineStatuses, viewPaid } = await scenario(tx, purchaseDate);

                // nada pago
                assert.equal(await viewPaid(), 0);
                assert.ok((await engineStatuses()).every((s) => s !== "PAID"));

                // paga por inteiro só a fatura da 1ª parcela (competência dentro da janela dela)
                const first = purchaseDate === "2030-11-15" ? at(2030, 11, 20) : at(2030, 12, 5);
                await pay(first, 10000);
                const afterFirst = await engineStatuses();
                assert.equal(afterFirst.filter((s) => s === "PAID").length, 1);
                assert.equal(afterFirst[0], "PAID");
                assert.equal(await viewPaid(), 1);

                // pagamento parcial da 2ª fatura: nem o motor nem a view a consideram paga
                const second = purchaseDate === "2030-11-15" ? at(2030, 12, 20) : at(2031, 1, 5);
                await pay(second, 4000);
                const afterPartial = await engineStatuses();
                assert.equal(afterPartial[1], "PARTIAL");
                assert.equal(afterPartial.filter((s) => s === "PAID").length, 1);
                assert.equal(await viewPaid(), 1);

                // quita a 2ª fatura
                await pay(second, 6000);
                const afterSecond = await engineStatuses();
                assert.equal(afterSecond.filter((s) => s === "PAID").length, 2);
                assert.equal(await viewPaid(), 2);
            }));
    }
});

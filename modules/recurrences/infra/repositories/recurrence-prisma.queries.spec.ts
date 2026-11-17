import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { prisma } from "@/lib/prisma";
import { RecurrencePrismaQueries } from "./recurrence-prisma.queries";

describe("RecurrencePrismaQueries - Integração com Banco", () => {
    const queries = new RecurrencePrismaQueries();

    it("retorna lista de recorrências para um contexto financeiro válido", async () => {
        // Encontra um contexto com agreements de teste (ex.: contexto da Ana)
        const context = await prisma.financialContext.findFirst({
            where: {
                balances: {
                    some: {
                        agreement: { isNot: null },
                    },
                },
            },
            select: { id: true },
        });

        if (!context) {
            return;
        }

        const items = await queries.listRecurrencesByContextId(context.id);
        assert.ok(Array.isArray(items));
        assert.ok(items.length > 0);

        const first = items[0];
        assert.ok(first.balanceId > 0);
        assert.ok(first.name.length > 0);
        assert.ok(typeof first.isActive === "boolean");
        assert.ok(typeof first.isOverdue === "boolean");
        assert.ok(typeof first.currentAmount === "number");
    });

    it("identifica corretamente o status 'Em atraso' (OVERDUE) no contrato de Condomínio", async () => {
        // Busca o condomínio com accrual vencido sem quitação do cenário de seed
        const condominio = await prisma.balance.findFirst({
            where: {
                name: { contains: "Condomínio Edifício Solar das Flores" },
                agreement: { isNot: null },
            },
            select: { id: true, contextId: true },
        });

        if (!condominio) {
            return;
        }

        const item = await queries.findRecurrenceById(
            condominio.id,
            condominio.contextId
        );
        assert.ok(item !== null);
        assert.equal(item.name, "Condomínio Edifício Solar das Flores");
        assert.equal(item.isOverdue, true);
        assert.equal(item.status, "OVERDUE");
    });

    it("filtra corretamente por direção (CREDIT / DEBIT)", async () => {
        const context = await prisma.financialContext.findFirst({
            where: {
                balances: {
                    some: { agreement: { isNot: null } },
                },
            },
            select: { id: true },
        });

        if (!context) return;

        const creditItems = await queries.listRecurrencesByContextId(context.id, {
            active: "ALL",
            direction: "CREDIT",
        });
        for (const item of creditItems) {
            assert.equal(item.direction, "CREDIT");
        }

        const debitItems = await queries.listRecurrencesByContextId(context.id, {
            active: "ALL",
            direction: "DEBIT",
        });
        for (const item of debitItems) {
            assert.equal(item.direction, "DEBIT");
        }
    });

    it("filtra corretamente por status em atraso (OVERDUE)", async () => {
        const context = await prisma.financialContext.findFirst({
            where: {
                balances: {
                    some: {
                        name: { contains: "Condomínio Edifício Solar das Flores" },
                    },
                },
            },
            select: { id: true },
        });

        if (!context) return;

        const overdueItems = await queries.listRecurrencesByContextId(context.id, {
            active: "OVERDUE",
        });

        assert.ok(overdueItems.length > 0);
        for (const item of overdueItems) {
            assert.equal(item.isOverdue, true);
            assert.equal(item.status, "OVERDUE");
        }
    });

    it("nunca retorna agreements com frequência pontual (ONCE)", async () => {
        const context = await prisma.financialContext.findFirst({
            where: {
                balances: {
                    some: { agreement: { isNot: null } },
                },
            },
            select: { id: true },
        });

        if (!context) return;

        const allItems = await queries.listRecurrencesByContextId(context.id);
        for (const item of allItems) {
            assert.notEqual(item.frequency as string, "ONCE");
            assert.ok(["WEEKLY", "MONTHLY", "YEARLY"].includes(item.frequency));
        }
    });
});


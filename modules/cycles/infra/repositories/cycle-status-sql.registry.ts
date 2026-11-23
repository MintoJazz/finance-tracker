import { Prisma } from "@/prisma/generated/prisma/client";
import { CycleStatus } from "@/modules/cycles/models/cycle-primitives.schema";

export interface PreFilterSqlContext {
    balanceId: number;
    polarity: 1 | -1;
    today: Date;
    isOnce: boolean;
}

export interface CycleStatusSqlRule {
    readonly status: CycleStatus;
    readonly priority: number;

    /**
     * 1. Pré-filtro SQL (aplicado sobre `input_windows w` ANTES do LEFT JOIN e SUM).
     * Poda vigências que jamais poderiam ter este status usando datas e EXISTS no índice.
     */
    preFilterSql(ctx: PreFilterSqlContext): Prisma.Sql;

    /**
     * 2. Pós-filtro SQL (aplicado sobre `normalized_cycles c` DEPOIS do SUM).
     * Define a condição algébrica exata para inferência no CASE WHEN.
     */
    postFilterSql(today: Date): Prisma.Sql;
}

/**
 * Helper reutilizável para verificar existência rápida de movimentação ativa na vigência `w`.
 */
function existsActiveMovementSql(
    ctx: PreFilterSqlContext,
    extraCondition: Prisma.Sql = Prisma.empty
): Prisma.Sql {
    const dateFilterSql = ctx.isOnce
        ? Prisma.sql`TRUE`
        : Prisma.sql`COALESCE(e."competanceDate", e."dueDate")::date BETWEEN w.win_from AND w.win_to`;

    return Prisma.sql`EXISTS (
        SELECT 1
        FROM "Movement" m
        INNER JOIN "Entry" e ON e.id = m."entryId"
        WHERE m."balanceId" = ${ctx.balanceId}
          AND e."reversesEntryId" IS NULL
          AND NOT EXISTS (
              SELECT 1 FROM "Entry" rev WHERE rev."reversesEntryId" = e.id
          )
          AND ${dateFilterSql}
          ${extraCondition}
    )`;
}

/**
 * Pernas que REDUZEM o saldo (`m.amount * polaridade < 0`) de liquidação: são as únicas que contam como
 * "pago". Mesmo critério de `paid_amount` em `aggregateCycles`; perna de liquidação que aumenta o saldo
 * é reconhecida (dívida que chegou), não paga.
 */
function reducingSettlementSql(ctx: PreFilterSqlContext): Prisma.Sql {
    return Prisma.sql`AND e.type IN ('SETTLEMENT'::"EntryType", 'CLAIM_PAYMENT'::"EntryType", 'CLAIM_RECEIPT'::"EntryType")
          AND (m.amount * ${ctx.polarity}) < 0`;
}

/** Pernas que reduzem o saldo por cessão/renegociação (mesmo critério de `transferred_amount`). */
function reducingTransferSql(ctx: PreFilterSqlContext): Prisma.Sql {
    return Prisma.sql`AND e.type IN ('TRANSFER'::"EntryType", 'CLAIM_OPENING'::"EntryType")
          AND (m.amount * ${ctx.polarity}) < 0`;
}

export const CYCLE_STATUS_SQL_REGISTRY: Record<CycleStatus, CycleStatusSqlRule> = {
    PROJECTED: {
        status: "PROJECTED",
        priority: 1,
        preFilterSql: (ctx) =>
            Prisma.sql`NOT ${existsActiveMovementSql(ctx)}`,
        postFilterSql: (today) =>
            Prisma.sql`(c.movements_count = 0 AND c.win_from > ${today}::date)`,
    },

    PAID: {
        status: "PAID",
        priority: 2,
        preFilterSql: (ctx) =>
            existsActiveMovementSql(
                ctx,
                reducingSettlementSql(ctx)
            ),
        postFilterSql: () =>
            Prisma.sql`(c.total_amount > 0 AND c.paid_amount >= c.total_amount)`,
    },

    TRANSFERRED: {
        status: "TRANSFERRED",
        priority: 3,
        preFilterSql: (ctx) =>
            existsActiveMovementSql(
                ctx,
                reducingTransferSql(ctx)
            ),
        postFilterSql: () =>
            Prisma.sql`(c.transferred_amount > 0 AND c.remaining_amount = 0 AND c.paid_amount < c.total_amount)`,
    },

    OVERDUE: {
        status: "OVERDUE",
        priority: 4,
        preFilterSql: (ctx) =>
            Prisma.sql`(w.due_date < ${ctx.today}::date AND ${existsActiveMovementSql(ctx)})`,
        postFilterSql: (today) =>
            Prisma.sql`(c.remaining_amount > 0 AND c.due_date < ${today}::date)`,
    },

    PARTIAL: {
        status: "PARTIAL",
        priority: 5,
        preFilterSql: (ctx) =>
            Prisma.sql`(w.due_date >= ${ctx.today}::date AND ${existsActiveMovementSql(
                ctx,
                reducingSettlementSql(ctx)
            )})`,
        postFilterSql: (today) =>
            Prisma.sql`(c.paid_amount > 0 AND c.paid_amount < c.total_amount AND c.due_date >= ${today}::date)`,
    },

    PENDING: {
        status: "PENDING",
        priority: 6,
        preFilterSql: (ctx) =>
            Prisma.sql`(w.due_date >= ${ctx.today}::date AND ${existsActiveMovementSql(ctx)})`,
        postFilterSql: (today) =>
            Prisma.sql`(c.paid_amount = 0 AND c.remaining_amount > 0 AND c.due_date >= ${today}::date AND (${today}::date > c.win_to OR c.recognized_amount > 0))`,
    },

    OPEN: {
        status: "OPEN",
        priority: 7,
        preFilterSql: (ctx) =>
            Prisma.sql`(w.due_date >= ${ctx.today}::date AND w.win_to >= ${ctx.today}::date)`,
        postFilterSql: () =>
            Prisma.sql`TRUE`,
    },

    // Aliases para compatibilidade com o Wizard de Obrigações
    SETTLED: {
        status: "SETTLED",
        priority: 2,
        preFilterSql: (ctx) =>
            existsActiveMovementSql(
                ctx,
                reducingSettlementSql(ctx)
            ),
        postFilterSql: () =>
            Prisma.sql`(c.total_amount > 0 AND c.paid_amount >= c.total_amount)`,
    },

    UNRECORDED: {
        status: "UNRECORDED",
        priority: 1,
        preFilterSql: (ctx) =>
            Prisma.sql`NOT ${existsActiveMovementSql(ctx)}`,
        postFilterSql: () =>
            Prisma.sql`(c.movements_count = 0)`,
    },
};

export class CycleStatusSqlBuilder {
    /** Ordem estrita de precedência contábil para o CASE WHEN */
    private static readonly EVALUATION_ORDER: CycleStatus[] = [
        "PROJECTED",
        "PAID",
        "TRANSFERRED",
        "OVERDUE",
        "PARTIAL",
        "PENDING",
    ];

    /**
     * Gera o predicado WHERE da CTE `candidate_windows` (antes do JOIN/SUM).
     */
    static buildPreFilterWhere(
        statuses: CycleStatus[] | undefined,
        ctx: PreFilterSqlContext
    ): Prisma.Sql {
        if (!statuses || statuses.length === 0) {
            return Prisma.sql`TRUE`;
        }

        const uniqueStatuses = Array.from(new Set(statuses));
        const predicates = uniqueStatuses.map((status) =>
            CYCLE_STATUS_SQL_REGISTRY[status].preFilterSql(ctx)
        );

        return Prisma.sql`(${Prisma.join(predicates, " OR ")})`;
    }

    /**
     * Gera a expressão CASE WHEN da CTE `evaluated_cycles` (pós-SUM).
     */
    static buildStatusCaseWhen(today: Date): Prisma.Sql {
        const whenBranches = this.EVALUATION_ORDER.map((status) => {
            const rule = CYCLE_STATUS_SQL_REGISTRY[status];
            return Prisma.sql`WHEN ${rule.postFilterSql(today)} THEN ${status}`;
        });

        return Prisma.sql`
            CASE
                ${Prisma.join(whenBranches, "\n                ")}
                ELSE 'OPEN'
            END
        `;
    }
}
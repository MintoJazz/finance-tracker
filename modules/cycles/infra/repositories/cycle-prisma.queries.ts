import { format } from "date-fns";
import { Prisma, PrismaClient } from "@/prisma/generated/prisma/client";
import { CycleRuleRecord } from "@/modules/cycles/application/services/cycle-engine.registry";
import { CycleStatusSqlBuilder } from "./cycle-status-sql.registry";
import { ICycleQueries, AgreementContextRecord, FindCycleRulesInWindowParams, AggregateCyclesParams, AggregatedCycleRow } from "../../application/interfaces/cycle-queries.interface";

export class CyclePrismaQueries implements ICycleQueries {
    constructor(private readonly prisma: PrismaClient) { }

    // ========================================================================
    // 1. BUSCA DE METADADOS (Balance + Agreement)
    // ========================================================================
    async findAgreementContext(
        balanceId: number,
        contextId: number
    ): Promise<AgreementContextRecord | null> {
        const agreement = await this.prisma.agreement.findFirst({
            where: {
                balanceId,
                balance: {
                    contextId,
                },
            },
            select: {
                balanceId: true,
                isActive: true,
                frequency: true,
                interval: true,
                startsAt: true,
                endsAt: true,
                balance: {
                    select: {
                        name: true,
                        balanceType: true,
                    },
                },
            },
        });

        if (!agreement) {
            return null;
        }

        return {
            balanceId: agreement.balanceId,
            balanceName: agreement.balance.name,
            balanceType: agreement.balance.balanceType,
            isActive: agreement.isActive,
            frequency: agreement.frequency,
            interval: agreement.interval,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
        };
    }

    // ========================================================================
    // 2. BUSCA DE REGRAS NO HORIZONTE (Com 1 de folga para cada lado em 1 query)
    // ========================================================================
    async findCycleRulesInWindow(
        params: FindCycleRulesInWindowParams
    ): Promise<CycleRuleRecord[]> {
        const { agreementId, from, to } = params;

        const rows = await this.prisma.$queryRaw<CycleRuleRecord[]>(Prisma.sql`
            WITH boundary_rules AS (
                (
                    -- 1. Regra Ancora: ate 2 ultimas regras com effectiveFrom <= from (regra ativa e predecessora imediata para ciclos ponte)
                    SELECT
                        r.id,
                        r."agreementId",
                        r."dueDay",
                        r."dueMonth",
                        r."closingDay",
                        r."closingMonth",
                        r."effectiveFrom"
                    FROM "CycleRule" r
                    WHERE r."agreementId" = ${agreementId}
                      AND r."effectiveFrom" <= ${from}::date
                    ORDER BY r."effectiveFrom" DESC
                    LIMIT 2
                )
                UNION
                (
                    -- Fallback caso todas as regras comecem depois de from: garante a 1a regra do acordo
                    SELECT
                        r.id,
                        r."agreementId",
                        r."dueDay",
                        r."dueMonth",
                        r."closingDay",
                        r."closingMonth",
                        r."effectiveFrom"
                    FROM "CycleRule" r
                    WHERE r."agreementId" = ${agreementId}
                    ORDER BY r."effectiveFrom" ASC
                    LIMIT 1
                )
                UNION
                (
                    -- 2. Regras intermediarias dentro de (from, to]
                    SELECT
                        r.id,
                        r."agreementId",
                        r."dueDay",
                        r."dueMonth",
                        r."closingDay",
                        r."closingMonth",
                        r."effectiveFrom"
                    FROM "CycleRule" r
                    WHERE r."agreementId" = ${agreementId}
                      AND r."effectiveFrom" > ${from}::date
                      AND r."effectiveFrom" <= ${to}::date
                )
                UNION
                (
                    -- 3. Regra Posterior: ate 2 regras apos to para fechar o effectiveTo e ciclos ponte
                    SELECT
                        r.id,
                        r."agreementId",
                        r."dueDay",
                        r."dueMonth",
                        r."closingDay",
                        r."closingMonth",
                        r."effectiveFrom"
                    FROM "CycleRule" r
                    WHERE r."agreementId" = ${agreementId}
                      AND r."effectiveFrom" > ${to}::date
                    ORDER BY r."effectiveFrom" ASC
                    LIMIT 2
                )
            )
            SELECT *
            FROM boundary_rules
            ORDER BY "effectiveFrom" ASC;
        `);

        return rows;
    }

    // ========================================================================
    // 3. AGREGAÇÃO EM LOTE / UNITÁRIA COM POLARIDADE E STATUS NO SQL
    // ========================================================================
    async aggregateCycles(
        params: AggregateCyclesParams
    ): Promise<AggregatedCycleRow[]> {
        const {
            balanceId,
            balanceType,
            windows,
            today,
            isOnce,
            includeProjected = true,
            statuses,
        } = params;

        if (windows.length === 0) {
            return [];
        }

        // Polaridade unificada:
        // Em RECEIVABLE (+1), entradas que aumentam o direito são > 0 e baixas são < 0.
        // Em PAYABLE/CREDIT (-1), provisões/compras são < 0 no banco, então multiplicadas por -1 ficam > 0!
        const polarity: 1 | -1 = balanceType === "RECEIVABLE" ? 1 : -1;

        const froms = windows.map((w) => w.range.from);
        const tos = windows.map((w) => w.range.to);
        const dueDates = windows.map((w) => format(w.dueDate, "yyyy-MM-dd"));
        const closingDates = windows.map((w) =>
            w.closingDate ? format(w.closingDate, "yyyy-MM-dd") : null
        );
        const labels = windows.map((w) => w.label);
        const ruleIds = windows.map((w) => w.rule.id);

        // 1. Pré-filtro SQL (corta vigências antes do JOIN se houver filtro de status)
        const preFilterWhereSql = CycleStatusSqlBuilder.buildPreFilterWhere(statuses, {
            balanceId,
            polarity,
            today,
            isOnce,
        });

        // 2. Expressão CASE WHEN de inferência de status pós-soma
        const statusCaseWhenSql = CycleStatusSqlBuilder.buildStatusCaseWhen(today);

        // 3. Filtro final exato sobre o status inferido
        const finalStatusFilterSql =
            statuses && statuses.length > 0
                ? Prisma.sql`AND ec."status" IN (${Prisma.join(statuses)})`
                : Prisma.empty;

        const entryDateJoinCondition = isOnce
            ? Prisma.sql`TRUE`
            : Prisma.sql`COALESCE(e."competanceDate", e."dueDate")::date BETWEEN w.win_from AND w.win_to`;

        return this.prisma.$queryRaw<AggregatedCycleRow[]>(Prisma.sql`
            WITH input_windows AS (
                SELECT *
                FROM UNNEST(
                    ${froms}::date[],
                    ${tos}::date[],
                    ${dueDates}::date[],
                    ${closingDates}::date[],
                    ${labels}::text[],
                    ${ruleIds}::int[]
                ) AS t(win_from, win_to, due_date, closing_date, label, rule_id)
            ),

            -- Etapa A: Poda vigências incompatíveis antes do JOIN pesado
            candidate_windows AS (
                SELECT w.*
                FROM input_windows w
                WHERE ${preFilterWhereSql}
            ),

            -- Etapa B: Soma movimentos já normalizados pela polaridade (m.amount * polarity)
            raw_aggregates AS (
                SELECT
                    w.win_from,
                    w.win_to,
                    w.due_date,
                    w.closing_date,
                    w.label,
                    w.rule_id,
                    COUNT(m.id)::int AS movements_count,

                    -- Classificação por perna: (m.amount * polaridade) > 0 AUMENTA o saldo do ciclo e < 0 o REDUZ.
                    -- Perna que aumenta é reconhecida (a dívida chegou), qualquer que seja o tipo do Entry;
                    -- perna que reduz é classificada pelo tipo (paga ou transferida).

                    -- Reconhecido: provisões, compras e ajustes, mais qualquer perna de liquidação,
                    -- transferência ou abertura que aumente o saldo (ex.: dívida transferida para o cartão)
                    GREATEST(0, COALESCE(SUM(m.amount * ${polarity}) FILTER (
                        WHERE e.type IN ('ACCRUAL'::"EntryType", 'ADJUSTMENT'::"EntryType", 'DIRECT'::"EntryType")
                           OR (
                                e.type IN (
                                    'CLAIM_OPENING'::"EntryType", 'TRANSFER'::"EntryType",
                                    'SETTLEMENT'::"EntryType", 'CLAIM_PAYMENT'::"EntryType", 'CLAIM_RECEIPT'::"EntryType"
                                )
                                AND (m.amount * ${polarity}) > 0
                           )
                    ), 0))::int AS recognized_amount,

                    -- Pago: pernas redutoras de liquidação, com o sinal invertido para positivo
                    GREATEST(0, COALESCE(SUM(-(m.amount * ${polarity})) FILTER (
                        WHERE e.type IN ('SETTLEMENT'::"EntryType", 'CLAIM_PAYMENT'::"EntryType", 'CLAIM_RECEIPT'::"EntryType")
                          AND (m.amount * ${polarity}) < 0
                    ), 0))::int AS paid_amount,

                    -- Transferido: pernas redutoras de cessão/renegociação que baixam o ciclo
                    GREATEST(0, COALESCE(SUM(-(m.amount * ${polarity})) FILTER (
                        WHERE e.type IN ('TRANSFER'::"EntryType", 'CLAIM_OPENING'::"EntryType")
                          AND (m.amount * ${polarity}) < 0
                    ), 0))::int AS transferred_amount,

                    -- Saldo líquido em aberto dos movimentos reais (soma com sinal, independe do tipo)
                    GREATEST(0, COALESCE(SUM(m.amount * ${polarity}), 0))::int AS net_open_amount,

                    MAX(e."dueDate"::date) FILTER (
                        WHERE e.type IN ('SETTLEMENT'::"EntryType", 'CLAIM_PAYMENT'::"EntryType", 'CLAIM_RECEIPT'::"EntryType")
                          AND (m.amount * ${polarity}) < 0
                    ) AS latest_settlement_date,

                    COALESCE(BOOL_OR((m.amount * ${polarity}) < 0) FILTER (
                        WHERE e.type IN ('SETTLEMENT'::"EntryType", 'CLAIM_PAYMENT'::"EntryType", 'CLAIM_RECEIPT'::"EntryType")
                    ), false) AS has_settlement_receipt,

                    -- Valor projetado do contrato (somente quando movements_count = 0 e não é cartão de crédito)
                    CASE
                        WHEN ${balanceType}::"BalanceType" = 'CREDIT'::"BalanceType" THEN 0
                        ELSE COALESCE((
                            SELECT GREATEST(0, SUM(ae.amount))::int
                            FROM "AgreementAmountEntry" ae
                            WHERE ae."agreementId" = ${balanceId}
                              AND ae."effectiveAt"::date <= w.due_date
                        ), 0)
                    END AS expected_amount

                FROM candidate_windows w
                LEFT JOIN (
                    "Movement" m
                    INNER JOIN "Entry" e
                        ON e.id = m."entryId"
                       AND e."reversesEntryId" IS NULL
                       AND NOT EXISTS (
                           SELECT 1 FROM "Entry" rev WHERE rev."reversesEntryId" = e.id
                       )
                ) ON m."balanceId" = ${balanceId}
                 AND ${entryDateJoinCondition}
                GROUP BY
                    w.win_from,
                    w.win_to,
                    w.due_date,
                    w.closing_date,
                    w.label,
                    w.rule_id
            ),

            -- Etapa C: Consolida total_amount e remaining_amount entre projetado vs consolidado
            normalized_cycles AS (
                SELECT
                    r.win_from,
                    r.win_to,
                    r.due_date,
                    r.closing_date,
                    r.label,
                    r.rule_id,
                    r.movements_count,
                    (r.movements_count > 0) AS is_consolidated,
                    r.recognized_amount,
                    r.paid_amount,
                    r.transferred_amount,
                    r.latest_settlement_date,
                    r.has_settlement_receipt,
                    CASE
                        WHEN r.movements_count = 0 THEN r.expected_amount
                        ELSE r.net_open_amount
                    END::int AS remaining_amount,
                    CASE
                        WHEN r.movements_count = 0 THEN r.expected_amount
                        WHEN r.recognized_amount > 0 THEN r.recognized_amount
                        ELSE r.paid_amount
                    END::int AS total_amount
                FROM raw_aggregates r
            ),

            -- Etapa D: Carimba o status final pelo CASE WHEN do Registry
            evaluated_cycles AS (
                SELECT
                    c.win_from AS "from",
                    c.win_to AS "to",
                    c.due_date AS "dueDate",
                    c.closing_date AS "closingDate",
                    c.label,
                    c.rule_id AS "ruleId",
                    c.movements_count AS "movementsCount",
                    c.is_consolidated AS "isConsolidated",
                    c.recognized_amount AS "recognizedAmount",
                    c.paid_amount AS "paidAmount",
                    c.transferred_amount AS "transferredAmount",
                    c.remaining_amount AS "remainingAmount",
                    c.total_amount AS "totalAmount",
                    c.latest_settlement_date AS "settlementDate",
                    c.has_settlement_receipt AS "hasReceipt",
                    (c.remaining_amount > 0 AND c.due_date < ${today}::date) AS "isOverdue",
                    (${statusCaseWhenSql})::text AS "status"
                FROM normalized_cycles c
            )

            SELECT *
            FROM evaluated_cycles ec
            WHERE (${includeProjected} = true OR ec."isConsolidated" = true)
                ${finalStatusFilterSql}
            ORDER BY ec."dueDate" ASC, ec."from" ASC;
        `);
    }
}
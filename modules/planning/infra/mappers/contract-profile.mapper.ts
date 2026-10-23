import { Page, PageRequest } from "@/types/pagination.types";
import { format, isAfter, isBefore, startOfDay } from "date-fns";
import { CommitmentCycleItem } from "../../core/schemas/commitment-cycle.schema";
import {
    ContractCycleFilters,
    ContractCycleItem,
} from "../../core/schemas/contract-cycle.schema";
import {
    ContractProfile,
    ContractProfileSummary,
} from "../../core/schemas/contract-profile.schema";
import { paginate } from "../../core/services/paginate";
import { RawContractAgreement } from "../../core/types/contract-profile-queries.interface";

export interface ContractDomainModel {
    id: number;
    balanceId: number;
    name: string;
    type: "PAYABLE" | "RECEIVABLE";
    value: number; // em centavos
    frequency: "WEEKLY" | "MONTHLY" | "YEARLY";
    dueDay: number;
    dueMonth: number | null;
    closingDay: number | null;
    closingMonth: number | null;
    startsAt: Date;
    endsAt: Date | null;
    includeInProjection: boolean;
    isArchived: boolean;
    createdAt: Date;
}

export class ContractProfileMapper {
    /**
     * PERSISTÊNCIA -> DOMÍNIO
     * Converte os dados brutos de Agreement/Balance em modelo de domínio.
     */
    static toDomain(raw: RawContractAgreement, now: Date): ContractDomainModel {
        const today = startOfDay(now);

        // Regras ordenadas cronologicamente
        const sortedRules = [...raw.rules].sort(
            (a, b) => startOfDay(a.effectiveFrom).getTime() - startOfDay(b.effectiveFrom).getTime()
        );

        // A regra ativa é a mais recente cuja vigência já iniciou (ou a primeira/última se fora do intervalo)
        const pastRules = sortedRules.filter(
            (r) => !isAfter(startOfDay(r.effectiveFrom), today)
        );
        const currentRule =
            pastRules.length > 0
                ? pastRules.at(-1) ?? null
                : sortedRules[0] ?? null;

        const frequency = (currentRule?.frequency as "WEEKLY" | "MONTHLY" | "YEARLY") ?? "MONTHLY";
        const dueDay = currentRule?.dueDay ?? 1;
        const closingDay = currentRule?.closingDay ?? null;

        // Para contratos anuais, o mês do vencimento é o mês de vigência da regra
        let dueMonth: number | null = null;
        let closingMonth: number | null = null;
        if (frequency === "YEARLY") {
            const ruleDate = currentRule ? new Date(currentRule.effectiveFrom) : new Date(raw.startsAt);
            dueMonth = ruleDate.getMonth() + 1;
            if (closingDay !== null) {
                closingMonth = dueMonth;
            }
        }

        // Valor vigente na data de referência: soma dos deltas com effectiveAt <= today
        const effectiveAmountEntries = raw.amountEntries.filter(
            (e) => !isAfter(startOfDay(e.effectiveAt), today)
        );
        let value = effectiveAmountEntries.reduce((sum, e) => sum + e.amount, 0);
        if (effectiveAmountEntries.length === 0 && raw.amountEntries.length > 0) {
            value = raw.amountEntries.reduce((sum, e) => sum + e.amount, 0);
        }
        value = Math.max(0, value);

        const type: "PAYABLE" | "RECEIVABLE" =
            raw.balance.balanceType === "RECEIVABLE" ? "RECEIVABLE" : "PAYABLE";

        return {
            id: raw.id,
            balanceId: raw.balance.id,
            name: raw.balance.name,
            type,
            value,
            frequency,
            dueDay,
            dueMonth,
            closingDay,
            closingMonth,
            startsAt: raw.startsAt,
            endsAt: raw.endsAt,
            includeInProjection: raw.includeInProjection,
            isArchived: raw.balance.removedAt !== null,
            createdAt: raw.createdAt,
        };
    }

    /**
     * DOMÍNIO -> PAYLOAD: Ciclo do Motor -> ContractCycleItem do Frontend
     */
    static toCycleItemPayload(
        engineCycle: CommitmentCycleItem,
        contractId: number
    ): ContractCycleItem {
        const rawKey = engineCycle.cycleKey ?? format(engineCycle.dueDate, "yyyy-MM");
        const cycleKey = rawKey.startsWith("contract-")
            ? rawKey
            : `contract-${contractId}-${rawKey}`;

        return {
            cycleKey,
            contractId,
            label: engineCycle.label,
            from: engineCycle.from,
            to: engineCycle.to,
            closingDate: engineCycle.closingDate ?? engineCycle.dueDate,
            dueDate: engineCycle.dueDate,
            status: engineCycle.status,
            totalAmount: engineCycle.totalAmount,
            paidAmount: engineCycle.paidAmount,
            remainingAmount: engineCycle.remainingAmount,
            movementsCount: engineCycle.movementsCount ?? 0,
            settlementDate: engineCycle.settlementDate ?? null,
        };
    }

    /**
     * DOMÍNIO -> PAYLOAD: Lista de Ciclos do Motor -> ContractCycleItem[]
     */
    static toCycleItems(
        engineCycles: CommitmentCycleItem[],
        contractId: number
    ): ContractCycleItem[] {
        return engineCycles.map((c) => this.toCycleItemPayload(c, contractId));
    }

    /**
     * DOMÍNIO -> RESUMO: Calcula o resumo de métricas do perfil a partir dos ciclos
     */
    static calculateProfileSummary(
        cycles: ContractCycleItem[],
        now: Date
    ): ContractProfileSummary {
        let totalPaid = 0;
        let totalPending = 0;
        let totalProjected = 0;
        let overdueCount = 0;
        let overdueAmount = 0;
        let consolidatedCount = 0;
        let projectedCount = 0;
        let nextDueDate: Date | null = null;

        const today = startOfDay(now);

        for (const c of cycles) {
            if (c.status !== "PROJECTED") {
                consolidatedCount++;
                totalPaid += c.paidAmount;
                totalPending += c.remainingAmount;
                if (c.status === "OVERDUE") {
                    overdueCount++;
                    overdueAmount += c.remainingAmount;
                }
            } else {
                projectedCount++;
                totalProjected += c.totalAmount;
            }

            const due = startOfDay(c.dueDate);
            if (!isBefore(due, today) && (!nextDueDate || isBefore(due, nextDueDate))) {
                nextDueDate = c.dueDate;
            }
        }

        return {
            totalPaid,
            totalPending,
            totalProjected,
            overdueCount,
            overdueAmount,
            nextDueDate,
            cyclesCount: {
                total: cycles.length,
                consolidated: consolidatedCount,
                projected: projectedCount,
            },
        };
    }

    /**
     * DOMÍNIO -> PAYLOAD: Monta o objeto final ContractProfile
     */
    static toProfilePayload(
        domain: ContractDomainModel,
        summary: ContractProfileSummary
    ): ContractProfile {
        return {
            id: domain.id,
            balanceId: domain.balanceId,
            name: domain.name,
            type: domain.type,
            value: domain.value,
            frequency: domain.frequency,
            dueDay: domain.dueDay,
            dueMonth: domain.dueMonth,
            closingDay: domain.closingDay,
            closingMonth: domain.closingMonth,
            startsAt: domain.startsAt,
            endsAt: domain.endsAt,
            includeInProjection: domain.includeInProjection,
            isArchived: domain.isArchived,
            createdAt: domain.createdAt,
            summary,
        };
    }

    /**
     * DOMÍNIO -> PAYLOAD: Filtragem e Paginação da lista de ciclos
     */
    static filterAndPaginateCycles(
        cycles: ContractCycleItem[],
        filter?: Partial<ContractCycleFilters>,
        pageRequest?: PageRequest
    ): Page<ContractCycleItem> {
        let filtered = [...cycles];
        const resolvedPageRequest: PageRequest = pageRequest ?? { page: 1, pageSize: 10 };

        if (filter) {
            if (filter.includeProjected === false) {
                filtered = filtered.filter((c) => c.status !== "PROJECTED");
            }

            if (filter.statuses && filter.statuses.length > 0) {
                filtered = filtered.filter((c) => filter.statuses!.includes(c.status));
            }

            if (filter.q && filter.q.trim().length > 0) {
                const searchLower = filter.q.trim().toLowerCase();
                filtered = filtered.filter((c) =>
                    c.label.toLowerCase().includes(searchLower)
                );
            }
        }

        // Ordenação cronológica garantida por vencimento ASC
        filtered.sort((a, b) => {
            const timeDiff = a.dueDate.getTime() - b.dueDate.getTime();
            if (timeDiff !== 0) return timeDiff;
            return a.contractId - b.contractId;
        });

        return paginate(filtered, resolvedPageRequest);
    }
}

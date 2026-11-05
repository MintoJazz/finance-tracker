import { format, isAfter, startOfDay } from "date-fns";
import { CommitmentCycleItem } from "@/modules/cycles/models/commitment-cycle.schema";
import {
    ContractCycleProfile,
    ContractCycleRule,
    ContractCycleStatusEnum,
    CycleEntryRow,
    CycleRange,
    EntryTypeEnum,
} from "@/modules/cycles/models/contract-cycle.schema";
import { RawCycleEntry } from "@/modules/cycles/application/interfaces/contract-cycle-profile-queries.interface";
import { RawContractAgreement } from "@/modules/contracts/application/interfaces/contract-profile-queries.interface";

export class ContractCycleProfileMapper {
    /**
     * Formata rótulo legível da regra de ciclo do contrato.
     */
    static formatRuleLabel(rule: {
        frequency: string;
        dueDay: number;
        closingDay?: number | null;
    } | null): string {
        if (!rule) return "Sem regra definida";
        const freqMap: Record<string, string> = {
            ONCE: "Pontual",
            MONTHLY: "Mensal",
            WEEKLY: "Semanal",
            YEARLY: "Anual",
        };
        const freq = freqMap[rule.frequency] ?? rule.frequency;
        if (rule.frequency === "ONCE") {
            return `Pontual, vence dia ${rule.dueDay}`;
        }
        if (rule.closingDay != null) {
            return `${freq}, fecha dia ${rule.closingDay}, vence dia ${rule.dueDay}`;
        }
        return `${freq}, vence todo dia ${rule.dueDay}`;
    }

    /**
     * Converte lançamentos brutos (RawCycleEntry) em linhas de lançamentos do ciclo (CycleEntryRow).
     */
    static toCycleEntryRows(
        rawEntries: RawCycleEntry[],
        contractBalanceId: number,
        range: CycleRange
    ): CycleEntryRow[] {
        return rawEntries.map((raw) => {
            const targetMovement = raw.movements.find(
                (m) => m.balanceId === contractBalanceId
            );
            const amount = targetMovement ? Math.abs(targetMovement.amount) : 0;
            const direction = targetMovement?.direction ?? "DEBIT";

            const counterpartMovement = raw.movements.find(
                (m) => m.balanceId !== contractBalanceId
            );

            let counterpart: { label: string; href: string } | null = null;
            if (counterpartMovement?.balance?.agreement) {
                counterpart = {
                    label: counterpartMovement.balance.name,
                    href: `/contracts/${counterpartMovement.balance.id}/cycle?from=${range.from}&to=${range.to}`,
                };
            }

            const refDate = raw.competanceDate ?? raw.dueDate;
            const dateStr = format(refDate, "yyyy-MM-dd");

            return {
                id: raw.id,
                date: dateStr,
                description: raw.description,
                type: raw.type as EntryTypeEnum,
                direction,
                amount,
                hasAttachment: false,
                reversesEntryId: raw.reversesEntryId,
                reversedByEntryId: raw.reversedBy ? raw.reversedBy.id : null,
                counterpart,
            };
        });
    }

    /**
     * Localiza a regra ativa do contrato vigente para a data/período do ciclo.
     */
    static resolveActiveRule(
        rules: RawContractAgreement["rules"],
        cycleFromDate: Date
    ): ContractCycleRule {
        if (rules.length === 0) {
            return {
                label: "Sem regra definida",
                effectiveFrom: format(cycleFromDate, "yyyy-MM-dd"),
            };
        }

        const sorted = [...rules].sort(
            (a, b) =>
                startOfDay(a.effectiveFrom).getTime() -
                startOfDay(b.effectiveFrom).getTime()
        );

        const pastRules = sorted.filter(
            (r) => !isAfter(startOfDay(r.effectiveFrom), startOfDay(cycleFromDate))
        );

        const active = pastRules.length > 0 ? pastRules.at(-1)! : sorted[0]!;

        return {
            label: this.formatRuleLabel(active),
            effectiveFrom: format(active.effectiveFrom, "yyyy-MM-dd"),
        };
    }

    /**
     * Monta o objeto de perfil do ciclo (ContractCycleProfile).
     */
    static toContractCycleProfile(params: {
        agreement: RawContractAgreement;
        targetCycle: CommitmentCycleItem;
        prevRange: CycleRange | null;
        nextRange: CycleRange | null;
        entries: CycleEntryRow[];
    }): ContractCycleProfile {
        const { agreement, targetCycle, prevRange, nextRange, entries } = params;

        const cycleFromDate = new Date(targetCycle.from);
        const rule = this.resolveActiveRule(agreement.rules, cycleFromDate);

        const expectedAmount = targetCycle.totalAmount;
        const paidAmount = targetCycle.paidAmount;
        const openAmount = targetCycle.remainingAmount;

        const transferredAmount = entries
            .filter((e) => e.type === "CLAIM_OPENING" && e.direction === "CREDIT")
            .reduce((sum, e) => sum + e.amount, 0);

        let status: ContractCycleStatusEnum = targetCycle.status as ContractCycleStatusEnum;
        if (transferredAmount > 0 && openAmount === 0 && paidAmount < expectedAmount) {
            status = "TRANSFERRED";
        }

        const hasReceipt = entries.some(
            (e) => (e.type === "SETTLEMENT" || e.type === "CLAIM_PAYMENT") && e.direction === "CREDIT"
        );

        return {
            contractId: agreement.id,
            contractName: agreement.balance.name,
            title: targetCycle.label,
            range: {
                from: targetCycle.from,
                to: targetCycle.to,
            },
            dueDate: format(targetCycle.dueDate, "yyyy-MM-dd"),
            status,
            expectedAmount,
            paidAmount,
            transferredAmount,
            openAmount,
            hasReceipt,
            prev: prevRange,
            next: nextRange,
            rule,
        };
    }
}

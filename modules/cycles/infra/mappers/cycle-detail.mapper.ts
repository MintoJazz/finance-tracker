import { CycleDetail } from "@/modules/cycles/models/cycle-detail.schema";
import { CycleDetailOutput } from "@/modules/cycles/application/use-cases/get-cycle-detail.usecase";

export class CycleDetailMapper {
    static toDetail(output: CycleDetailOutput): CycleDetail {
        const isCredit = output.balance.balanceType === "CREDIT";
        const rawBalanceType = output.balance.balanceType;
        const balanceType =
            rawBalanceType === "CREDIT" ||
            rawBalanceType === "PAYABLE" ||
            rawBalanceType === "RECEIVABLE"
                ? rawBalanceType
                : undefined;

        return {
            balanceId: output.balance.id,
            contractId: output.balance.id,
            balanceName: output.balance.name,
            balanceType,
            from: output.cycle.range.from,
            to: output.cycle.range.to,
            dueDate: output.cycle.dueDate,
            closingDate: output.cycle.closingDate,
            settlementDate: output.cycle.settlementDate,
            label: output.cycle.label,
            status: output.cycle.status,
            totalAmount: output.cycle.amounts.total,
            paidAmount: output.cycle.amounts.paid,
            remainingAmount: output.cycle.amounts.remaining,
            isOverdue: output.cycle.isOverdue,
            movementsCount: output.cycle.movementsCount,
            hasReceipt: output.cycle.hasReceipt,
            source: {
                balanceId: output.balance.id,
                kind: isCredit ? "CARD" : "CONTRACT",
                name: output.balance.name,
            },
            amounts: {
                total: output.cycle.amounts.total,
                paid: output.cycle.amounts.paid,
                transferred: output.cycle.amounts.transferred,
                remaining: output.cycle.amounts.remaining,
            },
            prev: output.navigation.prev,
            next: output.navigation.next,
            rule: {
                label: output.rule.dueDay ? `Vencimento dia ${output.rule.dueDay}` : "",
                effectiveFrom: output.rule.effectiveFrom,
            },
        };
    }
}

export const mapCycleDetailOutputToCycleDetail = CycleDetailMapper.toDetail;


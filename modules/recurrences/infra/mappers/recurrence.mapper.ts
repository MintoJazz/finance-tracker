import { format } from "date-fns";
import {
    Agreement as PrismaAgreement,
    AgreementAmountEntry as PrismaAgreementAmountEntry,
    Balance as PrismaBalance,
    BalanceAppearance as PrismaBalanceAppearance,
    CycleRule as PrismaCycleRule,
} from "@/prisma/generated/prisma/client";
import {
    getRecurrenceStatus,
    type RecurrenceDirection,
    type RecurrenceFrequency,
    type RecurrenceListItem,
} from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import { RecurrenceScheduleCalculator } from "@/modules/recurrences/application/services/recurrence-schedule.calculator";

export type PrismaRecurrenceRecord = PrismaBalance & {
    appearance: PrismaBalanceAppearance | null;
    parent: (PrismaBalance & {
        appearance: PrismaBalanceAppearance | null;
        parent?: PrismaBalance | null;
    }) | null;
    agreement: (PrismaAgreement & {
        rules: PrismaCycleRule[];
        amountEntries: PrismaAgreementAmountEntry[];
    }) | null;
};

export class RecurrenceMapper {
    static toListItem(
        balance: PrismaRecurrenceRecord,
        isOverdue: boolean,
        today: Date = new Date()
    ): RecurrenceListItem {
        const agreement = balance.agreement;
        if (!agreement) {
            throw new Error(
                `[RecurrenceMapper] Balance id=${balance.id} não possui Agreement acoplado.`
            );
        }

        const activeRule = RecurrenceScheduleCalculator.resolveActiveRule(
            agreement.rules,
            today
        );
        const currentAmount = RecurrenceScheduleCalculator.calculateCurrentAmount(
            agreement.amountEntries,
            today
        );
        const isActive = RecurrenceScheduleCalculator.resolveIsActive({
            removedAt: balance.removedAt,
            isActive: agreement.isActive,
            startsAt: agreement.startsAt,
            endsAt: agreement.endsAt,
            today,
        });

        const rawFrequency = agreement.frequency;
        const frequency: RecurrenceFrequency =
            rawFrequency === "WEEKLY" ||
            rawFrequency === "MONTHLY" ||
            rawFrequency === "YEARLY"
                ? rawFrequency
                : "MONTHLY";

        const nextDueDate = isActive
            ? RecurrenceScheduleCalculator.calculateNextDueDate({
                  frequency,
                  interval: agreement.interval,
                  dueDay: activeRule.dueDay,
                  dueMonth: activeRule.dueMonth,
                  startsAt: agreement.startsAt,
                  endsAt: agreement.endsAt,
                  today,
              })
            : null;

        const direction: RecurrenceDirection =
            balance.balanceType === "RECEIVABLE" ? "CREDIT" : "DEBIT";

        return {
            balanceId: balance.id,
            name: balance.name,
            direction,
            frequency,
            interval: agreement.interval,
            dueDay: activeRule.dueDay,
            dueMonth: activeRule.dueMonth ?? null,
            closingDay: activeRule.closingDay ?? null,
            closingMonth: activeRule.closingMonth ?? null,
            currentAmount,
            nextDueDate,
            isActive,
            isOverdue,
            status: getRecurrenceStatus({ isActive, isOverdue }),
            category: balance.parent
                ? {
                      balanceId: balance.parent.id,
                      name: balance.parent.name,
                      color: balance.parent.appearance?.color ?? null,
                      parentId: balance.parent.parent?.id ?? null,
                      parentName: balance.parent.parent?.name ?? null,
                  }
                : null,
            icon:
                balance.appearance?.icon ??
                balance.parent?.appearance?.icon ??
                null,
            color:
                balance.appearance?.color ??
                balance.parent?.appearance?.color ??
                null,
            startsAt: agreement.startsAt
                ? format(agreement.startsAt, "yyyy-MM-dd")
                : undefined,
            endsAt: agreement.endsAt
                ? format(agreement.endsAt, "yyyy-MM-dd")
                : null,
        };
    }
}


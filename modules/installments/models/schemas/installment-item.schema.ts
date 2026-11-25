import { z } from "zod";

const DateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

/** INVOICE = parcelado na fatura do cartão; MONTHLY = pago mês a mês, fora de cartão. Derivado, nunca persistido. */
export const InstallmentTypeSchema = z.enum(["INVOICE", "MONTHLY"]);

export const InstallmentStatusSchema = z.enum(["ALL", "ACTIVE", "OVERDUE", "PAID"]);
export const InstallmentItemStatusSchema = z.enum(["ACTIVE", "OVERDUE", "PAID"]);

export const InstallmentCategorySchema = z.object({
    balanceId: z.number().int().positive(),
    name: z.string().min(1),
    color: z.string().nullable(),
    icon: z.string().nullable().optional(),
});

export const InstallmentCardSchema = z.object({
    id: z.number().int().positive(),
    name: z.string().min(1),
});

export const InstallmentListItemSchema = z.object({
    id: z.number().int().positive(),
    description: z.string().min(1),
    type: InstallmentTypeSchema,
    /** Valor total da compra, em centavos. */
    totalAmount: z.number().int().nonnegative(),
    /** Valor vigente da próxima parcela em aberto (ou da última, se quitado), em centavos. */
    installmentAmount: z.number().int().nonnegative(),
    totalInstallments: z.number().int().nonnegative(),
    paidInstallments: z.number().int().nonnegative(),
    /** Soma real das parcelas efetivamente pagas, em centavos. */
    paidAmount: z.number().int().nonnegative(),
    /** Parcelas imutáveis para edição (pagas no mês a mês; pagas ou fatura fechada no cartão). */
    consolidatedInstallments: z.number().int().nonnegative(),
    /** Soma real das parcelas consolidadas, em centavos. */
    consolidatedAmount: z.number().int().nonnegative(),
    purchaseDate: DateStringSchema.nullable(),
    /** Vencimento da próxima parcela (null quando quitado ou sem parcelas). */
    nextDueDate: DateStringSchema.nullable(),
    endsAt: DateStringSchema.nullable(),
    isOverdue: z.boolean(),
    isArchived: z.boolean().default(false),
    card: InstallmentCardSchema.nullable(),
    category: InstallmentCategorySchema.nullable(),
    icon: z.string().nullable(),
    color: z.string().nullable(),
});

export const InstallmentFiltersSchema = z.object({
    q: z.string().optional(),
    status: InstallmentStatusSchema.default("ALL"),
    type: InstallmentTypeSchema.optional(),
    cardId: z.number().int().positive().optional(),
});

export type InstallmentType = z.infer<typeof InstallmentTypeSchema>;
export type InstallmentStatus = z.infer<typeof InstallmentStatusSchema>;
export type InstallmentItemStatus = z.infer<typeof InstallmentItemStatusSchema>;
export type InstallmentCategory = z.infer<typeof InstallmentCategorySchema>;
export type InstallmentCard = z.infer<typeof InstallmentCardSchema>;
export type InstallmentListItem = z.infer<typeof InstallmentListItemSchema>;
export type InstallmentFilters = z.infer<typeof InstallmentFiltersSchema>;

/** Em fatura quando as parcelas caem num cartão de crédito; caso contrário, mês a mês. */
export function resolveInstallmentType(
    cardBalanceId: number | null | undefined
): InstallmentType {
    return cardBalanceId != null ? "INVOICE" : "MONTHLY";
}

export function isInstallmentPaid(
    item: Pick<InstallmentListItem, "paidInstallments" | "totalInstallments">
): boolean {
    return item.totalInstallments > 0 && item.paidInstallments >= item.totalInstallments;
}

export function getInstallmentStatus(
    item: Pick<
        InstallmentListItem,
        "paidInstallments" | "totalInstallments" | "isOverdue"
    >
): InstallmentItemStatus {
    // Atraso vence "quitado": totalmente faturado com fatura vencida e em aberto ainda é dívida.
    if (item.isOverdue) return "OVERDUE";
    if (isInstallmentPaid(item)) return "PAID";
    return "ACTIVE";
}

export function getRemainingInstallments(
    item: Pick<InstallmentListItem, "paidInstallments" | "totalInstallments">
): number {
    return Math.max(0, item.totalInstallments - item.paidInstallments);
}

/** Quantidade de parcelas ainda em aberto (mutáveis) respeitando a fronteira de consolidação. */
export function getOpenInstallmentsCount(
    item: Pick<InstallmentListItem, "consolidatedInstallments" | "totalInstallments">
): number {
    return Math.max(0, item.totalInstallments - item.consolidatedInstallments);
}

export function isFullyConsolidated(
    item: Pick<InstallmentListItem, "consolidatedInstallments" | "totalInstallments">
): boolean {
    return getOpenInstallmentsCount(item) === 0;
}

/** Saldo devedor exato em centavos: total menos o que já foi efetivamente pago. */
export function getRemainingAmount(
    item: Pick<InstallmentListItem, "totalAmount" | "paidAmount">
): number {
    return Math.max(0, item.totalAmount - item.paidAmount);
}

/** Progresso de 0 a 100. */
export function getInstallmentProgress(
    item: Pick<InstallmentListItem, "paidInstallments" | "totalInstallments">
): number {
    if (item.totalInstallments <= 0) return 0;
    return Math.min(
        100,
        Math.round((item.paidInstallments / item.totalInstallments) * 100)
    );
}

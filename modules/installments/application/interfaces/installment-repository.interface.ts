import type { InstallmentType } from "../../models/schemas/installment-item.schema";
import type { InstallmentCardRecord } from "../policies/installment.policy";
import type { InstallmentScheduleItem } from "../services/installment-schedule.calculator";

export interface CreateInstallmentRepositoryDTO {
    contextId: number;
    name: string;
    type: InstallmentType;
    /** Subcategoria padrão do parcelamento (`Balance.parentId`). */
    subcategoryId: number;
    /** Cartão da fatura; obrigatório quando `type` é `INVOICE`, nulo no mês a mês. */
    cardId: number | null;
    schedule: InstallmentScheduleItem[];
}

export interface IInstallmentRepository {
    /**
     * Cria o Balance `INSTALLMENT` (Agreement finito, CycleRule e valor da parcela) e os lançamentos
     * de cada parcela. Deve rodar numa única transação (ver `IInstallmentUnitOfWork`).
     */
    create(data: CreateInstallmentRepositoryDTO): Promise<{ id: number; name: string }>;

    /** Balance do cartão pelo id dentro do contexto (qualquer tipo), para validação. */
    findCardById(contextId: number, cardId: number): Promise<InstallmentCardRecord | null>;
}

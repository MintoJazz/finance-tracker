import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type { ISpaceAccessProvider } from "@/modules/space/application/interfaces/space-access-provider.interface";
import { CategoryDomainError } from "@/modules/categories/application/policies/category.policy";
import { resolveSubcategoryId } from "@/modules/categories/application/services/category-classification.resolver";
import type { InstallmentFormValues } from "@/modules/installments/models/schemas/installment-form.schema";
import { failure, success, type Result } from "@/types/result.types";
import type { IInstallmentUnitOfWork } from "../interfaces/installment-uow.interface";
import { InstallmentDomainError, InstallmentPolicy } from "../policies/installment.policy";
import { buildInstallmentSchedule } from "../services/installment-schedule.calculator";

export interface CreateInstallmentUseCaseDTO {
    session: SessionPayload;
    data: InstallmentFormValues;
}

export interface CreateInstallmentResult {
    id: number;
    name: string;
}

export class CreateInstallmentUseCase {
    constructor(
        private readonly unitOfWork: IInstallmentUnitOfWork,
        private readonly getSpaceAccess: ISpaceAccessProvider
    ) {}

    async execute({
        session,
        data,
    }: CreateInstallmentUseCaseDTO): Promise<Result<CreateInstallmentResult>> {
        try {
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.getSpaceAccess.execute(session);

            if (!accessSuccess || !accessData) {
                console.warn(
                    `[CreateInstallmentUseCase] Falha de acesso ao espaço para partyId=${session.partyId}, contextId=${session.contextId}:`,
                    error
                );
                return failure(error ?? "Acesso negado ao contexto financeiro");
            }

            if (!accessData.canManageBalances) {
                console.warn(
                    `[CreateInstallmentUseCase] Permissão canManageBalances negada para partyId=${session.partyId}, contextId=${session.contextId}`
                );
                return failure("Sem permissão para criar parcelamentos neste contexto!");
            }

            const contextId = session.contextId;
            const schedule = buildInstallmentSchedule({
                firstDate: data.purchaseDate,
                total: data.totalAmount,
                count: data.totalInstallments,
            });

            // Cartão, categoria, subcategoria e parcelamento na mesma transação
            const created = await this.unitOfWork.run(
                async ({ categoryRepo, installmentRepo }) => {
                    // 1. Cartão da fatura (só no parcelamento em fatura)
                    let cardId: number | null = null;
                    if (data.type === "INVOICE") {
                        if (data.cardId == null) {
                            throw new InstallmentDomainError(
                                "Selecione o cartão da fatura.",
                                "CARD_REQUIRED"
                            );
                        }
                        const card = await installmentRepo.findCardById(contextId, data.cardId);
                        cardId = InstallmentPolicy.validateCard(card).id;
                    }

                    // 2. Categoria e subcategoria (novas ou existentes)
                    const subcategoryId = await resolveSubcategoryId(
                        categoryRepo,
                        contextId,
                        data
                    );

                    // 3. Balance INSTALLMENT + Agreement + lançamentos das parcelas
                    return installmentRepo.create({
                        contextId,
                        name: data.name,
                        type: data.type,
                        subcategoryId,
                        cardId,
                        schedule,
                    });
                }
            );

            return success(created);
        } catch (err) {
            if (err instanceof InstallmentDomainError || err instanceof CategoryDomainError) {
                return failure(err.message);
            }
            console.error("[CreateInstallmentUseCase] Falha crítica:", err);
            return failure("Ocorreu um erro interno. Tente novamente mais tarde.");
        }
    }
}

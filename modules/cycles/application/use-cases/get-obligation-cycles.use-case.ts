import { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils"
import { failure, Result, success } from "@/types/result.types"
import {
    addMonths,
    endOfMonth,
    startOfMonth,
    subMonths,
} from "date-fns"
import {
    CycleView,
    ObligationCyclesResponse,
} from "@/modules/cycles/models/obligation-cycle.schema"
import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service"
import { CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface"
import { IContractProfileQueries } from "@/modules/contracts/application/interfaces/contract-profile-queries.interface"
import { IPlanningAccessProvider } from "@/modules/space/application/interfaces/planning-access-provider.interface"

export interface GetObligationCyclesUseCaseDTO {
    session: SessionPayload
    contextId?: number
    agreementId: number
    cursor?: string // referenceDate
    direction?: "before" | "after"
    limit?: number
    now?: Date
}

export class GetObligationCyclesUseCase {
    constructor(
        private readonly queries: IContractProfileQueries,
        private readonly accessProvider: IPlanningAccessProvider,
        private readonly cycleEngine: CycleEngineService
    ) {}

    async execute(
        dto: GetObligationCyclesUseCaseDTO
    ): Promise<Result<ObligationCyclesResponse>> {
        try {
            const contextId = dto.contextId ?? dto.session.contextId

            // 1. Validar acesso ao contexto
            const {
                success: accessSuccess,
                data: accessData,
                error,
            } = await this.accessProvider.execute(dto.session)

            if (!accessSuccess || !accessData) {
                return failure(error ?? "Falha ao validar acesso ao contexto.")
            }

            if (!accessData.canViewPlanning) {
                return failure(
                    "Sem permissão para visualizar compromissos deste contexto!"
                )
            }

            const now = dto.now ? new Date(dto.now) : new Date()

            // 2. Definir janela ampla para buscar o histórico de regras e lançamentos
            const window: CycleWindow = {
                from: startOfMonth(subMonths(now, 36)),
                to: endOfMonth(addMonths(now, 12)),
            }

            // 3. Buscar dados do contrato
            const rawData = await this.queries.findContractProfileData(
                contextId,
                { agreementId: dto.agreementId },
                window
            )

            if (!rawData) {
                return failure("Contrato não encontrado.")
            }

            // 4. Projetar todos os ciclos de obrigação respeitando MAX_ADVANCE (3 meses/ciclos)
            const allCycles = this.cycleEngine.projectObligationCycles(
                rawData.cycleSource,
                window,
                now,
                3
            )

            if (allCycles.length === 0) {
                return success({
                    items: [],
                    prevCursor: null,
                    nextCursor: null,
                })
            }

            const limit = Math.max(1, Math.min(dto.limit ?? 12, 50))
            const direction = dto.direction ?? "after"

            let startIndex = 0
            let endIndex = 0

            if (!dto.cursor) {
                // Sem cursor: ancora no primeiro ciclo com saldo em aberto
                const firstOpenIdx = allCycles.findIndex(
                    (c) => c.outstanding > 0 && c.status !== "UNRECORDED"
                )
                const fallbackOpenIdx = allCycles.findIndex((c) => c.outstanding > 0)
                const anchorIdx =
                    firstOpenIdx !== -1
                        ? firstOpenIdx
                        : fallbackOpenIdx !== -1
                        ? fallbackOpenIdx
                        : Math.max(0, allCycles.length - limit)

                startIndex = anchorIdx
                endIndex = Math.min(allCycles.length, startIndex + limit)
            } else {
                const cursorIdx = allCycles.findIndex(
                    (c) => c.referenceDate === dto.cursor
                )

                if (cursorIdx === -1) {
                    startIndex = 0
                    endIndex = Math.min(allCycles.length, limit)
                } else if (direction === "after") {
                    startIndex = cursorIdx
                    endIndex = Math.min(allCycles.length, startIndex + limit)
                } else {
                    endIndex = cursorIdx + 1
                    startIndex = Math.max(0, endIndex - limit)
                }
            }

            const items = allCycles.slice(startIndex, endIndex)
            const prevCursor = startIndex > 0 ? allCycles[startIndex - 1].referenceDate : null
            const nextCursor = endIndex < allCycles.length ? allCycles[endIndex].referenceDate : null

            return success({
                items,
                prevCursor,
                nextCursor,
            })
        } catch (error) {
            console.error("[GetObligationCyclesUseCase] Falha crítica:", error)
            return failure("Ocorreu um erro interno ao carregar os ciclos da obrigação.")
        }
    }
}


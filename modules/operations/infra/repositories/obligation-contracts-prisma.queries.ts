import { prisma } from "@/lib/prisma"
import { format, parseISO, subMonths, addMonths, startOfMonth, endOfMonth } from "date-fns"
import {
  GetObligationContractsParams,
  IObligationContractsQueries,
  ObligationContractItem,
} from "../../application/interfaces/obligation-contracts-queries.interface"
import { ContractProfilePrismaQueries } from "@/modules/contracts/infra/repositories/contract-profile-prisma.queries"
// import { CycleEngineService } from "@/modules/cycles/application/services/cycle-engine.service"
// import { CycleWindow } from "@/modules/cycles/application/interfaces/commitment-cycle-engine.interface"

export class ObligationContractsPrismaQueries
  implements IObligationContractsQueries
{
  constructor(
    private readonly contractProfileQueries = new ContractProfilePrismaQueries(),
    private readonly cycleEngine = new CycleEngineService()
  ) {}

  async getObligationContracts(
    contextId: number,
    params: GetObligationContractsParams
  ): Promise<ObligationContractItem[]> {
    const isPay = params.nature === "PAY"
    const allowedBalanceTypes = isPay
      ? (["PAYABLE", "CREDIT"] as const)
      : (["RECEIVABLE"] as const)

    const balances = await prisma.balance.findMany({
      where: {
        contextId,
        removedAt: null,
        balanceType: { in: allowedBalanceTypes as unknown as any[] },
        agreement: { isNot: null },
        ...(params.search && params.search.trim().length > 0
          ? {
              name: {
                contains: params.search.trim(),
                mode: "insensitive",
              },
            }
          : {}),
      },
      include: {
        agreement: true,
      },
      take: params.limit ?? 50,
      orderBy: {
        name: "asc",
      },
    })

    const now = new Date()
    const window: CycleWindow = {
      from: startOfMonth(subMonths(now, 12)),
      to: endOfMonth(addMonths(now, 6)),
    }

    const items: ObligationContractItem[] = []

    for (const b of balances) {
      if (!b.agreement) continue

      const rawData = await this.contractProfileQueries.findContractProfileData(
        contextId,
        { agreementId: b.id },
        window
      )

      if (!rawData) continue

      const cycles = this.cycleEngine.projectObligationCycles(
        rawData.cycleSource,
        window,
        now,
        3
      )

      // pendingAmount não inclui ciclos projetados nem UNRECORDED
      const realOpenCycles = cycles.filter(
        (c) => c.status === "OPEN" || c.status === "PARTIAL"
      )

      const pendingAmount = realOpenCycles.reduce(
        (sum, c) => sum + c.outstanding,
        0
      )

      const overdueCycles = realOpenCycles.filter((c) => c.isOverdue)
      const overdueCount = overdueCycles.length

      const sortedDueDates = realOpenCycles
        .map((c) => c.dueDate)
        .sort((d1, d2) => new Date(d1).getTime() - new Date(d2).getTime())
      const nextDueDate = sortedDueDates[0] ?? null

      let subtitle = "Em dia"
      if (overdueCount > 0 && nextDueDate) {
        const dateStr = format(parseISO(nextDueDate), "dd/MM")
        subtitle = `${overdueCount} vencido${overdueCount > 1 ? "s" : ""} · próximo vence ${dateStr}`
      } else if (overdueCount > 0) {
        subtitle = `${overdueCount} vencido${overdueCount > 1 ? "s" : ""}`
      } else if (nextDueDate) {
        const dateStr = format(parseISO(nextDueDate), "dd/MM")
        subtitle = `Próximo vence ${dateStr}`
      } else if (cycles.some((c) => c.status === "PROJECTED")) {
        subtitle = "Previsões futuras"
      }

      items.push({
        agreementId: b.id,
        balanceId: b.id,
        name: b.name,
        balanceType: b.balanceType as "CREDIT" | "PAYABLE" | "RECEIVABLE",
        subtitle,
        pendingAmount,
        overdueCount,
        nextDueDate,
      })
    }

    // Ordenação: com vencidos primeiro, depois por nextDueDate mais próximo
    items.sort((a, b) => {
      const overdueDiff = (b.overdueCount > 0 ? 1 : 0) - (a.overdueCount > 0 ? 1 : 0)
      if (overdueDiff !== 0) return overdueDiff

      const dueA = a.nextDueDate ? new Date(a.nextDueDate).getTime() : Infinity
      const dueB = b.nextDueDate ? new Date(b.nextDueDate).getTime() : Infinity
      if (dueA !== dueB) return dueA - dueB

      return a.name.localeCompare(b.name)
    })

    return items
  }
}


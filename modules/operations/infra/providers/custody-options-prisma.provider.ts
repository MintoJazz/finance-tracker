import { prisma } from "@/lib/prisma"
import { sumEffectiveAmount } from "@/modules/agreements/application/services/agreement-ledger"
import type { ICustodyOptionsProvider } from "../../application/interfaces/operation-options-provider.interface"
import type { CustodyOption } from "../../models/operation-options.schema"
import type { CustodyBalanceType } from "../../models/operation-seed.schema"

export class CustodyOptionsPrismaProvider implements ICustodyOptionsProvider {
  async listCustodyOptions(spaceId?: number): Promise<CustodyOption[]> {
    if (!spaceId || spaceId <= 0) return []

    const balances = await prisma.balance.findMany({
      where: {
        contextId: spaceId,
        balanceType: { in: ["WALLET", "CREDIT", "RESERVE"] },
        removedAt: null,
      },
      include: {
        appearance: true,
        agreement: {
          include: {
            amountEntries: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    if (balances.length === 0) return []

    const balanceIds = balances.map((b) => b.id)
    const grouped = await prisma.movement.groupBy({
      by: ["balanceId"],
      where: {
        balanceId: { in: balanceIds },
        entry: {
          reversedBy: null,
          reversesEntryId: null,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const netSumMap = new Map<number, number>()
    for (const id of balanceIds) {
      netSumMap.set(id, 0)
    }
    for (const item of grouped) {
      netSumMap.set(item.balanceId, item._sum.amount ?? 0)
    }

    return balances.map((balance) => {
      const type = balance.balanceType as CustodyBalanceType
      const subtitle =
        type === "CREDIT"
          ? "Cartão de crédito"
          : type === "RESERVE"
            ? "Reserva"
            : "Carteira"

      const netSum = netSumMap.get(balance.id) ?? 0

      let balanceCents: number
      if (type === "CREDIT") {
        const limit = sumEffectiveAmount(balance.agreement?.amountEntries ?? [])
        const usedLimit = Math.max(0, -netSum)
        balanceCents = Math.max(0, limit - usedLimit)
      } else {
        balanceCents = netSum
      }

      return {
        id: balance.id,
        name: balance.name,
        type,
        subtitle,
        icon: balance.appearance?.icon ?? null,
        color: balance.appearance?.color ?? null,
        balanceCents,
      }
    })
  }
}


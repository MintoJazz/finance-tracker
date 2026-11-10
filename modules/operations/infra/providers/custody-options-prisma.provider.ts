import { prisma } from "@/lib/prisma"
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
      },
      orderBy: {
        name: "asc",
      },
    })

    return balances.map((balance) => {
      const type = balance.balanceType as CustodyBalanceType
      const subtitle =
        type === "CREDIT"
          ? "Cartão de crédito"
          : type === "RESERVE"
            ? "Reserva"
            : "Carteira"

      return {
        id: balance.id,
        name: balance.name,
        type,
        subtitle,
        icon: balance.appearance?.icon ?? null,
        color: balance.appearance?.color ?? null,
      }
    })
  }
}


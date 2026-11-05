import { prisma } from "@/lib/prisma"
import {
  CreateCardRepositoryDTO,
  ICardRepository,
  UpdateCardRepositoryDTO,
} from "../../application/interfaces/card-repository.interface"
import { CardEntity } from "../../models/card.schema"

function toCivilDateUtc(d = new Date()): Date {
  return new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
}

export class CardPrismaRepository implements ICardRepository {
  async create(
    data: CreateCardRepositoryDTO
  ): Promise<{ id: number; name: string }> {
    const now = new Date()
    const todayUtc = toCivilDateUtc(now)

    const card = await prisma.balance.create({
      data: {
        contextId: data.contextId,
        name: data.name,
        balanceType: "CREDIT",
        agreement: {
          create: {
            includeInProjection: true,
            startsAt: todayUtc,
            rules: {
              create: {
                effectiveFrom: todayUtc,
                frequency: "MONTHLY",
                interval: 1,
                closingDay: data.closingDay,
                dueDay: data.dueDay,
              },
            },
            amountEntries: {
              create: {
                amount: data.limit,
                effectiveAt: now,
                reason: "Limite inicial",
              },
            },
          },
        },
      },
      select: {
        id: true,
        name: true,
      },
    })

    return card
  }

  async findByIdAndContextId(
    id: number,
    contextId: number
  ): Promise<CardEntity | null> {
    const card = await prisma.balance.findFirst({
      where: {
        id,
        contextId,
        balanceType: "CREDIT",
      },
      select: {
        id: true,
        name: true,
        contextId: true,
        removedAt: true,
      },
    })

    if (!card) return null

    return {
      id: card.id,
      name: card.name,
      contextId: card.contextId,
      isArchived: card.removedAt !== null,
    }
  }

  async update(
    id: number,
    contextId: number,
    data: UpdateCardRepositoryDTO
  ): Promise<{ id: number; name: string }> {
    return await prisma.$transaction(async (tx) => {
      // 1. Atualizar nome do cartão
      const updatedCard = await tx.balance.update({
        where: {
          id_contextId_balanceType: {
            id,
            contextId,
            balanceType: "CREDIT",
          },
        },
        data: {
          name: data.name,
        },
        select: {
          id: true,
          name: true,
        },
      })

      // 2. Histórico de Limite e Regras de Ciclo via Agreement
      const agreement = await tx.agreement.findUnique({
        where: { balanceId: id },
        include: {
          amountEntries: {
            orderBy: { effectiveAt: "asc" },
          },
          rules: {
            orderBy: { effectiveFrom: "desc" },
            take: 1,
          },
        },
      })

      if (!agreement) {
        throw new Error(`Agreement não encontrado para o cartão id=${id}`)
      }

      const currentLimit = Math.max(
        0,
        agreement.amountEntries.reduce((sum, entry) => sum + entry.amount, 0)
      )

      const delta = data.limit - currentLimit
      if (delta !== 0) {
        await tx.agreementAmountEntry.create({
          data: {
            agreementId: agreement.balanceId,
            amount: delta,
            effectiveAt: new Date(),
            reason: "Ajuste de limite",
          },
        })
      }

      // 3. Regras de Ciclo (CycleRule)
      const today = toCivilDateUtc()
      const currentRule = agreement.rules[0]
      const rulesChanged =
        currentRule?.closingDay !== data.closingDay ||
        currentRule?.dueDay !== data.dueDay

      if (rulesChanged) {
        const todayRule = await tx.cycleRule.findUnique({
          where: {
            agreementId_effectiveFrom: {
              agreementId: agreement.balanceId,
              effectiveFrom: today,
            },
          },
        })

        if (todayRule) {
          await tx.cycleRule.update({
            where: { id: todayRule.id },
            data: {
              closingDay: data.closingDay,
              dueDay: data.dueDay,
            },
          })
        } else {
          await tx.cycleRule.create({
            data: {
              agreementId: agreement.balanceId,
              effectiveFrom: today,
              frequency: "MONTHLY",
              interval: 1,
              closingDay: data.closingDay,
              dueDay: data.dueDay,
            },
          })
        }
      }

      return updatedCard
    })
  }

  async archive(id: number, contextId: number): Promise<{ id: number; name: string }> {
    const archived = await prisma.balance.update({
      where: {
        id_contextId_balanceType: {
          id,
          contextId,
          balanceType: "CREDIT",
        },
      },
      data: {
        removedAt: new Date(),
      },
      select: {
        id: true,
        name: true,
      },
    })

    return archived
  }

  async restore(id: number, contextId: number): Promise<{ id: number; name: string }> {
    const restored = await prisma.balance.update({
      where: {
        id_contextId_balanceType: {
          id,
          contextId,
          balanceType: "CREDIT",
        },
      },
      data: {
        removedAt: null,
      },
      select: {
        id: true,
        name: true,
      },
    })

    return restored
  }
}

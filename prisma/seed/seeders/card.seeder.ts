import { BalanceType, CycleFrequency, EntryType, MovementDirection } from "../../generated/prisma/enums";
import { cardsFixture } from "../data/card.data";
import type { PrismaClientInstance } from "../helpers";
import type { SeedRegistry } from "../registry";

export async function seedCards(
  prisma: PrismaClientInstance,
  registry: SeedRegistry
) {
  console.log(`💳 Criando ${cardsFixture.length} cartões de crédito com limites e regras de ciclo...`);

  for (const card of cardsFixture) {
    const contextId = registry.getContextIdOrThrow(card.ownerEmail);

    const balance = await prisma.$transaction(async (tx) => {
      // 1. Criação do Balance do tipo CREDIT
      const createdBalance = await tx.balance.create({
        data: {
          contextId,
          name: card.name,
          balanceType: BalanceType.CREDIT,
          removedAt: card.isArchived ? new Date() : null,
        },
      });

      // 2. Criação do Limite Inicial em LimitEntry
      await tx.limitEntry.create({
        data: {
          balanceId: createdBalance.id,
          amount: card.limit,
          effectiveAt: new Date(2026, 0, 1),
          reason: "Limite Inicial",
        },
      });

      // 3. Criação da Recurrencia com as Regras de Ciclo (closingDay e dueDay)
      await tx.recurrence.create({
        data: {
          balanceId: createdBalance.id,
          startsAt: card.startsAt ? new Date(card.startsAt) : new Date(2026, 0, 1),
          includeInProjection: true,
          rules: {
            create: {
              closingDay: card.closingDay,
              dueDay: card.dueDay,
              frequency: CycleFrequency.MONTHLY,
              interval: 1,
              effectiveFrom: new Date(2026, 0, 1),
            },
          },
        },
      });

      // 4. Criação de despesas/fatura inicial se configurado
      if (card.initialExpenses && card.initialExpenses.length > 0) {
        for (const expense of card.initialExpenses) {
          await tx.entry.create({
            data: {
              description: expense.description,
              date: expense.date ? new Date(expense.date) : new Date(),
              type: EntryType.DIRECT,
              movements: {
                create: {
                  balanceId: createdBalance.id,
                  amount: expense.amount,
                  direction: MovementDirection.DEBIT,
                },
              },
            },
          });
        }
      }

      return createdBalance;
    });

    registry.setBalance(card.ownerEmail, card.name, balance.id);
    console.log(`  ✔ [${card.ownerEmail}] 💳 ${card.name} (balanceId=${balance.id})`);
  }
}

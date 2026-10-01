import { EntryType, MovementDirection } from "../../generated/prisma/enums";
import { balancesFixture } from "../data/balance.data";
import type { PrismaClientInstance } from "../helpers";
import type { SeedRegistry } from "../registry";

export async function seedAccountsAndInitialBalances(
  prisma: PrismaClientInstance,
  registry: SeedRegistry
) {
  console.log(`💼 Criando ${balancesFixture.length} balances (carteiras/contas)...`);

  for (const item of balancesFixture) {
    const contextId = registry.getContextIdOrThrow(item.ownerEmail);

    const balance = await prisma.$transaction(async (tx) => {
      const createdBalance = await tx.balance.create({
        data: {
          contextId,
          name: item.name,
          balanceType: item.balanceType,
        },
      });

      if (item.initialBalance && item.initialBalance.amount > 0) {
        await tx.entry.create({
          data: {
            description: `Saldo Inicial - ${item.name}`,
            date: item.initialBalance.date ? new Date(item.initialBalance.date) : new Date(),
            type: EntryType.DIRECT,
            movements: {
              create: {
                balanceId: createdBalance.id,
                amount: item.initialBalance.amount,
                direction: item.initialBalance.direction ?? MovementDirection.CREDIT,
              },
            },
          },
        });
      }

      return createdBalance;
    });

    registry.setBalance(item.ownerEmail, item.name, balance.id);
    console.log(`  ✔ [${item.ownerEmail}] ${item.name} (balanceId=${balance.id})`);
  }
}
import { prisma } from "../../lib/prisma";
import { DEFAULT_PASSWORD } from "./data/users.data";
import { resetDatabase } from "./helpers";
import { SeedRegistry } from "./registry";
import { seedAccountsAndInitialBalances } from "./seeders/account.seeder";
import { seedCards } from "./seeders/card.seeder";
import { seedIdentityAndSpaces } from "./seeders/identity.seeder";

async function main() {
  const registry = new SeedRegistry();

  console.log("🧹 Limpando banco de dados...");
  await resetDatabase(prisma);

  // Pipeline de execução ordenada por dependência de domínio
  await seedIdentityAndSpaces(prisma, registry);
  await seedAccountsAndInitialBalances(prisma, registry);
  await seedCards(prisma, registry);

  console.log(`\n✅ Seed concluída com sucesso! Senha padrão: ${DEFAULT_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro na execução da seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
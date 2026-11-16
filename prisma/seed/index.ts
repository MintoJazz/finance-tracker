import { prisma } from "../../lib/prisma";
import { DEFAULT_PASSWORD, resetDatabase } from "./core/helpers";
import { SystemSeedFactory } from "./core/system.factory";
import { seedAnaScenario } from "./scenarios/ana.scenario";
import { seedClaimsScenario } from "./scenarios/claims.scenario";
import { seedOtherUsersScenario } from "./scenarios/others.scenario";
import { seedSharedSpacesScenario } from "./scenarios/shared-spaces.scenario";

async function main() {
  console.log("🧹 Limpando banco de dados e resetando IDs...");
  await resetDatabase(prisma);

  const factory = await SystemSeedFactory.init(prisma);

  const anaData = await seedAnaScenario(factory);
  const othersData = await seedOtherUsersScenario(factory);

  const sharedSpacesData = await seedSharedSpacesScenario(factory, {
    anaId: anaData.party.id,
    brunoId: othersData.bruno.party.id,
    carlaId: othersData.carla.party.id,
    diegoId: othersData.diego.party.id,
    eduardaId: othersData.eduarda.party.id,
  });

  console.log("🌳 Semeando árvores de cobrança e rateios inter-contextos (claims)...");
  await seedClaimsScenario(factory, {
    ana: anaData,
    others: othersData,
    sharedSpaces: sharedSpacesData,
  });

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
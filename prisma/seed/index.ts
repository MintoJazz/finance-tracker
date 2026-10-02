import { prisma } from "../../lib/prisma";
import { DEFAULT_PASSWORD, resetDatabase } from "./core/helpers";
import { SystemSeedFactory } from "./core/system.factory";
import { seedAnaScenario } from "./scenarios/ana.scenario";
import { seedOtherUsersScenario } from "./scenarios/others.scenario";
import { seedSharedSpacesScenario } from "./scenarios/shared-spaces.scenario";

async function main() {
  console.log("🧹 Limpando banco de dados e resetando IDs...");
  await resetDatabase(prisma);

  const factory = await SystemSeedFactory.init(prisma);

  const { party: ana } = await seedAnaScenario(factory);
  const { bruno, carla, diego, eduarda } = await seedOtherUsersScenario(factory);

  await seedSharedSpacesScenario(factory, {
    anaId: ana.id,
    brunoId: bruno.party.id,
    carlaId: carla.party.id,
    diegoId: diego.party.id,
    eduardaId: eduarda.party.id,
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
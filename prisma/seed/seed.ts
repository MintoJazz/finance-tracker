import { prisma } from "../../lib/prisma";
import { hashPassword, loadSeedData, resetDatabase } from "./helpers";

async function main() {
  const { defaultPassword, users } = loadSeedData();

  console.log("🧹 Limpando banco...");
  await resetDatabase(prisma);

  // Mesma senha pra todos: gera o hash uma vez só
  const password = await hashPassword(defaultPassword);

  console.log(`🌱 Criando ${users.length} usuários...`);
  for (const user of users) {
    const party = await prisma.party.create({
      data: {
        name: user.name,
        birthDate: user.birthDate ? new Date(user.birthDate) : null,
        phone: user.phone ?? null,
        auth: {
          create: {
            email: user.email,
            password,
            // emailVerifiedAt fica null por enquanto (login ainda não exige)
          },
        },
        contexts: {
          create: {
            role: "OWNER",
            status: "ACTIVE",
            joinedAt: new Date(),
            financialContext: { create: { name: user.contextName } },
          },
        },
      },
    });

    console.log(`  ✔ ${user.email} (partyId=${party.id})`);
  }

  console.log(`✅ Seed concluída. Senha de todos: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Erro na seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
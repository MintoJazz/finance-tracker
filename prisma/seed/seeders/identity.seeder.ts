import { DEFAULT_PASSWORD, usersFixture } from "../data/users.data";
import { hashPassword, type PrismaClientInstance } from "../helpers";
import type { SeedRegistry } from "../registry";

export async function seedIdentityAndSpaces(
  prisma: PrismaClientInstance,
  registry: SeedRegistry
) {
  console.log(`👤 Criando ${usersFixture.length} usuários e contextos padrão...`);
  const passwordHash = await hashPassword(DEFAULT_PASSWORD);

  for (const user of usersFixture) {
    const party = await prisma.party.create({
      data: {
        name: user.name,
        birthDate: user.birthDate ? new Date(user.birthDate) : null,
        phone: user.phone ?? null,
        auth: {
          create: {
            email: user.email,
            password: passwordHash,
          },
        },
        contexts: {
          create: {
            role: "OWNER",
            status: "ACTIVE",
            joinedAt: new Date(),
            financialContext: {
              create: { name: user.defaultContextName },
            },
          },
        },
      },
      include: {
        contexts: true,
      },
    });

    const defaultContextId = party.contexts[0].contextId;
    registry.setUserContext(user.email, party.id, defaultContextId);

    console.log(`  ✔ ${user.email} (partyId=${party.id}, contextId=${defaultContextId})`);
  }
}
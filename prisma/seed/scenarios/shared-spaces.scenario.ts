import {
  BalanceType,
  ContextMemberRole,
  ContextMemberStatus,
  CycleFrequency,
  EntryType,
  MovementDirection,
} from "../../generated/prisma/enums";
import type { SystemSeedFactory } from "../core/system.factory";

interface SharedSpacesParticipants {
  anaId: number;
  brunoId: number;
  carlaId: number;
  diegoId: number;
  eduardaId: number;
}

export async function seedSharedSpacesScenario(
  factory: SystemSeedFactory,
  users: SharedSpacesParticipants
) {
  console.log("🤝 Populando contextos compartilhados, membros e obrigações de grupo...");

  // =========================================================================
  // CENÁRIO 1: "Casa Ana & Bruno" (Gestão Familiar + Rateio de Condomínio)
  // =========================================================================
  const familySpace = await factory.createSpace(users.anaId, "Casa Ana & Bruno");

  await familySpace.addMember({
    partyId: users.brunoId,
    role: ContextMemberRole.ADMIN,
    status: ContextMemberStatus.ACTIVE,
    invitedByPartyId: users.anaId,
  });

  const lucasDependent = await factory.createDependent(users.anaId, {
    name: "Lucas Souza Lima",
    birthDate: "2016-05-20",
  });
  await familySpace.addMember({
    partyId: lucasDependent.id,
    role: ContextMemberRole.DEPENDENT,
    status: ContextMemberStatus.ACTIVE,
    invitedByPartyId: users.anaId,
  });

  await familySpace.addMember({
    partyId: users.carlaId,
    role: ContextMemberRole.MEMBER,
    status: ContextMemberStatus.PENDING,
    invitedByPartyId: users.brunoId,
  });

  await familySpace.addMember({
    partyId: users.diegoId,
    role: ContextMemberRole.MEMBER,
    status: ContextMemberStatus.REMOVED,
    invitedByPartyId: users.anaId,
  });

  const contaConjunta = await familySpace.addWallet({
    name: "Conta Conjunta Itaú",
    initialBalance: { amount: 850000, date: "2026-09-01T10:00:00Z" },
  });

  await familySpace.addWallet({
    name: "Reserva Reforma da Sala",
    type: BalanceType.RESERVE,
    initialBalance: { amount: 1200000, date: "2026-09-01T10:05:00Z" },
  });

  const familyCategories = await familySpace.addDefaultCategoryTree();

  // Obrigação original a pagar do grupo (PAYABLE ancorado na subcategoria Condomínio)
  // Será rateada entre Ana e Bruno em claims.scenario.ts via parentId!
  const condominioAgreement = await familySpace.addCommitmentAgreement({
    name: "Condomínio Edifício Solar",
    categoryId: familyCategories.sub.condominio.id,
    amount: 145000,
    startsAt: "2026-01-01",
    rules: [
      { effectiveFrom: "2026-01-01", frequency: CycleFrequency.MONTHLY, closingDay: 1, dueDay: 10 },
    ],
  });

  await familySpace.addAccrual({
    commitmentBalanceId: condominioAgreement.id,
    categoryBalanceId: familyCategories.sub.condominio.id,
    description: "Taxa Condominial Setembro/2026",
    amount: 145000,
    dueDate: "2026-09-10T08:00:00Z",
    competanceDate: "2026-09-01T00:00:00Z",
  });

  await familySpace.addSettlement({
    walletBalanceId: contaConjunta.id,
    commitmentBalanceId: condominioAgreement.id,
    description: "Pagamento Condomínio Setembro",
    amount: 145000,
    dueDate: "2026-09-10T11:00:00Z",
    competanceDate: "2026-09-01T00:00:00Z",
  });

  await familySpace.addCreditCard({
    name: "Cartão Família C6 Carbon",
    limit: 2000000,
    closingDay: 10,
    dueDay: 17,
    initialExpenses: [
      {
        description: "Compra do Mês - Atacadão",
        amount: 189000,
        date: "2026-09-05T18:30:00Z",
        categoryId: familyCategories.sub.supermercado.id,
      },
    ],
  });

  // =========================================================================
  // CENÁRIO 2: "Viagem Bariloche 2026" (Grupo de Amigos)
  // =========================================================================
  const tripSpace = await factory.createSpace(users.carlaId, "Viagem Bariloche 2026");

  await Promise.all(
    [users.anaId, users.brunoId, users.diegoId].map((friendId) =>
      tripSpace.addMember({
        partyId: friendId,
        role: ContextMemberRole.MEMBER,
        status: ContextMemberStatus.ACTIVE,
        invitedByPartyId: users.carlaId,
      })
    )
  );

  await tripSpace.addMember({
    partyId: users.eduardaId,
    role: ContextMemberRole.MEMBER,
    status: ContextMemberStatus.PENDING,
    invitedByPartyId: users.carlaId,
  });

  const caixinhaViagem = await tripSpace.addWallet({
    name: "Caixinha Coletiva Wise",
    initialBalance: { amount: 600000, date: "2026-09-15T14:00:00Z" },
  });

  const tripCategories = await tripSpace.addDefaultCategoryTree();

  await tripSpace.addDirectEntry({
    balanceId: caixinhaViagem.id,
    counterpartBalanceId: tripCategories.sub.viagens.id,
    description: "Sinal Chalé Airbnb (4 diárias)",
    amount: 240000,
    direction: MovementDirection.DEBIT,
    type: EntryType.DIRECT,
    date: "2026-09-18T16:20:00Z",
  });

  // =========================================================================
  // CENÁRIO 3: "República & Rateio" (Diego OWNER -> Ana PENDING)
  // =========================================================================
  const repSpace = await factory.createSpace(users.diegoId, "República & Rateio");

  await repSpace.addMember({
    partyId: users.eduardaId,
    role: ContextMemberRole.ADMIN,
    status: ContextMemberStatus.ACTIVE,
  });

  await repSpace.addMember({
    partyId: users.anaId,
    role: ContextMemberRole.MEMBER,
    status: ContextMemberStatus.PENDING,
    invitedByPartyId: users.diegoId,
  });

  await repSpace.addDefaultCategoryTree();

  await repSpace.addWallet({
    name: "Fundo Luz, Água e Fibra",
    initialBalance: { amount: 42000, date: "2026-09-20T09:00:00Z" },
  });

  return {
    family: {
      space: familySpace,
      wallets: { contaConjunta },
      subCategories: familyCategories.sub,
      agreements: { condominioAgreement },
    },
    trip: {
      space: tripSpace,
      wallets: { caixinhaViagem },
      subCategories: tripCategories.sub,
    },
    rep: {
      space: repSpace,
    },
  };
}
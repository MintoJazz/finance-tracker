import { MovementDirection } from "../../generated/prisma/enums";
import { ClaimSeedFactory } from "../core/claim.factory";
import type { SystemSeedFactory } from "../core/system.factory";
import type { seedAnaScenario } from "./ana.scenario";
import type { seedOtherUsersScenario } from "./others.scenario";
import type { seedSharedSpacesScenario } from "./shared-spaces.scenario";

type AnaScenarioResult = Awaited<ReturnType<typeof seedAnaScenario>>;
type OthersScenarioResult = Awaited<ReturnType<typeof seedOtherUsersScenario>>;
type SharedSpacesScenarioResult = Awaited<ReturnType<typeof seedSharedSpacesScenario>>;

export async function seedClaimsScenario(
  factory: SystemSeedFactory,
  data: {
    ana: AnaScenarioResult;
    others: OthersScenarioResult;
    sharedSpaces: SharedSpacesScenarioResult;
  }
) {
  const claimFactory = new ClaimSeedFactory(factory.prisma);
  const { ana, others, sharedSpaces } = data;
  const { bruno, carla, diego, eduarda } = others;

  // =========================================================================
  // ÁRVORE 1: BILATERAL SIMPLES (Ana credora -> Diego devedor) - R$ 150,00
  // Todas as pontas apontam para SUBCATEGORIAS (restaurantes)
  // =========================================================================
  await ana.space.addDirectEntry({
    balanceId: ana.wallets.nubank.id,
    counterpartBalanceId: ana.subCategories.restaurantes.id,
    description: "Almoço Compartilhado Restaurante - Conta Diego",
    amount: 15000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-10T12:30:00Z",
  });

  const claimAnaDiegoAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: ana.space.contextId,
    debtorContextId: diego.space.contextId,
    name: "Cobrança Almoço Diego",
  });

  const entryOpeningAnaDiego = await claimFactory.openRootClaim({
    payableId: claimAnaDiegoAccounts.payable.id,
    receivableId: claimAnaDiegoAccounts.receivable.id,
    anchorCategoryId: ana.subCategories.restaurantes.id,
    amount: 15000,
    description: "Cobrança Almoço Restaurante (Ana -> Diego)",
    date: "2026-08-10T14:00:00Z",
  });

  const entryAcceptDiego = await claimFactory.acceptClaim({
    payableId: claimAnaDiegoAccounts.payable.id,
    categoryDId: diego.subCategories.restaurantes.id,
    amount: 15000,
    description: "Aceite Cobrança Almoço Restaurante",
    date: "2026-08-11T10:00:00Z",
  });

  const entryPayDiego = await claimFactory.payClaim({
    walletDId: diego.wallets.bradesco.id,
    payableId: claimAnaDiegoAccounts.payable.id,
    amount: 15000,
    description: "Pagamento Pix Cobrança Almoço (Diego -> Ana)",
    date: "2026-08-12T15:00:00Z",
  });

  const entryReceiveAna = await claimFactory.receiveClaim({
    receivableId: claimAnaDiegoAccounts.receivable.id,
    walletCId: ana.wallets.nubank.id,
    amount: 15000,
    description: "Recebimento Pix Cobrança Almoço de Diego",
    date: "2026-08-12T15:05:00Z",
    reliefCategory: {
      categoryId: ana.subCategories.restaurantes.id,
      amount: 15000,
    },
    onusCategory: {
      categoryId: diego.subCategories.restaurantes.id,
      amount: 15000,
    },
  });

  // =========================================================================
  // ÁRVORE 2: CASCATA COM REPASSE INTERMEDIÁRIO (Bruno -> Ana -> Carla) - R$ 300,00
  // O RECEIVABLE da Ana (contra Carla) aponta seu parentId para o PAYABLE da Ana (para Bruno)
  // =========================================================================
  await bruno.space.addDirectEntry({
    balanceId: bruno.wallets.inter.id,
    counterpartBalanceId: bruno.subCategories.showsEventos.id,
    description: "Compra Ingressos Festival Música",
    amount: 30000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-15T10:00:00Z",
  });

  const claimBrunoAnaAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: bruno.space.contextId,
    debtorContextId: ana.space.contextId,
    name: "Cobrança Ingressos Bruno-Ana",
  });

  const claimAnaCarlaAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: ana.space.contextId,
    debtorContextId: carla.space.contextId,
    name: "Repasse Ingressos Ana-Carla",
  });

  const entryOpeningBrunoAna = await claimFactory.openRootClaim({
    payableId: claimBrunoAnaAccounts.payable.id,
    receivableId: claimBrunoAnaAccounts.receivable.id,
    anchorCategoryId: bruno.subCategories.showsEventos.id,
    amount: 30000,
    description: "Cobrança Ingressos Festival (Bruno -> Ana)",
    date: "2026-08-15T11:00:00Z",
  });

  // Ana repassa R$ 100,00 para Carla vinculando childReceivable.parentId = claimBrunoAnaAccounts.payable.id
  const entryOpeningAnaCarla = await claimFactory.openChildClaim({
    childPayableId: claimAnaCarlaAccounts.payable.id,
    childReceivableId: claimAnaCarlaAccounts.receivable.id,
    parentPayableId: claimBrunoAnaAccounts.payable.id,
    amount: 10000,
    description: "Repasse Ingresso Festival (Ana -> Carla)",
    date: "2026-08-15T14:00:00Z",
  });

  const entryAcceptCarla = await claimFactory.acceptClaim({
    payableId: claimAnaCarlaAccounts.payable.id,
    categoryDId: carla.subCategories.showsEventos.id,
    amount: 10000,
    description: "Aceite Repasse Ingresso Festival (Carla)",
    date: "2026-08-16T09:00:00Z",
  });

  const entryPayCarla = await claimFactory.payClaim({
    walletDId: carla.wallets.santander.id,
    payableId: claimAnaCarlaAccounts.payable.id,
    amount: 10000,
    description: "Pagamento Pix Ingresso Festival (Carla -> Ana)",
    date: "2026-08-16T10:00:00Z",
  });

  const entryAcceptAna = await claimFactory.acceptClaim({
    payableId: claimBrunoAnaAccounts.payable.id,
    categoryDId: ana.subCategories.cinemaShows.id,
    amount: 20000,
    description: "Aceite Cobrança Ingressos Festival (Ana)",
    date: "2026-08-16T11:00:00Z",
  });

  const entryPayAna = await claimFactory.payClaim({
    walletDId: ana.wallets.nubank.id,
    payableId: claimBrunoAnaAccounts.payable.id,
    amount: 20000,
    description: "Pagamento Pix Ingressos Festival (Ana -> Bruno)",
    date: "2026-08-17T09:00:00Z",
  });

  const entryReceiveAnaCarla = await claimFactory.receiveClaim({
    receivableId: claimAnaCarlaAccounts.receivable.id,
    walletCId: ana.wallets.nubank.id,
    amount: 10000,
    description: "Recebimento Pix Ingresso Festival de Carla",
    date: "2026-08-17T10:00:00Z",
    reliefCategory: {
      categoryId: bruno.subCategories.showsEventos.id,
      amount: 10000,
    },
    onusCategory: {
      categoryId: carla.subCategories.showsEventos.id,
      amount: 10000,
    },
  });

  const entryReceiveBrunoAna = await claimFactory.receiveClaim({
    receivableId: claimBrunoAnaAccounts.receivable.id,
    walletCId: bruno.wallets.inter.id,
    amount: 20000,
    description: "Recebimento Pix Ingressos Festival de Ana",
    date: "2026-08-17T11:00:00Z",
    reliefCategory: {
      categoryId: bruno.subCategories.showsEventos.id,
      amount: 20000,
    },
    onusCategory: {
      categoryId: ana.subCategories.cinemaShows.id,
      amount: 20000,
    },
  });

  // =========================================================================
  // ÁRVORE 3: COBRANÇA PENDENTE DE ACEITE (Ana -> Eduarda) - R$ 50,00
  // =========================================================================
  await ana.space.addDirectEntry({
    balanceId: ana.wallets.nubank.id,
    counterpartBalanceId: ana.subCategories.deliveryPadaria.id,
    description: "Café da Tarde - Conta Eduarda",
    amount: 5000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-20T16:00:00Z",
  });

  const claimAnaEduardaAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: ana.space.contextId,
    debtorContextId: eduarda.space.contextId,
    name: "Cobrança Café Eduarda",
  });

  const entryOpeningAnaEduarda = await claimFactory.openRootClaim({
    payableId: claimAnaEduardaAccounts.payable.id,
    receivableId: claimAnaEduardaAccounts.receivable.id,
    anchorCategoryId: ana.subCategories.deliveryPadaria.id,
    amount: 5000,
    description: "Cobrança Café Compartilhado (Ana -> Eduarda)",
    date: "2026-08-20T16:30:00Z",
  });

  // =========================================================================
  // ÁRVORE 4: RATEIO DE GRUPO (1 PAYABLE Original -> 2 RECEIVABLE de Membros)
  // "Casa Ana & Bruno" rateia o Condomínio (R$ 1.450,00) entre Ana (50%) e Bruno (50%).
  // Cada RECEIVABLE do grupo está vinculado ao PAYABLE original (condominioAgreement.id) via parentId!
  // =========================================================================
  const { family } = sharedSpaces;
  const condominioPayableId = family.agreements.condominioAgreement.id;

  // Rateio Membro 1: Casa Ana & Bruno -> Ana (R$ 725,00 - Quitado)
  const rateioCondominioAnaAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: family.space.contextId,
    debtorContextId: ana.space.contextId,
    name: "Rateio Condomínio Set/26 - Cota Ana",
  });

  const entryOpenRateioAna = await claimFactory.openChildClaim({
    childPayableId: rateioCondominioAnaAccounts.payable.id,
    childReceivableId: rateioCondominioAnaAccounts.receivable.id,
    parentPayableId: condominioPayableId,
    amount: 72500,
    description: "Rateio Condomínio Setembro (Casa -> Ana 50%)",
    date: "2026-09-02T09:00:00Z",
  });

  await claimFactory.acceptClaim({
    payableId: rateioCondominioAnaAccounts.payable.id,
    categoryDId: ana.subCategories.condominio.id,
  });

  await claimFactory.payClaim({
    walletDId: ana.wallets.nubank.id,
    payableId: rateioCondominioAnaAccounts.payable.id,
    amount: 72500,
    description: "Pagamento Cota Condomínio Setembro (Ana -> Casa)",
    date: "2026-09-08T14:00:00Z",
  });

  const entryReceiveRateioAna = await claimFactory.receiveClaim({
    receivableId: rateioCondominioAnaAccounts.receivable.id,
    walletCId: family.wallets.contaConjunta.id,
    amount: 72500,
    description: "Recebimento Cota Condomínio de Ana (50%)",
    date: "2026-09-08T14:05:00Z",
    reliefCategory: {
      categoryId: family.subCategories.condominio.id,
      amount: 72500,
    },
    onusCategory: {
      categoryId: ana.subCategories.condominio.id,
      amount: 72500,
    },
  });

  // Rateio Membro 2: Casa Ana & Bruno -> Bruno (R$ 725,00 - Aceito mas Ainda em Aberto)
  const rateioCondominioBrunoAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: family.space.contextId,
    debtorContextId: bruno.space.contextId,
    name: "Rateio Condomínio Set/26 - Cota Bruno",
  });

  const entryOpenRateioBruno = await claimFactory.openChildClaim({
    childPayableId: rateioCondominioBrunoAccounts.payable.id,
    childReceivableId: rateioCondominioBrunoAccounts.receivable.id,
    parentPayableId: condominioPayableId,
    amount: 72500,
    description: "Rateio Condomínio Setembro (Casa -> Bruno 50%)",
    date: "2026-09-02T09:05:00Z",
  });

  await claimFactory.acceptClaim({
    payableId: rateioCondominioBrunoAccounts.payable.id,
    categoryDId: bruno.subCategories.condominio.id,
  });

  // =========================================================================
  // ÁRVORE 5 (Caso de Borda): COBRANÇA BILATERAL COM PAGAMENTO PARCIAL
  // Bruno cobra Ana R$ 120,00 de Churrasco; Ana paga R$ 50,00 e resta R$ 70,00 em aberto.
  // =========================================================================
  const claimChurrascoBrunoAna = await claimFactory.createClaimAccounts({
    creditorContextId: bruno.space.contextId,
    debtorContextId: ana.space.contextId,
    name: "Rateio Churrasco Fim de Semana",
  });

  await claimFactory.openRootClaim({
    payableId: claimChurrascoBrunoAna.payable.id,
    receivableId: claimChurrascoBrunoAna.receivable.id,
    anchorCategoryId: bruno.subCategories.supermercado.id,
    amount: 12000,
    description: "Cobrança Churrasco Domingo (Bruno -> Ana)",
    date: "2026-09-20T12:00:00Z",
  });

  await claimFactory.acceptClaim({
    payableId: claimChurrascoBrunoAna.payable.id,
    categoryDId: ana.subCategories.restaurantes.id,
  });

  await claimFactory.payClaim({
    walletDId: ana.wallets.nubank.id,
    payableId: claimChurrascoBrunoAna.payable.id,
    amount: 5000,
    description: "Pagamento Parcial Pix Churrasco (Ana -> Bruno)",
    date: "2026-09-21T18:00:00Z",
  });

  await claimFactory.receiveClaim({
    receivableId: claimChurrascoBrunoAna.receivable.id,
    walletCId: bruno.wallets.inter.id,
    amount: 5000,
    description: "Recebimento Parcial Pix Churrasco de Ana",
    date: "2026-09-21T18:05:00Z",
    reliefCategory: {
      categoryId: bruno.subCategories.supermercado.id,
      amount: 5000,
    },
    onusCategory: {
      categoryId: ana.subCategories.restaurantes.id,
      amount: 5000,
    },
  });

  return {
    bilateralTree: {
      entryOpeningAnaDiego,
      entryAcceptDiego,
      entryPayDiego,
      entryReceiveAna,
    },
    cascadeTree: {
      entryOpeningBrunoAna,
      entryOpeningAnaCarla,
      entryAcceptCarla,
      entryPayCarla,
      entryAcceptAna,
      entryPayAna,
      entryReceiveAnaCarla,
      entryReceiveBrunoAna,
    },
    pendingTree: {
      entryOpeningAnaEduarda,
    },
    groupSplitTree: {
      entryOpenRateioAna,
      entryReceiveRateioAna,
      entryOpenRateioBruno,
    },
  };
}
import { MovementDirection } from "../../generated/prisma/enums";
import { ClaimSeedFactory } from "../core/claim.factory";
import type { SystemSeedFactory } from "../core/system.factory";
import type { seedAnaScenario } from "./ana.scenario";
import type { seedOtherUsersScenario } from "./others.scenario";

type AnaScenarioResult = Awaited<ReturnType<typeof seedAnaScenario>>;
type OthersScenarioResult = Awaited<ReturnType<typeof seedOtherUsersScenario>>;

export async function seedClaimsScenario(
  factory: SystemSeedFactory,
  data: {
    ana: AnaScenarioResult;
    others: OthersScenarioResult;
  }
) {
  const claimFactory = new ClaimSeedFactory(factory.prisma);

  const { ana, others } = data;
  const { bruno, carla, diego } = others;

  // Localizar categorias de terceiros
  const diegoCatAlim = diego.categories.find((c) =>
    c.name.includes("Alimentação")
  )!;
  const brunoCatLazer = bruno.categories.find((c) =>
    c.name.includes("Lazer")
  )!;
  const carlaCatLazer = carla.categories.find((c) =>
    c.name.includes("Lazer")
  )!;

  // =========================================================================
  // ÁRVORE 1: BILATERAL SIMPLES (Ana credora -> Diego devedor) - R$ 150,00
  // =========================================================================

  // Passo 0: Despesa original da Ana no Nubank em Alimentação
  await ana.space.addDirectEntry({
    balanceId: ana.wallets.nubank.id,
    counterpartBalanceId: ana.categories.catAlimentacao.id,
    description: "Almoço Compartilhado Restaurante - Conta Diego",
    amount: 15000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-10T12:30:00Z",
  });

  // Criar contas de cobrança bilaterais entre Ana e Diego
  const claimAnaDiegoAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: ana.party.id,
    debtorContextId: diego.party.id,
    name: "Cobrança Almoço Diego",
  });

  // Passo 1: Abertura Raiz (CLAIM_OPENING) ancorada em Alimentação da Ana
  const entryOpeningAnaDiego = await claimFactory.openRootClaim({
    payableId: claimAnaDiegoAccounts.payable.id,
    receivableId: claimAnaDiegoAccounts.receivable.id,
    anchorCategoryId: ana.categories.catAlimentacao.id,
    amount: 15000,
    description: "Cobrança Almoço Restaurante (Ana -> Diego)",
    date: "2026-08-10T14:00:00Z",
  });

  // Passo 2: Aceite (CLAIM_ACCEPTANCE) por Diego ancorado em Alimentação do Diego
  const entryAcceptDiego = await claimFactory.acceptClaim({
    payableId: claimAnaDiegoAccounts.payable.id,
    categoryDId: diegoCatAlim.id,
    amount: 15000,
    description: "Aceite Cobrança Almoço Restaurante",
    date: "2026-08-11T10:00:00Z",
  });

  // Passo 3: Pagamento (CLAIM_PAYMENT) por Diego via Bradesco
  const entryPayDiego = await claimFactory.payClaim({
    walletDId: diego.wallets.bradesco.id,
    payableId: claimAnaDiegoAccounts.payable.id,
    amount: 15000,
    description: "Pagamento Pix Cobrança Almoço (Diego -> Ana)",
    date: "2026-08-12T15:00:00Z",
  });

  // Passo 4: Recebimento (CLAIM_RECEIPT) por Ana no Nubank com alívio e ônus
  const entryReceiveAna = await claimFactory.receiveClaim({
    receivableId: claimAnaDiegoAccounts.receivable.id,
    walletCId: ana.wallets.nubank.id,
    amount: 15000,
    description: "Recebimento Pix Cobrança Almoço de Diego",
    date: "2026-08-12T15:05:00Z",
    reliefCategory: {
      categoryId: ana.categories.catAlimentacao.id,
      amount: 15000,
    },
    onusCategory: {
      categoryId: diegoCatAlim.id,
      amount: 15000,
    },
  });

  // =========================================================================
  // ÁRVORE 2: CASCATA COM REPASSE INTERMEDIÁRIO (Bruno -> Ana -> Carla) - R$ 300,00
  // =========================================================================

  // Passo 0: Despesa original do Bruno no Inter em Lazer
  await bruno.space.addDirectEntry({
    balanceId: bruno.wallets.inter.id,
    counterpartBalanceId: brunoCatLazer.id,
    description: "Compra Ingressos Festival Música",
    amount: 30000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-15T10:00:00Z",
  });

  // Contas bilaterais Bruno-Ana
  const claimBrunoAnaAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: bruno.party.id,
    debtorContextId: ana.party.id,
    name: "Cobrança Ingressos Bruno-Ana",
  });

  // Contas bilaterais Ana-Carla
  const claimAnaCarlaAccounts = await claimFactory.createClaimAccounts({
    creditorContextId: ana.party.id,
    debtorContextId: carla.party.id,
    name: "Repasse Ingressos Ana-Carla",
  });

  // Passo 1: Abertura Raiz (CLAIM_OPENING) Bruno cobra Ana (R$ 300,00) ancorado no Lazer do Bruno
  const entryOpeningBrunoAna = await claimFactory.openRootClaim({
    payableId: claimBrunoAnaAccounts.payable.id,
    receivableId: claimBrunoAnaAccounts.receivable.id,
    anchorCategoryId: brunoCatLazer.id,
    amount: 30000,
    description: "Cobrança Ingressos Festival (Bruno -> Ana)",
    date: "2026-08-15T11:00:00Z",
  });

  // Passo 2: Abertura Filho/Cascata (CLAIM_OPENING) Ana repassa R$ 100,00 para Carla
  // par ±100 no payable Bruno-Ana da Ana
  const entryOpeningAnaCarla = await claimFactory.openChildClaim({
    childPayableId: claimAnaCarlaAccounts.payable.id,
    childReceivableId: claimAnaCarlaAccounts.receivable.id,
    parentPayableId: claimBrunoAnaAccounts.payable.id,
    amount: 10000,
    description: "Repasse Ingresso Festival (Ana -> Carla)",
    date: "2026-08-15T14:00:00Z",
  });

  // Passo 3: Aceite (CLAIM_ACCEPTANCE) por Carla de R$ 100,00 ancorado no Lazer da Carla
  const entryAcceptCarla = await claimFactory.acceptClaim({
    payableId: claimAnaCarlaAccounts.payable.id,
    categoryDId: carlaCatLazer.id,
    amount: 10000,
    description: "Aceite Repasse Ingresso Festival (Carla)",
    date: "2026-08-16T09:00:00Z",
  });

  // Passo 4: Pagamento (CLAIM_PAYMENT) por Carla de R$ 100,00 via Santander
  const entryPayCarla = await claimFactory.payClaim({
    walletDId: carla.wallets.santander.id,
    payableId: claimAnaCarlaAccounts.payable.id,
    amount: 10000,
    description: "Pagamento Pix Ingresso Festival (Carla -> Ana)",
    date: "2026-08-16T10:00:00Z",
  });

  // Passo 5: Aceite (CLAIM_ACCEPTANCE) por Ana da sua parte restante (R$ 200,00) em Lazer
  const entryAcceptAna = await claimFactory.acceptClaim({
    payableId: claimBrunoAnaAccounts.payable.id,
    categoryDId: ana.categories.catLazer.id,
    amount: 20000,
    description: "Aceite Cobrança Ingressos Festival (Ana)",
    date: "2026-08-16T11:00:00Z",
  });

  // Passo 6: Pagamento (CLAIM_PAYMENT) por Ana de R$ 200,00 via Nubank
  const entryPayAna = await claimFactory.payClaim({
    walletDId: ana.wallets.nubank.id,
    payableId: claimBrunoAnaAccounts.payable.id,
    amount: 20000,
    description: "Pagamento Pix Ingressos Festival (Ana -> Bruno)",
    date: "2026-08-17T09:00:00Z",
  });

  // Passo 7: Recebimento (CLAIM_RECEIPT) por Ana de R$ 100,00 da Carla
  // Alívio na base do Bruno (100), ônus na Carla (100), e par de passagem ±100 em Lazer da Ana
  const entryReceiveAnaCarla = await claimFactory.receiveClaim({
    receivableId: claimAnaCarlaAccounts.receivable.id,
    walletCId: ana.wallets.nubank.id,
    amount: 10000,
    description: "Recebimento Pix Ingresso Festival de Carla",
    date: "2026-08-17T10:00:00Z",
    reliefCategory: {
      categoryId: brunoCatLazer.id,
      amount: 10000,
    },
    onusCategory: {
      categoryId: carlaCatLazer.id,
      amount: 10000,
    },
    passThroughCategory: {
      categoryId: ana.categories.catLazer.id,
      amount: 10000,
    },
  });

  // Passo 8: Recebimento (CLAIM_RECEIPT) por Bruno de R$ 200,00 da Ana
  // Alívio na base do Bruno (200), ônus em Lazer da Ana (200)
  const entryReceiveBrunoAna = await claimFactory.receiveClaim({
    receivableId: claimBrunoAnaAccounts.receivable.id,
    walletCId: bruno.wallets.inter.id,
    amount: 20000,
    description: "Recebimento Pix Ingressos Festival de Ana",
    date: "2026-08-17T11:00:00Z",
    reliefCategory: {
      categoryId: brunoCatLazer.id,
      amount: 20000,
    },
    onusCategory: {
      categoryId: ana.categories.catLazer.id,
      amount: 20000,
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
  };
}

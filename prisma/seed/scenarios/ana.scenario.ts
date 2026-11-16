import {
  BalanceType,
  CycleFrequency,
  EntryType,
  MovementDirection,
} from "../../generated/prisma/enums";
import type { SystemSeedFactory } from "../core/system.factory";

export async function seedAnaScenario(factory: SystemSeedFactory) {
  console.log(
    "🚀 Populando cenário da Ana (Carteiras, Árvore de Subcategorias 2 Níveis, Contratos, Ciclos e Transações)..."
  );

  const { party, space } = await factory.createUser({
    name: "Ana Souza",
    email: "ana@teste.com",
    birthDate: "1994-03-12",
    phone: "53991110001",
    defaultContextName: "Finanças da Ana",
  });

  // =========================================================================
  // 1. CARTEIRAS (6 carteiras cobrindo todos os cenários de UI)
  // =========================================================================
  const [
    nubank,          // Carteira Principal
    itau,            // Conta Secundária
    reservaSelic,    // Reserva / Investimentos (RESERVE)
    carteiraFisica,  // Dinheiro em espécie
    ricoCorretora,   // Carteira Vazia (R$ 0,00 -> Empty State)
    santanderAntigo, // Carteira Arquivada e com saldo negativo
  ] = await space.addWallets([
    {
      name: "Conta Nubank",
      createdAt: "2025-01-10T10:00:00Z",
      initialBalance: { amount: 150000, date: "2026-08-01T09:00:00Z" },
    },
    {
      name: "Conta Itaú Uniclass",
      createdAt: "2025-02-15T14:00:00Z",
      initialBalance: { amount: 320000, date: "2026-08-01T09:30:00Z" },
    },
    {
      name: "Reserva de Emergência (Selic)",
      type: BalanceType.RESERVE,
      createdAt: "2025-03-20T11:00:00Z",
      initialBalance: { amount: 1200000, date: "2026-08-01T10:00:00Z" },
    },
    {
      name: "Carteira Física (Dinheiro)",
      createdAt: "2025-06-01T08:00:00Z",
      initialBalance: { amount: 25000, date: "2026-08-05T12:00:00Z" },
    },
    {
      name: "Rico Corretora",
      createdAt: "2026-01-10T16:00:00Z",
    },
    {
      name: "Conta Santander Antiga",
      createdAt: "2024-05-01T08:00:00Z",
      isArchived: true,
      initialBalance: {
        amount: 4500,
        direction: MovementDirection.DEBIT,
        date: "2026-07-10T10:00:00Z",
      },
    },
  ]);

  // =========================================================================
  // 2. ÁRVORE DE CATEGORIAS (2 Níveis: Categoria Pai -> Subcategoria Folha)
  // Regra: Apenas 1 nível de subcategorias; TODAS as Entries e Agreements apontam para `sub.*`.
  // =========================================================================
  const { roots: rootCategories, sub: subCategories } = await space.addCategoryTree([
    {
      name: "Salário & Renda",
      appearance: { icon: "wallet", color: "emerald" },
      subcategories: [
        { key: "salarioClt", name: "Salário Mensal CLT" },
        { key: "freelance", name: "Freelance & Consultoria" },
        { key: "dividendosRendimentos", name: "Dividendos & Rendimentos" },
        { key: "restituicaoReembolsos", name: "Restituições & Reembolsos" },
      ],
    },
    {
      name: "Alimentação & Mercado",
      appearance: { icon: "utensils", color: "orange" },
      subcategories: [
        { key: "supermercado", name: "Supermercado & Feira" },
        { key: "restaurantes", name: "Restaurantes & Bistrôs" },
        { key: "deliveryPadaria", name: "Delivery, Padaria & Cafés" },
      ],
    },
    {
      name: "Moradia & Contas",
      appearance: { icon: "house", color: "sky" },
      subcategories: [
        { key: "aluguel", name: "Aluguel & Encargos" },
        { key: "condominio", name: "Condomínio Residencial" },
        { key: "energiaGas", name: "Energia Elétrica & Gás" },
        { key: "aguaSaneamento", name: "Água & Saneamento" },
      ],
    },
    {
      name: "Transporte & Combustível",
      appearance: { icon: "car", color: "amber" },
      subcategories: [
        { key: "combustivel", name: "Combustível & Abastecimento" },
        { key: "uberTransporte", name: "Uber & Transporte Urbano" },
        { key: "estacionamentoPedagio", name: "Estacionamento & Pedágio" },
        { key: "ipvaSeguroAuto", name: "IPVA, Seguro & Licenciamento" },
      ],
    },
    {
      name: "Lazer & Estilo de Vida",
      appearance: { icon: "party-popper", color: "violet" },
      subcategories: [
        { key: "cinemaShows", name: "Cinema, Shows & Eventos" },
        { key: "viagensPassagens", name: "Viagens & Passagens" },
        { key: "comprasHobbies", name: "Compras, Livros & Eletrônicos" },
        // Caso de Borda: Subcategoria arquivada com histórico passado
        { key: "jogosArquivada", name: "Jogos & Steam (Arquivada)", isArchived: true },
      ],
    },
    {
      name: "Saúde & Farmácia",
      appearance: { icon: "heart-pulse", color: "rose" },
      subcategories: [
        { key: "planoSaude", name: "Plano de Saúde" },
        { key: "farmacia", name: "Farmácia & Medicamentos" },
        { key: "academiaFitness", name: "Academia & Personal" },
      ],
    },
    {
      name: "Assinaturas & Serviços",
      appearance: { icon: "tv", color: "indigo" },
      subcategories: [
        { key: "internetFibra", name: "Internet Fibra & Telefonia" },
        { key: "streamingApps", name: "Streaming & Apple Services" },
        { key: "clubesAssinatura", name: "Clubes de Assinatura" },
      ],
    },
    {
      // Fallback 1: Categoria Pai e Subcategorias SEM appearance cadastrada (icon null, color null)
      name: "Pets & Veterinário",
      subcategories: [
        { key: "racaoPetshop", name: "Ração & Pet Shop", appearance: undefined },
        { key: "veterinarioVacinas", name: "Consultas Veterinárias & Vacinas", appearance: undefined },
      ],
    },
    {
      // Fallback 2: Categoria COM ícone inexistente no Lucide para exercitar fallback visual na UI
      name: "Educação & Cursos",
      appearance: { icon: "icone-que-nao-existe", color: "teal" },
      subcategories: [
        {
          key: "cursosIdiomas",
          name: "Cursos Online & Idiomas",
          appearance: { icon: "icone-que-nao-existe", color: "teal" },
        },
        {
          key: "livrosTecnicos",
          name: "Livros Técnicos & Certificações",
          appearance: { icon: "icone-que-nao-existe", color: "teal" },
        },
      ],
    },
  ]);

  // =========================================================================
  // 3. CONTRATOS E OBRIGAÇÕES RECORRENTES (PAYABLE/RECEIVABLE + AGREEMENT + RULES)
  // Regra: Todos os agreements (exceto repasses) apontam para uma SUBCATEGORIA padrão.
  // =========================================================================
  const [
    contratoAluguel,
    contratoEnergia,
    contratoInternet,
    contratoUnimed,
    contratoIpvaAnual,
    contratoInglesEncerrado,
    contratoFreelance,
    contratoDividendos,
    contratoCondominio,
    contratoAcademia,
    contratoAguaCorsan,
    contratoGeekBoxDia31,
  ] = await space.addCommitmentAgreements([
    {
      // Caso 1: Contrato com linha do tempo completa (PAST, CURRENT e FUTURE agendada) e histórico de reajustes
      name: "Aluguel Apartamento",
      categoryId: subCategories.aluguel.id,
      startsAt: "2025-01-01",
      amountEntries: [
        { amount: 250000, effectiveAt: "2025-01-01", reason: "Valor Inicial do Contrato" },
        { amount: 30000, effectiveAt: "2026-01-01", reason: "Reajuste Anual IGPM (12%)" },
        { amount: 20000, effectiveAt: "2027-01-01", reason: "Reajuste Contratual Previsto" },
      ],
      rules: [
        { effectiveFrom: "2025-01-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 10 }, // PAST
        { effectiveFrom: "2026-05-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 5 },  // CURRENT
        { effectiveFrom: "2026-12-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 8 },  // FUTURE
      ],
    },
    {
      // Caso 2: Contrato de Concessionária (Com dia de fechamento/leitura e vencimento)
      name: "Conta de Energia CEEE Equatorial",
      categoryId: subCategories.energiaGas.id,
      amount: 21500,
      startsAt: "2025-03-01",
      rules: [
        { effectiveFrom: "2025-03-01", frequency: CycleFrequency.MONTHLY, closingDay: 3, dueDay: 10 },
      ],
    },
    {
      // Caso 3: Assinatura / Fibra
      name: "Internet Fibra 600Mb",
      categoryId: subCategories.internetFibra.id,
      amount: 12990,
      startsAt: "2025-06-01",
      rules: [
        { effectiveFrom: "2025-06-01", frequency: CycleFrequency.MONTHLY, closingDay: 5, dueDay: 12 },
      ],
    },
    {
      // Caso 4: Plano de Saúde pago via Itaú (Testa quitação integral em Set e parcial em Out)
      name: "Plano de Saúde Unimed",
      categoryId: subCategories.planoSaude.id,
      amount: 68000,
      startsAt: "2025-01-01",
      rules: [
        { effectiveFrom: "2025-01-01", frequency: CycleFrequency.MONTHLY, closingDay: 1, dueDay: 10 },
      ],
    },
    {
      // Caso 5: Obrigação de Frequência Anual (YEARLY)
      name: "IPVA & Licenciamento Anual",
      categoryId: subCategories.ipvaSeguroAuto.id,
      amount: 89300,
      startsAt: "2025-01-01",
      rules: [
        { effectiveFrom: "2025-01-01", frequency: CycleFrequency.YEARLY, interval: 1, closingDay: null, dueDay: 20 },
      ],
    },
    {
      // Caso 6: Contrato Encerrado (endsAt no passado -> testa filtro de inativos/encerrados)
      name: "Curso de Inglês Britânico",
      categoryId: subCategories.cursosIdiomas.id,
      amount: 25000,
      startsAt: "2025-02-01",
      endsAt: "2026-07-31",
      includeInProjection: false,
      rules: [
        { effectiveFrom: "2025-02-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 15 },
      ],
    },
    {
      // Caso 7: Recebimento Recorrente (RECEIVABLE)
      name: "Freelance Mensal - Agência XYZ",
      categoryId: subCategories.freelance.id,
      amount: 180000,
      balanceType: BalanceType.RECEIVABLE,
      startsAt: "2026-01-01",
      rules: [
        { effectiveFrom: "2026-01-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 20 },
      ],
    },
    {
      // Caso 8: Recebimento Anual (RECEIVABLE)
      name: "Dividendos Empresa Familiar",
      categoryId: subCategories.dividendosRendimentos.id,
      amount: 1500000,
      balanceType: BalanceType.RECEIVABLE,
      startsAt: "2025-01-01",
      rules: [
        { effectiveFrom: "2025-01-01", frequency: CycleFrequency.YEARLY, interval: 1, closingDay: null, dueDay: 15 },
      ],
    },
    {
      // Caso 9: Condomínio Residencial - Usado para testar status OVERDUE (Setembro sem pagamento)
      name: "Condomínio Edifício Solar das Flores",
      categoryId: subCategories.condominio.id,
      amount: 45000,
      startsAt: "2026-06-01",
      rules: [
        { effectiveFrom: "2026-06-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 25 },
      ],
    },
    {
      // Caso 10: Academia & Bem-Estar - Usado para testar múltiplas subcategorias no mesmo ciclo (multiple)
      name: "Academia Smart Fit Club",
      categoryId: subCategories.academiaFitness.id,
      amount: 14990,
      startsAt: "2026-08-01",
      rules: [
        { effectiveFrom: "2026-08-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 15 },
      ],
    },
    {
      // Caso 11 (Novo Caso de Borda): Pagamento a maior (OVERPAID) gerando crédito no contrato
      name: "Água & Saneamento CORSAN",
      categoryId: subCategories.aguaSaneamento.id,
      amount: 8500,
      startsAt: "2026-01-01",
      rules: [
        { effectiveFrom: "2026-01-01", frequency: CycleFrequency.MONTHLY, closingDay: 5, dueDay: 18 },
      ],
    },
    {
      // Caso 12 (Novo Caso de Borda): Regra com vencimento no dia 31 (Clamping em Fev/Abr/Jun/Set/Nov)
      name: "Clube de Assinatura Geek Box",
      categoryId: subCategories.clubesAssinatura.id,
      amount: 9990,
      startsAt: "2026-01-31",
      rules: [
        { effectiveFrom: "2026-01-31", frequency: CycleFrequency.MONTHLY, closingDay: 20, dueDay: 31 },
      ],
    },
  ]);

  // =========================================================================
  // 4. TRANSAÇÕES E CICLOS DE OBRIGAÇÕES (Ago a Out/2026 + Casos de Borda)
  // =========================================================================

  // Caso de Borda: Compra histórica em subcategoria hoje arquivada
  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.jogosArquivada.id,
    description: "Steam Summer Sale - Baldur's Gate 3 (Subcategoria Arquivada)",
    amount: 19990,
    direction: MovementDirection.DEBIT,
    date: "2026-07-20T18:00:00Z",
  });

  // Cenários de teste de carteira para subcategorias especiais (Split -> multiple, Fallbacks)
  await space.addSplitDirectEntry({
    balanceId: nubank.id,
    splits: [
      { categoryId: subCategories.supermercado.id, amount: 8000 },
      { categoryId: subCategories.racaoPetshop.id, amount: 4500 },
    ],
    description: "Mercado & Pet Shop Express (Split)",
    direction: MovementDirection.DEBIT,
    date: "2026-08-02T14:30:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.veterinarioVacinas.id,
    description: "Consulta Veterinária - Vacinação (Sem Appearance)",
    amount: 18000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-03T11:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.cursosIdiomas.id,
    description: "Curso Online de TypeScript Avançado (Ícone Inválido)",
    amount: 25000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-04T16:15:00Z",
  });

  // Ciclo Academia Agosto: dois ACCRUAL com subcategorias diferentes na mesma competência + SETTLEMENT -> multiple
  await space.addAccrual({
    commitmentBalanceId: contratoAcademia.id,
    categoryBalanceId: subCategories.academiaFitness.id,
    description: "Mensalidade Academia (Provisão Inicial - Saúde)",
    amount: 9990,
    dueDate: "2026-08-15T08:00:00Z",
    competanceDate: "2026-08-15T00:00:00Z",
  });
  await space.addAccrual({
    commitmentBalanceId: contratoAcademia.id,
    categoryBalanceId: subCategories.cinemaShows.id,
    description: "Evento Aulão Especial (Provisão Adicional - Lazer)",
    amount: 5000,
    dueDate: "2026-08-15T08:00:00Z",
    competanceDate: "2026-08-15T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoAcademia.id,
    description: "Pagamento Academia Smart Fit (Agosto)",
    amount: 14990,
    dueDate: "2026-08-15T10:00:00Z",
    competanceDate: "2026-08-15T00:00:00Z",
  });

  // --- AGOSTO / 2026 ---
  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.salarioClt.id,
    description: "Salário Mensal - Tech Corp (Agosto)",
    amount: 850000,
    direction: MovementDirection.CREDIT,
    type: EntryType.DIRECT,
    date: "2026-08-05T10:00:00Z",
  });

  // Ciclo Aluguel Agosto: ACCRUAL + SETTLEMENT (Quitado)
  await space.addAccrual({
    commitmentBalanceId: contratoAluguel.id,
    categoryBalanceId: subCategories.aluguel.id,
    description: "Provisão Aluguel Apartamento (08/2026)",
    amount: 280000,
    dueDate: "2026-08-05T08:00:00Z",
    competanceDate: "2026-08-05T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoAluguel.id,
    description: "Aluguel Apartamento (Agosto)",
    amount: 280000,
    dueDate: "2026-08-06T14:20:00Z",
    competanceDate: "2026-08-05T00:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.supermercado.id,
    description: "Supermercado Carrefour - Compra Mensal",
    amount: 64250,
    direction: MovementDirection.DEBIT,
    date: "2026-08-08T18:30:00Z",
  });

  // Ciclo Energia Agosto: ACCRUAL + SETTLEMENT (Quitado)
  await space.addAccrual({
    commitmentBalanceId: contratoEnergia.id,
    categoryBalanceId: subCategories.energiaGas.id,
    description: "Fatura Energia CEEE (08/2026)",
    amount: 18940,
    dueDate: "2026-08-10T08:00:00Z",
    competanceDate: "2026-08-03T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoEnergia.id,
    description: "Conta de Energia CEEE Equatorial",
    amount: 18940,
    dueDate: "2026-08-10T11:15:00Z",
    competanceDate: "2026-08-03T00:00:00Z",
  });

  // Ciclo Internet Agosto: ACCRUAL + SETTLEMENT (Quitado)
  await space.addAccrual({
    commitmentBalanceId: contratoInternet.id,
    categoryBalanceId: subCategories.internetFibra.id,
    description: "Fatura Internet Fibra (08/2026)",
    amount: 12990,
    dueDate: "2026-08-12T08:00:00Z",
    competanceDate: "2026-08-05T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoInternet.id,
    description: "Internet Fibra 600Mb",
    amount: 12990,
    dueDate: "2026-08-12T09:00:00Z",
    competanceDate: "2026-08-05T00:00:00Z",
  });

  await space.addTransfer({
    fromBalanceId: nubank.id,
    toBalanceId: reservaSelic.id,
    description: "Aporte Mensal Reserva de Emergência",
    amount: 150000,
    date: "2026-08-15T15:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.cinemaShows.id,
    description: "Cinema Cinemark + Pipoca",
    amount: 9400,
    direction: MovementDirection.DEBIT,
    date: "2026-08-18T20:30:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.combustivel.id,
    description: "Posto Ipiranga - Abastecimento Completo",
    amount: 24500,
    direction: MovementDirection.DEBIT,
    date: "2026-08-21T17:45:00Z",
  });

  const cobrancaDuplicadaAgo = await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.streamingApps.id,
    description: "Cobrança Duplicada - Apple Services",
    amount: 4990,
    direction: MovementDirection.DEBIT,
    date: "2026-08-24T13:10:00Z",
  });
  await space.reverseEntry({
    originalEntryId: cobrancaDuplicadaAgo.id,
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.streamingApps.id,
    description: "Estorno Cobrança Duplicada - Apple Services",
    amount: 4990,
    originalDirection: MovementDirection.DEBIT,
    date: "2026-08-25T10:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.deliveryPadaria.id,
    description: "iFood - Sushi Delivery",
    amount: 13800,
    direction: MovementDirection.DEBIT,
    date: "2026-08-28T21:15:00Z",
  });

  // --- SETEMBRO / 2026 ---
  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.dividendosRendimentos.id,
    description: "Dividendos FIIs (MXRF11 e HGLG11)",
    amount: 16450,
    direction: MovementDirection.CREDIT,
    date: "2026-09-02T11:30:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.salarioClt.id,
    description: "Salário Mensal - Tech Corp (Setembro)",
    amount: 850000,
    direction: MovementDirection.CREDIT,
    date: "2026-09-04T10:00:00Z",
  });

  // Ciclo Aluguel Setembro: ACCRUAL + SETTLEMENT (Quitado)
  await space.addAccrual({
    commitmentBalanceId: contratoAluguel.id,
    categoryBalanceId: subCategories.aluguel.id,
    description: "Provisão Aluguel Apartamento (09/2026)",
    amount: 280000,
    dueDate: "2026-09-05T08:00:00Z",
    competanceDate: "2026-09-05T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoAluguel.id,
    description: "Aluguel Apartamento (Setembro)",
    amount: 280000,
    dueDate: "2026-09-05T14:00:00Z",
    competanceDate: "2026-09-05T00:00:00Z",
  });

  // Ciclo Energia Setembro: ACCRUAL + SETTLEMENT (Quitado)
  await space.addAccrual({
    commitmentBalanceId: contratoEnergia.id,
    categoryBalanceId: subCategories.energiaGas.id,
    description: "Fatura Energia CEEE (09/2026)",
    amount: 21500,
    dueDate: "2026-09-10T08:00:00Z",
    competanceDate: "2026-09-03T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoEnergia.id,
    description: "Conta de Energia CEEE Equatorial (Setembro)",
    amount: 21500,
    dueDate: "2026-09-10T10:30:00Z",
    competanceDate: "2026-09-03T00:00:00Z",
  });

  // Ciclo Unimed Setembro (Pago pelo Itaú)
  await space.addAccrual({
    commitmentBalanceId: contratoUnimed.id,
    categoryBalanceId: subCategories.planoSaude.id,
    description: "Mensalidade Unimed (09/2026)",
    amount: 68000,
    dueDate: "2026-09-10T08:00:00Z",
    competanceDate: "2026-09-01T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: itau.id,
    commitmentBalanceId: contratoUnimed.id,
    description: "Plano de Saúde Unimed",
    amount: 68000,
    dueDate: "2026-09-10T10:00:00Z",
    competanceDate: "2026-09-01T00:00:00Z",
  });

  // Caso de Borda (OVERPAID): Água CORSAN Setembro (Provisão R$ 85,00, Pago R$ 100,00)
  await space.addAccrual({
    commitmentBalanceId: contratoAguaCorsan.id,
    categoryBalanceId: subCategories.aguaSaneamento.id,
    description: "Fatura Água CORSAN (09/2026)",
    amount: 8500,
    dueDate: "2026-09-18T08:00:00Z",
    competanceDate: "2026-09-05T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoAguaCorsan.id,
    description: "Pagamento Água CORSAN (Pago a Maior R$ 100,00)",
    amount: 10000,
    dueDate: "2026-09-18T11:00:00Z",
    competanceDate: "2026-09-05T00:00:00Z",
  });

  // Ciclo Condomínio Setembro: APENAS ACCRUAL sem pagamento (Gera status OVERDUE)
  await space.addAccrual({
    commitmentBalanceId: contratoCondominio.id,
    categoryBalanceId: subCategories.condominio.id,
    description: "Taxa Condominial Solar das Flores (09/2026)",
    amount: 45000,
    dueDate: "2026-09-25T08:00:00Z",
    competanceDate: "2026-09-25T00:00:00Z",
  });

  // Caso de Borda (Clamping dia 31 -> 30/09): Geek Box Setembro
  await space.addAccrual({
    commitmentBalanceId: contratoGeekBoxDia31.id,
    categoryBalanceId: subCategories.clubesAssinatura.id,
    description: "Mensalidade Geek Box (09/2026 - Clamping Dia 30)",
    amount: 9990,
    dueDate: "2026-09-30T08:00:00Z",
    competanceDate: "2026-09-20T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoGeekBoxDia31.id,
    description: "Pagamento Geek Box (Setembro)",
    amount: 9990,
    dueDate: "2026-09-30T14:00:00Z",
    competanceDate: "2026-09-20T00:00:00Z",
  });

  await space.addTransfer({
    fromBalanceId: nubank.id,
    toBalanceId: carteiraFisica.id,
    description: "Saque Banco24Horas para Carteira Física",
    amount: 20000,
    date: "2026-09-07T16:20:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.deliveryPadaria.id,
    description: "Padaria & Confeitaria Colonial",
    amount: 4680,
    direction: MovementDirection.DEBIT,
    date: "2026-09-10T08:40:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.uberTransporte.id,
    description: "Uber Viagens - Semana",
    amount: 7490,
    direction: MovementDirection.DEBIT,
    date: "2026-09-12T22:10:00Z",
  });

  await space.addTransfer({
    fromBalanceId: itau.id,
    toBalanceId: nubank.id,
    description: "Transferência Pix Recebida - Conta Itaú",
    amount: 50000,
    date: "2026-09-14T19:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.farmacia.id,
    description: "Farmácia Panvel - Medicamentos",
    amount: 11850,
    direction: MovementDirection.DEBIT,
    date: "2026-09-16T12:45:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.streamingApps.id,
    description: "Assinatura Netflix & Spotify Duo",
    amount: 8480,
    direction: MovementDirection.DEBIT,
    date: "2026-09-18T07:30:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.freelance.id,
    description: "Recebimento Freelance UI/UX Design",
    amount: 180000,
    direction: MovementDirection.CREDIT,
    date: "2026-09-20T14:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.combustivel.id,
    description: "Posto Shell - Combustível",
    amount: 21000,
    direction: MovementDirection.DEBIT,
    date: "2026-09-22T17:35:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.dividendosRendimentos.id,
    description: "Rendimento Automático CDI (100% CDI)",
    amount: 9240,
    direction: MovementDirection.CREDIT,
    date: "2026-09-24T08:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    description: "Ajuste de Conciliação Bancária",
    amount: 1520,
    direction: MovementDirection.CREDIT,
    type: EntryType.ADJUSTMENT,
    date: "2026-09-25T18:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.restaurantes.id,
    description: "Restaurante Outback Steakhouse",
    amount: 23450,
    direction: MovementDirection.DEBIT,
    date: "2026-09-27T21:10:00Z",
  });

  const compraFone = await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.comprasHobbies.id,
    description: "Compra Loja FastShop - Fone Bluetooth",
    amount: 38990,
    direction: MovementDirection.DEBIT,
    date: "2026-09-28T16:20:00Z",
  });
  await space.reverseEntry({
    originalEntryId: compraFone.id,
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.comprasHobbies.id,
    description: "Estorno FastShop - Devolução Fone Bluetooth",
    amount: 38990,
    originalDirection: MovementDirection.DEBIT,
    date: "2026-09-29T11:05:00Z",
  });

  // --- OUTUBRO / 2026 ---
  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.salarioClt.id,
    description: "Salário Mensal - Tech Corp (Outubro)",
    amount: 850000,
    direction: MovementDirection.CREDIT,
    date: "2026-10-01T10:00:00Z",
  });

  // Ciclo Aluguel Outubro: ACCRUAL + SETTLEMENT (Quitado antecipadamente dia 02/10)
  await space.addAccrual({
    commitmentBalanceId: contratoAluguel.id,
    categoryBalanceId: subCategories.aluguel.id,
    description: "Provisão Aluguel Apartamento (10/2026)",
    amount: 280000,
    dueDate: "2026-10-05T08:00:00Z",
    competanceDate: "2026-10-05T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: contratoAluguel.id,
    description: "Aluguel Apartamento (Outubro)",
    amount: 280000,
    dueDate: "2026-10-02T14:30:00Z",
    competanceDate: "2026-10-05T00:00:00Z",
  });

  // Lançamento com estorno no ciclo de Outubro
  const taxaExtraAluguel = await space.addAccrual({
    commitmentBalanceId: contratoAluguel.id,
    categoryBalanceId: subCategories.aluguel.id,
    description: "Taxa Extraordinária de Reforma (Lançamento Indevido)",
    amount: 7500,
    dueDate: "2026-10-05T08:00:00Z",
    competanceDate: "2026-10-05T00:00:00Z",
  });
  await space.reverseEntry({
    originalEntryId: taxaExtraAluguel.id,
    balanceId: contratoAluguel.id,
    counterpartBalanceId: subCategories.aluguel.id,
    description: "Estorno Taxa de Reforma - Cancelamento Administradora",
    amount: 7500,
    originalDirection: MovementDirection.DEBIT,
    date: "2026-10-06T11:00:00Z",
    competanceDate: "2026-10-05T00:00:00Z",
  });

  // Ciclo Unimed Outubro: ACCRUAL + SETTLEMENT PARCIAL (Gera status PARTIAL)
  await space.addAccrual({
    commitmentBalanceId: contratoUnimed.id,
    categoryBalanceId: subCategories.planoSaude.id,
    description: "Mensalidade Unimed (10/2026)",
    amount: 68000,
    dueDate: "2026-10-10T08:00:00Z",
    competanceDate: "2026-10-01T00:00:00Z",
  });
  await space.addSettlement({
    walletBalanceId: itau.id,
    commitmentBalanceId: contratoUnimed.id,
    description: "Pagamento Parcial Mensalidade Unimed (50%)",
    amount: 34000,
    dueDate: "2026-10-08T15:30:00Z",
    competanceDate: "2026-10-01T00:00:00Z",
  });

  // Ciclo Energia Outubro: APENAS ACCRUAL (Em aberto)
  await space.addAccrual({
    commitmentBalanceId: contratoEnergia.id,
    categoryBalanceId: subCategories.energiaGas.id,
    description: "Fatura Energia CEEE (10/2026) - Em Aberto",
    amount: 24280,
    dueDate: "2026-10-10T08:00:00Z",
    competanceDate: "2026-10-03T00:00:00Z",
  });

  // Ciclo Internet Outubro: APENAS ACCRUAL (Em aberto)
  await space.addAccrual({
    commitmentBalanceId: contratoInternet.id,
    categoryBalanceId: subCategories.internetFibra.id,
    description: "Fatura Internet Fibra (10/2026) - Em Aberto",
    amount: 12990,
    dueDate: "2026-10-12T08:00:00Z",
    competanceDate: "2026-10-05T00:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: nubank.id,
    counterpartBalanceId: subCategories.supermercado.id,
    description: "Supermercado Pão de Açúcar",
    amount: 45680,
    direction: MovementDirection.DEBIT,
    date: "2026-10-03T19:45:00Z",
  });

  await space.addTransfer({
    fromBalanceId: nubank.id,
    toBalanceId: reservaSelic.id,
    description: "Transferência para Reserva de Emergência",
    amount: 150000,
    date: "2026-10-04T09:15:00Z",
  });

  // =========================================================================
  // 5. TRANSAÇÕES EXTRAS NAS DEMAIS CARTEIRAS (Itaú e Carteira Física)
  // =========================================================================
  await space.addDirectEntry({
    balanceId: itau.id,
    counterpartBalanceId: subCategories.restituicaoReembolsos.id,
    description: "Restituição Imposto de Renda (Lote 4)",
    amount: 142000,
    direction: MovementDirection.CREDIT,
    date: "2026-09-30T09:00:00Z",
  });

  await space.addDirectEntry({
    balanceId: carteiraFisica.id,
    counterpartBalanceId: subCategories.supermercado.id,
    description: "Feira Livre de Domingo (Hortifruti)",
    amount: 8500,
    direction: MovementDirection.DEBIT,
    date: "2026-09-13T10:30:00Z",
  });

  await space.addDirectEntry({
    balanceId: carteiraFisica.id,
    counterpartBalanceId: subCategories.estacionamentoPedagio.id,
    description: "Estacionamento Centro",
    amount: 2000,
    direction: MovementDirection.DEBIT,
    date: "2026-09-20T15:00:00Z",
  });

  // =========================================================================
  // 6. CARTÕES DE CRÉDITO (Com regras versionadas e casos de borda de virada de ano)
  // =========================================================================
  const [cartaoUltravioleta] = await space.addCreditCards([
    {
      name: "Nubank Ultravioleta Mastercard Black",
      limit: 3500000,
      limitEntries: [
        { amount: 2000000, effectiveAt: "2025-01-01", reason: "Limite Inicial Aprovado" },
        { amount: 1500000, effectiveAt: "2026-04-01", reason: "Aumento Automático de Limite" },
      ],
      startsAt: "2025-01-01",
      closingDay: 25, // Regra antiga (PAST)
      dueDay: 1,
      extraRules: [
        { effectiveFrom: "2026-04-01", closingDay: 28, dueDay: 5 },  // Regra anterior
        { effectiveFrom: "2026-11-01", closingDay: 3, dueDay: 10 },  // Regra atual em Nov/2026
      ],
      initialExpenses: [
        // Caso de Borda: Compra em Dez/2025 após o fechamento (dia 25) -> Cai na fatura de Janeiro/2026
        {
          description: "Ceia de Ano Novo & Espumantes (Virada de Ano)",
          amount: 42000,
          date: "2025-12-29T18:00:00Z",
          categoryId: subCategories.supermercado.id,
        },
        // Ciclo Julho/Agosto (29/07 a 28/08) - 13 despesas para garantir paginação (pageSize=10)
        { description: "Café Especial Torra Clara", amount: 2800, date: "2026-07-29T09:00:00Z", categoryId: subCategories.deliveryPadaria.id },
        { description: "Farmácia Panvel - Protetor Solar", amount: 7990, date: "2026-07-30T14:20:00Z", categoryId: subCategories.farmacia.id },
        { description: "Uber - Reunião Externa", amount: 2450, date: "2026-08-01T10:15:00Z", categoryId: subCategories.uberTransporte.id },
        { description: "Livraria Cultura - Livro Clean Code", amount: 8900, date: "2026-08-03T16:30:00Z", categoryId: subCategories.livrosTecnicos.id },
        { description: "Cinema Kinoplex - Ingresso IMAX", amount: 6500, date: "2026-08-05T20:00:00Z", categoryId: subCategories.cinemaShows.id },
        { description: "Almoço Executivo Bistrô", amount: 5400, date: "2026-08-07T12:45:00Z", categoryId: subCategories.restaurantes.id },
        { description: "Posto Shell - Abastecimento", amount: 22000, date: "2026-08-10T17:10:00Z", categoryId: subCategories.combustivel.id },
        { description: "Ração Royal Canin Golden Retriever", amount: 31000, date: "2026-08-12T11:00:00Z", categoryId: subCategories.racaoPetshop.id },
        { description: "Assinatura Spotify Família", amount: 3490, date: "2026-08-15T08:00:00Z", categoryId: subCategories.streamingApps.id },
        { description: "iFood - Pizza Artesanal", amount: 8900, date: "2026-08-18T21:30:00Z", categoryId: subCategories.deliveryPadaria.id },
        { description: "Drogaria São Paulo - Vitaminas", amount: 4500, date: "2026-08-20T15:40:00Z", categoryId: subCategories.farmacia.id },
        { description: "Estacionamento Shopping", amount: 1800, date: "2026-08-22T19:00:00Z", categoryId: subCategories.estacionamentoPedagio.id },
        { description: "Padaria Artesanal Pão & Prosa", amount: 3250, date: "2026-08-25T08:30:00Z", categoryId: subCategories.deliveryPadaria.id },
        // Ciclo Agosto/Setembro (29/08 a 28/09)
        { description: "Supermercado Pão de Açúcar (Agosto)", amount: 135000, date: "2026-08-30T19:45:00Z", categoryId: subCategories.supermercado.id },
        { description: "Posto Ipiranga - Gasolina Aditivada", amount: 19500, date: "2026-09-04T16:45:00Z", categoryId: subCategories.combustivel.id },
        { description: "Uber Viagens - Deslocamento Reunião", amount: 3890, date: "2026-09-05T09:15:00Z", categoryId: subCategories.uberTransporte.id },
        { description: "Restaurante Coco Bambu - Jantar Família", amount: 24500, date: "2026-09-12T20:30:00Z", categoryId: subCategories.restaurantes.id },
        { description: "Droga Raia - Medicamentos & Vitaminas", amount: 6480, date: "2026-09-18T11:20:00Z", categoryId: subCategories.farmacia.id },
        { description: "Amazon Prime - Livros Técnicos", amount: 28900, date: "2026-09-22T14:10:00Z", categoryId: subCategories.comprasHobbies.id },
        // Ciclo Setembro/Outubro (29/09 a 28/10)
        { description: "Supermercado Pão de Açúcar (Setembro)", amount: 142580, date: "2026-09-30T19:45:00Z", categoryId: subCategories.supermercado.id },
        { description: "Amazon Prime - Kindle E-books", amount: 12900, date: "2026-10-02T14:10:00Z", categoryId: subCategories.comprasHobbies.id },
        { description: "Droga Raia - Protetor Solar & Dermocosméticos", amount: 8480, date: "2026-10-03T11:20:00Z", categoryId: subCategories.farmacia.id },
        { description: "Posto Ipiranga - Abastecimento Outubro", amount: 21500, date: "2026-10-04T16:45:00Z", categoryId: subCategories.combustivel.id },
      ],
    },
    {
      name: "Itaú Personnalité Mastercard Black",
      limit: 4000000,
      closingDay: 20,
      dueDay: 28,
      initialExpenses: [
        { description: "Passagens Aéreas LATAM", amount: 221500, date: "2026-09-28T10:15:00Z", categoryId: subCategories.viagensPassagens.id },
      ],
    },
    {
      name: "XP Visa Infinite",
      limit: 5000000,
      closingDay: 15,
      dueDay: 22,
      initialExpenses: [
        { description: "Seguro Auto Anual (Parcela 1)", amount: 89300, date: "2026-09-25T14:20:00Z", categoryId: subCategories.ipvaSeguroAuto.id },
      ],
    },
    {
      name: "C6 Carbon Mastercard Black",
      limit: 2500000,
      closingDay: 10,
      dueDay: 17,
      initialExpenses: [
        { description: "Jantar Restaurante", amount: 32050, date: "2026-09-27T18:00:00Z", categoryId: subCategories.restaurantes.id },
      ],
    },
    {
      name: "Inter Mastercard Black",
      limit: 3000000,
      closingDay: 5,
      dueDay: 12,
    },
    {
      name: "Nubank Gold Antigo",
      limit: 800000,
      closingDay: 28,
      dueDay: 5,
      endsAt: "2026-06-30",
      isArchived: true,
    },
  ]);

  // Despesa no cartão com múltiplas subcategorias (Split de cartão -> kind: multiple)
  await space.addSplitDirectEntry({
    balanceId: cartaoUltravioleta.id,
    splits: [
      { categoryId: subCategories.supermercado.id, amount: 9500 },
      { categoryId: subCategories.cinemaShows.id, amount: 6500 },
    ],
    description: "Empório Gourmet - Vinhos & Queijos (Split Cartão)",
    direction: MovementDirection.DEBIT,
    date: "2026-08-16T18:00:00Z",
  });

  // Despesa no cartão com estorno subsequente (REVERSAL de cartão)
  const compraCartaoEstornada = await space.addDirectEntry({
    balanceId: cartaoUltravioleta.id,
    counterpartBalanceId: subCategories.cinemaShows.id,
    description: "Ingresso Show Internacional - Lote Promocional",
    amount: 32000,
    direction: MovementDirection.DEBIT,
    date: "2026-08-20T14:00:00Z",
  });
  await space.reverseEntry({
    originalEntryId: compraCartaoEstornada.id,
    balanceId: cartaoUltravioleta.id,
    counterpartBalanceId: subCategories.cinemaShows.id,
    description: "Estorno Ingresso Show - Cancelamento Evento",
    amount: 32000,
    originalDirection: MovementDirection.DEBIT,
    date: "2026-08-21T10:00:00Z",
  });

  // Pagamentos de Fatura (SETTLEMENT de saldo CREDIT -> kind: credit-settlement)
  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: cartaoUltravioleta.id,
    description: "Pagamento de Fatura Nubank Ultravioleta (Agosto)",
    amount: 115000,
    dueDate: "2026-09-05T10:00:00Z",
    competanceDate: "2026-08-28T00:00:00Z",
  });

  await space.addSettlement({
    walletBalanceId: nubank.id,
    commitmentBalanceId: cartaoUltravioleta.id,
    description: "Pagamento de Fatura Nubank Ultravioleta (Setembro)",
    amount: 218270,
    dueDate: "2026-10-05T11:30:00Z",
    competanceDate: "2026-09-28T00:00:00Z",
  });

  return {
    party,
    space,
    wallets: { nubank, itau, reservaSelic, carteiraFisica, ricoCorretora, santanderAntigo },
    cards: { cartaoUltravioleta },
    rootCategories,
    subCategories,
    agreements: {
      contratoAluguel,
      contratoEnergia,
      contratoInternet,
      contratoCondominio,
      contratoUnimed,
      contratoAguaCorsan,
      contratoGeekBoxDia31,
    },
  };
}
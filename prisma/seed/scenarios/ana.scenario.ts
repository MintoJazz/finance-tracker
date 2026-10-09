import { CycleFrequency, EntryType, MovementDirection, BalanceType } from "../../generated/prisma/enums";
import type { SystemSeedFactory } from "../core/system.factory";

export async function seedAnaScenario(factory: SystemSeedFactory) {
    console.log("🚀 Populando cenário da Ana (Carteiras, Contratos versionados, Ciclos e Transações)...");
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
        nubank,          // ID 1: Carteira Principal
        itau,            // ID 2: Conta Secundária
        reservaSelic,    // ID 3: Reserva / Investimentos
        carteiraFisica,  // ID 4: Dinheiro em espécie
        ricoCorretora,   // ID 5: Carteira Vazia (R$ 0,00 -> Empty State)
        santanderAntigo, // ID 6: Carteira Arquivada e com saldo negativo
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

    // Categorias para contrapartida contábil
    const catSalario = await space.addCategory("Salário & Renda");
    const catAlimentacao = await space.addCategory("Alimentação & Mercado");
    const catMoradia = await space.addCategory("Moradia & Contas");
    const catTransporte = await space.addCategory("Transporte & Combustível");
    const catLazer = await space.addCategory("Lazer & Assinaturas");
    const catSaude = await space.addCategory("Saúde & Farmácia");

    // =========================================================================
    // 2. CONTRATOS E OBRIGAÇÕES RECORRENTES (COMMITMENT + AGREEMENT + RULES)
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
    ] = await space.addCommitmentAgreements([
        {
            // Caso 1: Contrato com linha do tempo completa (PAST, CURRENT e FUTURE agendada) e histórico de reajustes
            name: "Aluguel Apartamento",
            startsAt: "2025-01-01",
            amountEntries: [
                { amount: 250000, effectiveAt: "2025-01-01", reason: "Valor Inicial do Contrato" },
                { amount: 30000, effectiveAt: "2026-01-01", reason: "Reajuste Anual IGPM (12%)" },
                { amount: 20000, effectiveAt: "2027-01-01", reason: "Reajuste Contratual Previsto" },
            ],
            rules: [
                { effectiveFrom: "2025-01-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 10 }, // PAST
                { effectiveFrom: "2026-05-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 5 },  // CURRENT
                { effectiveFrom: "2026-12-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 8 },  // FUTURE (Agendada)
            ],
        },
        {
            // Caso 2: Contrato de Concessionária (Com dia de fechamento/leitura e vencimento)
            name: "Conta de Energia CEEE Equatorial",
            amount: 21500, // Variável, usando uma média
            startsAt: "2025-03-01",
            rules: [
                { effectiveFrom: "2025-03-01", frequency: CycleFrequency.MONTHLY, closingDay: 3, dueDay: 10 },
            ],
        },
        {
            // Caso 3: Assinatura / Fibra com mudança recente de vencimento
            name: "Internet Fibra 600Mb",
            amount: 12990,
            startsAt: "2025-06-01",
            rules: [
                { effectiveFrom: "2025-06-01", frequency: CycleFrequency.MONTHLY, closingDay: 5, dueDay: 12 },
            ],
        },
        {
            // Caso 4: Plano de Saúde pago via Itaú
            name: "Plano de Saúde Unimed",
            amount: 68000,
            startsAt: "2025-01-01",
            rules: [
                { effectiveFrom: "2025-01-01", frequency: CycleFrequency.MONTHLY, closingDay: 1, dueDay: 10 },
            ],
        },
        {
            // Caso 5: Obrigação de Frequência Anual (YEARLY)
            name: "IPVA & Licenciamento Anual",
            amount: 89300,
            startsAt: "2025-01-01",
            rules: [
                { effectiveFrom: "2025-01-01", frequency: CycleFrequency.YEARLY, interval: 1, closingDay: null, dueDay: 20 },
            ],
        },
        {
            // Caso 6: Contrato Encerrado (endsAt no passado -> testa filtro de inativos/encerrados)
            name: "Curso de Inglês Britânico",
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
            amount: 45000,
            startsAt: "2026-06-01",
            rules: [
                { effectiveFrom: "2026-06-01", frequency: CycleFrequency.MONTHLY, closingDay: null, dueDay: 25 },
            ],
        },
    ]);

    // =========================================================================
    // 3. TRANSAÇÕES E CICLOS DE OBRIGAÇÕES (Ago a Out/2026)
    // =========================================================================

    // --- AGOSTO / 2026 ---
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Salário Mensal - Tech Corp (Agosto)",
        amount: 850000,
        direction: MovementDirection.CREDIT,
        type: EntryType.DIRECT,
        date: "2026-08-05T10:00:00Z",
    });

    // Ciclo Aluguel Agosto: ACCRUAL + SETTLEMENT (Quitado)
    await space.addAccrual({
        commitmentBalanceId: contratoAluguel.id,
        categoryBalanceId: catMoradia.id,
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
        dueDate: "2026-08-06T14:20:00Z", // Pago 1 dia após o vencimento, mas na competência de Agosto
        competanceDate: "2026-08-05T00:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Supermercado Carrefour - Compra Mensal",
        amount: 64250,
        direction: MovementDirection.DEBIT,
        date: "2026-08-08T18:30:00Z",
    });

    // Ciclo Energia Agosto: ACCRUAL + SETTLEMENT (Quitado)
    await space.addAccrual({
        commitmentBalanceId: contratoEnergia.id,
        categoryBalanceId: catMoradia.id,
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
        categoryBalanceId: catMoradia.id,
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
        counterpartBalanceId: catLazer.id,
        description: "Cinema Cinemark + Pipoca",
        amount: 9400,
        direction: MovementDirection.DEBIT,
        date: "2026-08-18T20:30:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catTransporte.id,
        description: "Posto Ipiranga - Abastecimento Completo",
        amount: 24500,
        direction: MovementDirection.DEBIT,
        date: "2026-08-21T17:45:00Z",
    });

    const cobrancaDuplicadaAgo = await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Cobrança Duplicada - Apple Services",
        amount: 4990,
        direction: MovementDirection.DEBIT,
        date: "2026-08-24T13:10:00Z",
    });
    await space.reverseEntry({
        originalEntryId: cobrancaDuplicadaAgo.id,
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Estorno Cobrança Duplicada - Apple Services",
        amount: 4990,
        originalDirection: MovementDirection.DEBIT,
        date: "2026-08-25T10:00:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "iFood - Sushi Delivery",
        amount: 13800,
        direction: MovementDirection.DEBIT,
        date: "2026-08-28T21:15:00Z",
    });

    // --- SETEMBRO / 2026 ---
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Dividendos FIIs (MXRF11 e HGLG11)",
        amount: 16450,
        direction: MovementDirection.CREDIT,
        date: "2026-09-02T11:30:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Salário Mensal - Tech Corp (Setembro)",
        amount: 850000,
        direction: MovementDirection.CREDIT,
        date: "2026-09-04T10:00:00Z",
    });

    // Ciclo Aluguel Setembro: ACCRUAL + SETTLEMENT (Quitado)
    await space.addAccrual({
        commitmentBalanceId: contratoAluguel.id,
        categoryBalanceId: catMoradia.id,
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
        categoryBalanceId: catMoradia.id,
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
        categoryBalanceId: catSaude.id,
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

    // Ciclo Condomínio Setembro: APENAS ACCRUAL sem pagamento (Gera status OVERDUE no motor pois dueDate já passou!)
    await space.addAccrual({
        commitmentBalanceId: contratoCondominio.id,
        categoryBalanceId: catMoradia.id,
        description: "Taxa Condominial Solar das Flores (09/2026)",
        amount: 45000,
        dueDate: "2026-09-25T08:00:00Z",
        competanceDate: "2026-09-25T00:00:00Z",
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
        counterpartBalanceId: catAlimentacao.id,
        description: "Padaria & Confeitaria Colonial",
        amount: 4680,
        direction: MovementDirection.DEBIT,
        date: "2026-09-10T08:40:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catTransporte.id,
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
        counterpartBalanceId: catSaude.id,
        description: "Farmácia Panvel - Medicamentos",
        amount: 11850,
        direction: MovementDirection.DEBIT,
        date: "2026-09-16T12:45:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Assinatura Netflix & Spotify Duo",
        amount: 8480,
        direction: MovementDirection.DEBIT,
        date: "2026-09-18T07:30:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Recebimento Freelance UI/UX Design",
        amount: 180000,
        direction: MovementDirection.CREDIT,
        date: "2026-09-20T14:00:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catTransporte.id,
        description: "Posto Shell - Combustível",
        amount: 21000,
        direction: MovementDirection.DEBIT,
        date: "2026-09-22T17:35:00Z",
    });
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
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
        counterpartBalanceId: catAlimentacao.id,
        description: "Restaurante Outback Steakhouse",
        amount: 23450,
        direction: MovementDirection.DEBIT,
        date: "2026-09-27T21:10:00Z",
    });

    const compraFone = await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Compra Loja FastShop - Fone Bluetooth",
        amount: 38990,
        direction: MovementDirection.DEBIT,
        date: "2026-09-28T16:20:00Z",
    });
    await space.reverseEntry({
        originalEntryId: compraFone.id,
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Estorno FastShop - Devolução Fone Bluetooth",
        amount: 38990,
        originalDirection: MovementDirection.DEBIT,
        date: "2026-09-29T11:05:00Z",
    });

    // --- OUTUBRO / 2026 ---
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Salário Mensal - Tech Corp (Outubro)",
        amount: 850000,
        direction: MovementDirection.CREDIT,
        date: "2026-10-01T10:00:00Z",
    });

    // Ciclo Aluguel Outubro: ACCRUAL + SETTLEMENT (Quitado antecipadamente dia 02/10)
    await space.addAccrual({
        commitmentBalanceId: contratoAluguel.id,
        categoryBalanceId: catMoradia.id,
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

    // Lançamento com estorno no ciclo de Outubro (para testar exibição de estornos no extrato do ciclo)
    const taxaExtraAluguel = await space.addAccrual({
        commitmentBalanceId: contratoAluguel.id,
        categoryBalanceId: catMoradia.id,
        description: "Taxa Extraordinária de Reforma (Lançamento Indevido)",
        amount: 7500,
        dueDate: "2026-10-05T08:00:00Z",
        competanceDate: "2026-10-05T00:00:00Z",
    });
    await space.reverseEntry({
        originalEntryId: taxaExtraAluguel.id,
        balanceId: contratoAluguel.id,
        counterpartBalanceId: catMoradia.id,
        description: "Estorno Taxa de Reforma - Cancelamento Administradora",
        amount: 7500,
        originalDirection: MovementDirection.DEBIT,
        date: "2026-10-06T11:00:00Z",
        competanceDate: "2026-10-05T00:00:00Z",
    });

    // Ciclo Unimed Outubro: ACCRUAL + SETTLEMENT PARCIAL (Gera status PARTIAL no motor e na UI!)
    await space.addAccrual({
        commitmentBalanceId: contratoUnimed.id,
        categoryBalanceId: catSaude.id,
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

    // Ciclo Energia Outubro: APENAS ACCRUAL (Em aberto para testar saldo pendente na UI!)
    await space.addAccrual({
        commitmentBalanceId: contratoEnergia.id,
        categoryBalanceId: catMoradia.id,
        description: "Fatura Energia CEEE (10/2026) - Em Aberto",
        amount: 24280, // R$ 242,80 pendente de pagamento
        dueDate: "2026-10-10T08:00:00Z",
        competanceDate: "2026-10-03T00:00:00Z",
    });

    // Ciclo Internet Outubro: APENAS ACCRUAL (Em aberto!)
    await space.addAccrual({
        commitmentBalanceId: contratoInternet.id,
        categoryBalanceId: catMoradia.id,
        description: "Fatura Internet Fibra (10/2026) - Em Aberto",
        amount: 12990, // R$ 129,90 pendente de pagamento
        dueDate: "2026-10-12T08:00:00Z",
        competanceDate: "2026-10-05T00:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
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
    // 4. TRANSAÇÕES EXTRAS NAS DEMAIS CARTEIRAS (Itaú e Carteira Física)
    // =========================================================================
    await space.addDirectEntry({
        balanceId: itau.id,
        counterpartBalanceId: catSalario.id,
        description: "Restituição Imposto de Renda (Lote 4)",
        amount: 142000,
        direction: MovementDirection.CREDIT,
        date: "2026-09-30T09:00:00Z",
    });
    await space.addDirectEntry({
        balanceId: carteiraFisica.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Feira Livre de Domingo (Hortifruti)",
        amount: 8500,
        direction: MovementDirection.DEBIT,
        date: "2026-09-13T10:30:00Z",
    });
    await space.addDirectEntry({
        balanceId: carteiraFisica.id,
        counterpartBalanceId: catTransporte.id,
        description: "Estacionamento Centro",
        amount: 2000,
        direction: MovementDirection.DEBIT,
        date: "2026-09-20T15:00:00Z",
    });

    // =========================================================================
    // 5. CARTÕES DE CRÉDITO (Com regras versionadas no Ultravioleta)
    // =========================================================================
    await space.addCreditCards([
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
                { effectiveFrom: "2026-04-01", closingDay: 28, dueDay: 5 },  // Regra atual (CURRENT)
                { effectiveFrom: "2026-11-01", closingDay: 3, dueDay: 10 },  // Regra agendada (FUTURE)
            ],
            initialExpenses: [
                { description: "Supermercado Pão de Açúcar", amount: 142580, date: "2026-09-30T19:45:00Z", categoryId: catAlimentacao.id },
                { description: "Amazon Prime - Livros Técnicos", amount: 28900, date: "2026-10-02T14:10:00Z", categoryId: catLazer.id },
                { description: "Droga Raia - Medicamentos & Vitaminas", amount: 6480, date: "2026-10-03T11:20:00Z", categoryId: catSaude.id },
                { description: "Posto Ipiranga - Gasolina Aditivada", amount: 19500, date: "2026-10-04T16:45:00Z", categoryId: catTransporte.id },
                { description: "Uber Viagens - Deslocamento Reunião", amount: 3890, date: "2026-10-05T09:15:00Z", categoryId: catTransporte.id },
                { description: "Restaurante Coco Bambu - Jantar Família", amount: 24500, date: "2026-10-06T20:30:00Z", categoryId: catAlimentacao.id },
            ],
        },
        {
            name: "Itaú Personnalité Mastercard Black",
            limit: 4000000,
            closingDay: 20,
            dueDay: 28,
            initialExpenses: [
                { description: "Passagens Aéreas LATAM", amount: 221500, date: "2026-09-28T10:15:00Z", categoryId: catLazer.id },
            ],
        },
        {
            name: "XP Visa Infinite",
            limit: 5000000,
            closingDay: 15,
            dueDay: 22,
            initialExpenses: [
                { description: "Seguro Auto Anual (Parcela 1)", amount: 89300, date: "2026-09-25T14:20:00Z", categoryId: catTransporte.id },
            ],
        },
        {
            name: "C6 Carbon Mastercard Black",
            limit: 2500000,
            closingDay: 10,
            dueDay: 17,
            initialExpenses: [
                { description: "Jantar Restaurante", amount: 32050, date: "2026-09-27T18:00:00Z", categoryId: catAlimentacao.id },
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

    return { party, space, categories: { catMoradia, catAlimentacao, catLazer, catSaude }, agreements: { contratoAluguel, contratoEnergia, contratoInternet, contratoCondominio, contratoUnimed } };
}
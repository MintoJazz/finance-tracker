import { EntryType, MovementDirection } from "../../generated/prisma/enums";
import type { SystemSeedFactory } from "../core/system.factory";

export async function seedAnaScenario(factory: SystemSeedFactory) {
    console.log("🚀 Populando cenário da Ana (6 carteiras e ~35 transações detalhadas)...");

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
        nubank,          // ID 1: Carteira Principal (muitas transações, paginação e filtros)
        itau,            // ID 2: Conta Secundária (movimentações moderadas e transferências)
        reservaSelic,    // ID 3: Reserva / Investimentos
        carteiraFisica,  // ID 4: Dinheiro em espécie
        ricoCorretora,   // ID 5: Carteira Vazia (R$ 0,00 e sem movimentações -> testa Empty State)
        santanderAntigo, // ID 6: Carteira Arquivada e com saldo negativo
    ] = await space.addWallets([
        {
            name: "Conta Nubank",
            createdAt: "2025-01-10T10:00:00Z",
            initialBalance: { amount: 150000, date: "2026-08-01T09:00:00Z" }, // +R$ 1.500,00 (ADJUSTMENT)
        },
        {
            name: "Conta Itaú Uniclass",
            createdAt: "2025-02-15T14:00:00Z",
            initialBalance: { amount: 320000, date: "2026-08-01T09:30:00Z" }, // +R$ 3.200,00
        },
        {
            name: "Reserva de Emergência (Selic)",
            createdAt: "2025-03-20T11:00:00Z",
            initialBalance: { amount: 1200000, date: "2026-08-01T10:00:00Z" }, // +R$ 12.000,00
        },
        {
            name: "Carteira Física (Dinheiro)",
            createdAt: "2025-06-01T08:00:00Z",
            initialBalance: { amount: 25000, date: "2026-08-05T12:00:00Z" }, // +R$ 250,00
        },
        {
            name: "Rico Corretora",
            createdAt: "2026-01-10T16:00:00Z",
            // Sem saldo inicial -> testa Empty State no perfil!
        },
        {
            name: "Conta Santander Antiga",
            createdAt: "2024-05-01T08:00:00Z",
            isArchived: true,
            initialBalance: {
                amount: 4500,
                direction: MovementDirection.DEBIT,
                date: "2026-07-10T10:00:00Z",
            }, // -R$ 45,00 (Tarifa pendente em conta arquivada)
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
    // 2. TRANSAÇÕES NA CONTA NUBANK (ID 1) — ~28 lançamentos (Ago a Out/2026)
    // =========================================================================

    // --- AGOSTO / 2026 ---
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Salário Mensal - Tech Corp (Agosto)",
        amount: 850000, // +R$ 8.500,00
        direction: MovementDirection.CREDIT,
        type: EntryType.DIRECT,
        date: "2026-08-05T10:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catMoradia.id,
        description: "Aluguel Apartamento (Agosto)",
        amount: 280000, // -R$ 2.800,00
        direction: MovementDirection.DEBIT,
        type: EntryType.SETTLEMENT,
        date: "2026-08-06T14:20:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Supermercado Carrefour - Compra Mensal",
        amount: 64250, // -R$ 642,50
        direction: MovementDirection.DEBIT,
        date: "2026-08-08T18:30:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catMoradia.id,
        description: "Conta de Energia CEEE Equatorial",
        amount: 18940, // -R$ 189,40
        direction: MovementDirection.DEBIT,
        type: EntryType.SETTLEMENT,
        date: "2026-08-10T11:15:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catMoradia.id,
        description: "Internet Fibra 600Mb",
        amount: 12990, // -R$ 129,90
        direction: MovementDirection.DEBIT,
        type: EntryType.SETTLEMENT,
        date: "2026-08-12T09:00:00Z",
    });

    await space.addTransfer({
        fromBalanceId: nubank.id,
        toBalanceId: reservaSelic.id,
        description: "Aporte Mensal Reserva de Emergência",
        amount: 150000, // -R$ 1.500,00 no Nubank / +R$ 1.500,00 na Reserva
        date: "2026-08-15T15:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Cinema Cinemark + Pipoca",
        amount: 9400, // -R$ 94,00
        direction: MovementDirection.DEBIT,
        date: "2026-08-18T20:30:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catTransporte.id,
        description: "Posto Ipiranga - Abastecimento Completo",
        amount: 24500, // -R$ 245,00
        direction: MovementDirection.DEBIT,
        date: "2026-08-21T17:45:00Z",
    });

    // Lançamento que será estornado em Agosto (Cobrança duplicada)
    const cobrancaDuplicadaAgo = await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Cobrança Duplicada - Apple Services",
        amount: 4990, // -R$ 49,90
        direction: MovementDirection.DEBIT,
        date: "2026-08-24T13:10:00Z",
    });

    await space.reverseEntry({
        originalEntryId: cobrancaDuplicadaAgo.id,
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Estorno Cobrança Duplicada - Apple Services",
        amount: 4990, // +R$ 49,90 (REVERSAL)
        originalDirection: MovementDirection.DEBIT,
        date: "2026-08-25T10:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "iFood - Sushi Delivery",
        amount: 13800, // -R$ 138,00
        direction: MovementDirection.DEBIT,
        date: "2026-08-28T21:15:00Z",
    });

    // --- SETEMBRO / 2026 ---
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Dividendos FIIs (MXRF11 e HGLG11)",
        amount: 16450, // +R$ 164,50
        direction: MovementDirection.CREDIT,
        date: "2026-09-02T11:30:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Salário Mensal - Tech Corp (Setembro)",
        amount: 850000, // +R$ 8.500,00
        direction: MovementDirection.CREDIT,
        date: "2026-09-04T10:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catMoradia.id,
        description: "Aluguel Apartamento (Setembro)",
        amount: 280000, // -R$ 2.800,00
        direction: MovementDirection.DEBIT,
        type: EntryType.SETTLEMENT,
        date: "2026-09-05T14:00:00Z",
    });

    await space.addTransfer({
        fromBalanceId: nubank.id,
        toBalanceId: carteiraFisica.id,
        description: "Saque Banco24Horas para Carteira Física",
        amount: 20000, // -R$ 200,00 no Nubank / +R$ 200,00 na Carteira Física
        date: "2026-09-07T16:20:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Padaria & Confeitaria Colonial",
        amount: 4680, // -R$ 46,80
        direction: MovementDirection.DEBIT,
        date: "2026-09-10T08:40:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catTransporte.id,
        description: "Uber Viagens - Semana",
        amount: 7490, // -R$ 74,90
        direction: MovementDirection.DEBIT,
        date: "2026-09-12T22:10:00Z",
    });

    await space.addTransfer({
        fromBalanceId: itau.id,
        toBalanceId: nubank.id,
        description: "Transferência Pix Recebida - Conta Itaú",
        amount: 50000, // +R$ 500,00 no Nubank / -R$ 500,00 no Itaú
        date: "2026-09-14T19:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSaude.id,
        description: "Farmácia Panvel - Medicamentos",
        amount: 11850, // -R$ 118,50
        direction: MovementDirection.DEBIT,
        date: "2026-09-16T12:45:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Assinatura Netflix & Spotify Duo",
        amount: 8480, // -R$ 84,80
        direction: MovementDirection.DEBIT,
        date: "2026-09-18T07:30:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Recebimento Freelance UI/UX Design",
        amount: 180000, // +R$ 1.800,00
        direction: MovementDirection.CREDIT,
        date: "2026-09-20T14:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catTransporte.id,
        description: "Posto Shell - Combustível",
        amount: 21000, // -R$ 210,00
        direction: MovementDirection.DEBIT,
        date: "2026-09-22T17:35:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Rendimento Automático CDI (100% CDI)",
        amount: 9240, // +R$ 92,40
        direction: MovementDirection.CREDIT,
        date: "2026-09-24T08:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        description: "Ajuste de Conciliação Bancária",
        amount: 1520, // +R$ 15,20
        direction: MovementDirection.CREDIT,
        type: EntryType.ADJUSTMENT,
        date: "2026-09-25T18:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Restaurante Outback Steakhouse",
        amount: 23450, // -R$ 234,50
        direction: MovementDirection.DEBIT,
        date: "2026-09-27T21:10:00Z",
    });

    // Compra estornada em Setembro (Fone Bluetooth)
    const compraFone = await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Compra Loja FastShop - Fone Bluetooth",
        amount: 38990, // -R$ 389,90
        direction: MovementDirection.DEBIT,
        date: "2026-09-28T16:20:00Z",
    });

    await space.reverseEntry({
        originalEntryId: compraFone.id,
        balanceId: nubank.id,
        counterpartBalanceId: catLazer.id,
        description: "Estorno FastShop - Devolução Fone Bluetooth",
        amount: 38990, // +R$ 389,90 (REVERSAL)
        originalDirection: MovementDirection.DEBIT,
        date: "2026-09-29T11:05:00Z",
    });

    // --- OUTUBRO / 2026 ---
    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catSalario.id,
        description: "Salário Mensal - Tech Corp (Outubro)",
        amount: 850000, // +R$ 8.500,00
        direction: MovementDirection.CREDIT,
        date: "2026-10-01T10:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catMoradia.id,
        description: "Aluguel Apartamento (Outubro)",
        amount: 280000, // -R$ 2.800,00
        direction: MovementDirection.DEBIT,
        type: EntryType.SETTLEMENT,
        date: "2026-10-02T14:30:00Z",
    });

    await space.addDirectEntry({
        balanceId: nubank.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Supermercado Pão de Açúcar",
        amount: 45680, // -R$ 456,80
        direction: MovementDirection.DEBIT,
        date: "2026-10-03T19:45:00Z",
    });

    await space.addTransfer({
        fromBalanceId: nubank.id,
        toBalanceId: reservaSelic.id,
        description: "Transferência para Reserva de Emergência",
        amount: 150000, // -R$ 1.500,00
        date: "2026-10-04T09:15:00Z",
    });

    // =========================================================================
    // 3. TRANSAÇÕES EXTRAS NAS DEMAIS CARTEIRAS (Itaú e Carteira Física)
    // =========================================================================
    await space.addDirectEntry({
        balanceId: itau.id,
        counterpartBalanceId: catSaude.id,
        description: "Plano de Saúde Unimed",
        amount: 68000, // -R$ 680,00
        direction: MovementDirection.DEBIT,
        type: EntryType.SETTLEMENT,
        date: "2026-09-10T10:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: itau.id,
        counterpartBalanceId: catSalario.id,
        description: "Restituição Imposto de Renda (Lote 4)",
        amount: 142000, // +R$ 1.420,00
        direction: MovementDirection.CREDIT,
        date: "2026-09-30T09:00:00Z",
    });

    await space.addDirectEntry({
        balanceId: carteiraFisica.id,
        counterpartBalanceId: catAlimentacao.id,
        description: "Feira Livre de Domingo (Hortifruti)",
        amount: 8500, // -R$ 85,00
        direction: MovementDirection.DEBIT,
        date: "2026-09-13T10:30:00Z",
    });

    await space.addDirectEntry({
        balanceId: carteiraFisica.id,
        counterpartBalanceId: catTransporte.id,
        description: "Estacionamento Centro",
        amount: 2000, // -R$ 20,00
        direction: MovementDirection.DEBIT,
        date: "2026-09-20T15:00:00Z",
    });

    // =========================================================================
    // 4. CARTÕES DE CRÉDITO (Enxugados para 6 cartões realistas)
    // =========================================================================
    await space.addCreditCards([
        {
            name: "Nubank Ultravioleta Mastercard Black",
            limit: 3500000,
            closingDay: 28,
            dueDay: 5,
            initialExpenses: [
                { description: "Supermercado Pão de Açúcar", amount: 142580, date: "2026-09-30T19:45:00Z", categoryId: catAlimentacao.id },
                { description: "Amazon Prime - Livros Técnicos", amount: 28900, date: "2026-10-02T14:10:00Z", categoryId: catLazer.id },
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
            isArchived: true,
        },
    ]);

    return { party, space };
}
import { CycleDetail } from "../../models/cycle-detail.schema";
import { CycleRange } from "../../models/cycle-primitives.schema";
import { MovementEntryScope } from "@/modules/movements/models/movement-entry.schema";

/**
 * 1. Cenário das Imagens do Usuário: Parcela 12 de 24 (Contrato parcialmente pago)
 */
export const MOCK_CONTRACT_CYCLE_PARTIAL: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Outubro 2026 · Parcela 12 de 24 do plano anual",
    from: "2026-09-29",
    to: "2026-10-28",
    dueDate: "2026-11-05",
    closingDate: "2026-10-28",
    status: "PARTIAL",
    isOverdue: false,
    totalAmount: 1234567890, // R$ 12.345.678,90
    paidAmount: 823045260,   // R$ 8.230.452,60
    remainingAmount: 411522630, // R$ 4.115.226,30
    movementsCount: 8,
    amounts: {
        total: 1234567890,
        paid: 823045260,
        transferred: 0,
        remaining: 411522630,
    },
    prev: { from: "2026-08-29", to: "2026-09-28" },
    next: { from: "2026-10-29", to: "2026-11-28" },
    hasReceipt: true,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
    rule: {
        label: "Mensal, vence todo dia 05",
        effectiveFrom: "2025-11-05",
    },
};

/**
 * 2. Cenário Contrato Vencido (OVERDUE): Parcela 11 de 24 (sem pagamento)
 */
export const MOCK_CONTRACT_CYCLE_OVERDUE: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Setembro 2026 · Parcela 11 de 24 do plano anual",
    from: "2026-08-29",
    to: "2026-09-28",
    dueDate: "2026-10-05",
    closingDate: "2026-09-28",
    status: "OVERDUE",
    isOverdue: true,
    totalAmount: 1234567890,
    paidAmount: 0,
    remainingAmount: 1234567890,
    movementsCount: 1,
    amounts: {
        total: 1234567890,
        paid: 0,
        transferred: 0,
        remaining: 1234567890,
    },
    prev: { from: "2026-07-29", to: "2026-08-28" },
    next: { from: "2026-09-29", to: "2026-10-28" },
    hasReceipt: false,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
    rule: {
        label: "Mensal, vence todo dia 05",
        effectiveFrom: "2025-11-05",
    },
};

/**
 * 3. Cenário Contrato Projetado (PROJECTED): Parcela 13 de 24 (sem lançamentos consolidados)
 */
export const MOCK_CONTRACT_CYCLE_PROJECTED: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Novembro 2026 · Parcela 13 de 24 do plano anual",
    from: "2026-10-29",
    to: "2026-11-28",
    dueDate: "2026-12-05",
    closingDate: "2026-11-28",
    status: "PROJECTED",
    isOverdue: false,
    totalAmount: 1234567890,
    paidAmount: 0,
    remainingAmount: 1234567890,
    movementsCount: 0,
    amounts: {
        total: 1234567890,
        paid: 0,
        transferred: 0,
        remaining: 1234567890,
    },
    prev: { from: "2026-09-29", to: "2026-10-28" },
    next: { from: "2026-11-29", to: "2026-12-28" },
    hasReceipt: false,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
    rule: {
        label: "Mensal, vence todo dia 05",
        effectiveFrom: "2025-11-05",
    },
};

/**
 * 4. Cenário Contrato Totalmente Liquidado (PAID): Parcela 10 de 24
 */
export const MOCK_CONTRACT_CYCLE_PAID: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Agosto 2026 · Parcela 10 de 24 do plano anual",
    from: "2026-07-29",
    to: "2026-08-28",
    dueDate: "2026-09-05",
    closingDate: "2026-08-28",
    status: "PAID",
    isOverdue: false,
    totalAmount: 1234567890,
    paidAmount: 1234567890,
    remainingAmount: 0,
    movementsCount: 4,
    settlementDate: "2026-09-04",
    amounts: {
        total: 1234567890,
        paid: 1234567890,
        transferred: 0,
        remaining: 0,
    },
    prev: { from: "2026-06-29", to: "2026-07-28" },
    next: { from: "2026-08-29", to: "2026-09-28" },
    hasReceipt: true,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
};

/**
 * 5. Cenário Contrato com Cessão/Rolagem de Dívida (TRANSFERRED): Parcela 9 de 24
 */
export const MOCK_CONTRACT_CYCLE_TRANSFERRED: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Julho 2026 · Renegociação / Cessão de Dívida",
    from: "2026-06-29",
    to: "2026-07-28",
    dueDate: "2026-08-05",
    closingDate: "2026-07-28",
    status: "TRANSFERRED",
    isOverdue: false,
    totalAmount: 1234567890,
    paidAmount: 234567890,
    remainingAmount: 0,
    movementsCount: 3,
    amounts: {
        total: 1234567890,
        paid: 234567890,
        transferred: 1000000000,
        remaining: 0,
    },
    prev: { from: "2026-05-29", to: "2026-06-28" },
    next: { from: "2026-07-29", to: "2026-08-28" },
    hasReceipt: true,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
};

/**
 * 6. Cenário Fatura de Cartão Aberta (OPEN): Fatura Outubro 2026
 */
export const MOCK_CARD_CYCLE_OPEN: CycleDetail = {
    balanceId: 20,
    balanceName: "Nubank Ultravioleta",
    balanceType: "CREDIT",
    label: "Fatura Outubro 2026",
    from: "2026-09-28",
    to: "2026-10-27",
    dueDate: "2026-11-04",
    closingDate: "2026-10-27",
    status: "OPEN",
    isOverdue: false,
    totalAmount: 456890, // R$ 4.568,90
    paidAmount: 0,
    remainingAmount: 456890,
    movementsCount: 14,
    amounts: {
        total: 456890,
        paid: 0,
        transferred: 0,
        remaining: 456890,
    },
    prev: { from: "2026-08-28", to: "2026-09-27" },
    next: { from: "2026-10-28", to: "2026-11-27" },
    hasReceipt: false,
    source: {
        balanceId: 20,
        kind: "CARD",
        name: "Nubank Ultravioleta",
    },
    rule: {
        label: "Fecha dia 27, vence dia 04",
        effectiveFrom: "2025-01-01",
    },
};

/**
 * 7. Cenário Fatura de Cartão Fechada (PENDING): Fatura Setembro 2026
 */
export const MOCK_CARD_CYCLE_PENDING: CycleDetail = {
    balanceId: 20,
    balanceName: "Nubank Ultravioleta",
    balanceType: "CREDIT",
    label: "Fatura Setembro 2026",
    from: "2026-08-28",
    to: "2026-09-27",
    dueDate: "2026-10-04",
    closingDate: "2026-09-27",
    status: "PENDING",
    isOverdue: false,
    totalAmount: 389050, // R$ 3.890,50
    paidAmount: 0,
    remainingAmount: 389050,
    movementsCount: 12,
    amounts: {
        total: 389050,
        paid: 0,
        transferred: 0,
        remaining: 389050,
    },
    prev: { from: "2026-07-28", to: "2026-08-27" },
    next: { from: "2026-09-28", to: "2026-10-27" },
    hasReceipt: false,
    source: {
        balanceId: 20,
        kind: "CARD",
        name: "Nubank Ultravioleta",
    },
};

/**
 * 8. Cenário Fatura de Cartão Paga (PAID): Fatura Agosto 2026
 */
export const MOCK_CARD_CYCLE_PAID: CycleDetail = {
    balanceId: 20,
    balanceName: "Nubank Ultravioleta",
    balanceType: "CREDIT",
    label: "Fatura Agosto 2026",
    from: "2026-07-28",
    to: "2026-08-27",
    dueDate: "2026-09-04",
    closingDate: "2026-08-27",
    status: "PAID",
    isOverdue: false,
    totalAmount: 521000, // R$ 5.210,00
    paidAmount: 521000,
    remainingAmount: 0,
    movementsCount: 19,
    settlementDate: "2026-09-02",
    amounts: {
        total: 521000,
        paid: 521000,
        transferred: 0,
        remaining: 0,
    },
    prev: { from: "2026-06-28", to: "2026-07-27" },
    next: { from: "2026-08-28", to: "2026-09-27" },
    hasReceipt: true,
    source: {
        balanceId: 20,
        kind: "CARD",
        name: "Nubank Ultravioleta",
    },
};

/**
 * 9. Cenário Primeiro Ciclo da Vida do Contrato (sem anterior - prev: null)
 */
export const MOCK_CONTRACT_CYCLE_FIRST: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Novembro 2025 · Parcela 1 de 24 do plano anual",
    from: "2025-10-29",
    to: "2025-11-28",
    dueDate: "2025-12-05",
    closingDate: "2025-11-28",
    status: "PAID",
    isOverdue: false,
    totalAmount: 1234567890,
    paidAmount: 1234567890,
    remainingAmount: 0,
    movementsCount: 2,
    amounts: {
        total: 1234567890,
        paid: 1234567890,
        transferred: 0,
        remaining: 0,
    },
    prev: null, // Primeiro ciclo! Botão `<` fica desabilitado
    next: { from: "2025-11-29", to: "2025-12-28" },
    hasReceipt: true,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
};

/**
 * 10. Cenário Último Ciclo do Contrato (sem posterior - next: null)
 */
export const MOCK_CONTRACT_CYCLE_LAST: CycleDetail = {
    balanceId: 10,
    contractId: 10,
    balanceName: "Plano Anual - Assinatura Corporativa",
    balanceType: "COMMITMENT",
    label: "Outubro 2027 · Parcela 24 de 24 do plano anual",
    from: "2027-09-29",
    to: "2027-10-28",
    dueDate: "2027-11-05",
    closingDate: "2027-10-28",
    status: "PROJECTED",
    isOverdue: false,
    totalAmount: 1234567890,
    paidAmount: 0,
    remainingAmount: 1234567890,
    movementsCount: 0,
    amounts: {
        total: 1234567890,
        paid: 0,
        transferred: 0,
        remaining: 1234567890,
    },
    prev: { from: "2027-08-29", to: "2027-09-28" },
    next: null, // Último ciclo! Botão `>` fica desabilitado
    hasReceipt: false,
    source: {
        balanceId: 10,
        kind: "CONTRACT",
        name: "Plano Anual - Assinatura Corporativa",
    },
};

/**
 * 11. Cenário Fatura de Cartão Vencida (OVERDUE): Fatura Julho 2026
 */
export const MOCK_CARD_CYCLE_OVERDUE: CycleDetail = {
    balanceId: 20,
    balanceName: "Nubank Ultravioleta",
    balanceType: "CREDIT",
    label: "Fatura Julho 2026",
    from: "2026-06-28",
    to: "2026-07-27",
    dueDate: "2026-08-04",
    closingDate: "2026-07-27",
    status: "OVERDUE",
    isOverdue: true,
    totalAmount: 189000, // R$ 1.890,00
    paidAmount: 0,
    remainingAmount: 189000,
    movementsCount: 5,
    amounts: {
        total: 189000,
        paid: 0,
        transferred: 0,
        remaining: 189000,
    },
    prev: { from: "2026-05-28", to: "2026-06-27" },
    next: { from: "2026-07-28", to: "2026-08-27" },
    hasReceipt: false,
    source: {
        balanceId: 20,
        kind: "CARD",
        name: "Nubank Ultravioleta",
    },
};

/**
 * 12. Cenário Fatura de Cartão Zerada (sem movimentações no mês)
 */
export const MOCK_CARD_CYCLE_ZERO: CycleDetail = {
    balanceId: 20,
    balanceName: "Nubank Ultravioleta",
    balanceType: "CREDIT",
    label: "Fatura Maio 2026",
    from: "2026-04-28",
    to: "2026-05-27",
    dueDate: "2026-06-04",
    closingDate: "2026-05-27",
    status: "OPEN",
    isOverdue: false,
    totalAmount: 0,
    paidAmount: 0,
    remainingAmount: 0,
    movementsCount: 0,
    amounts: {
        total: 0,
        paid: 0,
        transferred: 0,
        remaining: 0,
    },
    prev: { from: "2026-03-28", to: "2026-04-27" },
    next: { from: "2026-05-28", to: "2026-06-27" },
    hasReceipt: false,
    source: {
        balanceId: 20,
        kind: "CARD",
        name: "Nubank Ultravioleta",
    },
};

/**
 * 13. Cenário Ciclo de Contrato de Recebível (RECEIVABLE): Aluguel Imóvel Comercial
 */
export const MOCK_CONTRACT_CYCLE_RECEIVABLE: CycleDetail = {
    balanceId: 30,
    contractId: 30,
    balanceName: "Aluguel Sala Comercial 402",
    balanceType: "RECEIVABLE",
    label: "Outubro 2026 · Parcela 06 de 12 (Recebimento de Aluguel)",
    from: "2026-10-01",
    to: "2026-10-31",
    dueDate: "2026-11-10",
    closingDate: "2026-10-31",
    status: "OPEN",
    isOverdue: false,
    totalAmount: 350000, // R$ 3.500,00
    paidAmount: 0,
    remainingAmount: 350000,
    movementsCount: 1,
    amounts: {
        total: 350000,
        paid: 0,
        transferred: 0,
        remaining: 350000,
    },
    prev: { from: "2026-09-01", to: "2026-09-30" },
    next: { from: "2026-11-01", to: "2026-11-30" },
    hasReceipt: false,
    source: {
        balanceId: 30,
        kind: "CONTRACT",
        name: "Aluguel Sala Comercial 402",
    },
    rule: {
        label: "Mensal, vence todo dia 10",
        effectiveFrom: "2026-05-01",
    },
};

/**
 * 14. Cenário Ciclo Semanal de Prestação de Serviço (WEEKLY)
 */
export const MOCK_CONTRACT_CYCLE_WEEKLY: CycleDetail = {
    balanceId: 40,
    contractId: 40,
    balanceName: "Consultoria Técnica Semanal",
    balanceType: "PAYABLE",
    label: "Semana 42 · 12/10 a 18/10/2026",
    from: "2026-10-12",
    to: "2026-10-18",
    dueDate: "2026-10-23",
    closingDate: "2026-10-18",
    status: "PAID",
    isOverdue: false,
    totalAmount: 150000, // R$ 1.500,00
    paidAmount: 150000,
    remainingAmount: 0,
    movementsCount: 2,
    settlementDate: "2026-10-22",
    amounts: {
        total: 150000,
        paid: 150000,
        transferred: 0,
        remaining: 0,
    },
    prev: { from: "2026-10-05", to: "2026-10-11" },
    next: { from: "2026-10-19", to: "2026-10-25" },
    hasReceipt: true,
    source: {
        balanceId: 40,
        kind: "CONTRACT",
        name: "Consultoria Técnica Semanal",
    },
    rule: {
        label: "Semanal, fecha domingo, vence sexta",
        effectiveFrom: "2026-01-01",
    },
};

export const ALL_MOCK_CYCLE_DETAILS: CycleDetail[] = [
    MOCK_CONTRACT_CYCLE_PARTIAL,
    MOCK_CONTRACT_CYCLE_OVERDUE,
    MOCK_CONTRACT_CYCLE_PROJECTED,
    MOCK_CONTRACT_CYCLE_PAID,
    MOCK_CONTRACT_CYCLE_TRANSFERRED,
    MOCK_CONTRACT_CYCLE_FIRST,
    MOCK_CONTRACT_CYCLE_LAST,
    MOCK_CARD_CYCLE_OPEN,
    MOCK_CARD_CYCLE_PENDING,
    MOCK_CARD_CYCLE_PAID,
    MOCK_CARD_CYCLE_OVERDUE,
    MOCK_CARD_CYCLE_ZERO,
    MOCK_CONTRACT_CYCLE_RECEIVABLE,
    MOCK_CONTRACT_CYCLE_WEEKLY,
];

/**
 * Helper para resolver dinamicamente o detalhe do ciclo para qualquer range e escopo
 */
export function resolveMockCycleDetail(
    balanceId: number,
    range: CycleRange,
    scope?: MovementEntryScope
): CycleDetail {
    // 1. Tenta encontrar por range exato
    const matched = ALL_MOCK_CYCLE_DETAILS.find(
        (c) => c.from === range.from && c.to === range.to
    );
    if (matched) return matched;

    // 2. Se for CARD ou se não encontrou, usa o template do escopo
    const isCard = scope === "CARD";
    const template = isCard ? MOCK_CARD_CYCLE_OPEN : MOCK_CONTRACT_CYCLE_PARTIAL;

    // Calcula dinamicamente meses anterior e posterior para permitir navegação fluida
    const fromParts = range.from.split("-").map(Number);
    const fromYear = fromParts[0];
    const fromMonth = fromParts[1];
    const fromDay = String(fromParts[2]).padStart(2, "0");

    const toParts = range.to.split("-").map(Number);
    const toYear = toParts[0];
    const toMonth = toParts[1];
    const toDay = String(toParts[2]).padStart(2, "0");

    // Prev
    const prevFromMonth = fromMonth === 1 ? 12 : fromMonth - 1;
    const prevFromYear = fromMonth === 1 ? fromYear - 1 : fromYear;
    const prevToMonth = toMonth === 1 ? 12 : toMonth - 1;
    const prevToYear = toMonth === 1 ? toYear - 1 : toYear;
    const prevRange: CycleRange = {
        from: `${prevFromYear}-${String(prevFromMonth).padStart(2, "0")}-${fromDay}`,
        to: `${prevToYear}-${String(prevToMonth).padStart(2, "0")}-${toDay}`,
    };

    // Next
    const nextFromMonth = fromMonth === 12 ? 1 : fromMonth + 1;
    const nextFromYear = fromMonth === 12 ? fromYear + 1 : fromYear;
    const nextToMonth = toMonth === 12 ? 1 : toMonth + 1;
    const nextToYear = toMonth === 12 ? toYear + 1 : toYear;
    const nextRange: CycleRange = {
        from: `${nextFromYear}-${String(nextFromMonth).padStart(2, "0")}-${fromDay}`,
        to: `${nextToYear}-${String(nextToMonth).padStart(2, "0")}-${toDay}`,
    };

    return {
        ...template,
        balanceId,
        from: range.from,
        to: range.to,
        label: isCard
            ? `Fatura ${range.from.slice(0, 7)}`
            : `Competência ${range.from.slice(0, 7)} · Parcela do contrato`,
        prev: prevRange,
        next: nextRange,
    };
}

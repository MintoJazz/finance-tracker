import { Page } from "@/types/pagination.types";
import { failure, Result, success } from "@/types/result.types";
import {
    GetWalletMovementsDTO,
    WalletMovement,
} from "../../core/schemas/wallet-movement.schema";

const MOCK_CARD_MOVEMENTS: WalletMovement[] = [
    // =========================================================================
    // CICLO NOVEMBRO 2026 (2026-10-28 a 2026-11-27) -> Fatura Futura
    // =========================================================================
    {
        movementId: 401,
        entryId: 901,
        description: "Notebook Dell Inspiron (Parcela 3/10)",
        date: new Date("2026-11-05T10:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 45000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 402,
        entryId: 902,
        description: "Passagens Aéreas LATAM (Parcela 3/4)",
        date: new Date("2026-11-10T14:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 80000,
        isReversed: false,
        hasReceipt: true,
    },

    // =========================================================================
    // CICLO OUTUBRO 2026 (2026-09-28 a 2026-10-27) -> Fatura Atual (OPEN)
    // =========================================================================
    {
        movementId: 301,
        entryId: 801,
        description: "Supermercado Pão de Açúcar",
        date: new Date("2026-10-04T19:30:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 64280,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 302,
        entryId: 802,
        description: "Amazon Prime - Livros Técnicos",
        date: new Date("2026-10-03T15:20:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 28900,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 303,
        entryId: 803,
        description: "Uber Viagens",
        date: new Date("2026-10-03T09:10:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 4890,
        isReversed: false,
        hasReceipt: false,
    },
    {
        movementId: 304,
        entryId: 804,
        description: "iFood - Jantar Japonês",
        date: new Date("2026-10-02T21:45:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 16800,
        isReversed: false,
        hasReceipt: false,
    },
    {
        movementId: 305,
        entryId: 805,
        description: "Posto Shell - Abastecimento",
        date: new Date("2026-10-02T11:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 24500,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 306,
        entryId: 806,
        description: "Passagens Aéreas LATAM (Parcela 2/4)",
        date: new Date("2026-10-01T14:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 80000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 307,
        entryId: 807,
        description: "Notebook Dell Inspiron (Parcela 2/10)",
        date: new Date("2026-10-01T10:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 45000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 308,
        entryId: 808,
        description: "Compra Duplicada - Apple Store",
        date: new Date("2026-09-30T16:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 29900,
        isReversed: true,
        hasReceipt: true,
    },
    {
        movementId: 309,
        entryId: 809,
        description: "Estorno Apple Store",
        date: new Date("2026-09-30T18:30:00.000Z"),
        type: "REVERSAL",
        direction: "CREDIT",
        amount: 29900,
        isReversed: false,
        hasReceipt: false,
    },
    {
        movementId: 310,
        entryId: 810,
        description: "Farmácia Panvel",
        date: new Date("2026-09-29T13:15:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 11520,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 311,
        entryId: 811,
        description: "Assinatura Netflix & Spotify",
        date: new Date("2026-09-28T08:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 8480,
        isReversed: false,
        hasReceipt: false,
    },
    {
        movementId: 312,
        entryId: 812,
        description: "Restaurante Outback Steakhouse",
        date: new Date("2026-09-28T20:40:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 22990,
        isReversed: false,
        hasReceipt: true,
    },

    // =========================================================================
    // CICLO SETEMBRO 2026 (2026-08-28 a 2026-09-27) -> Fatura Fechada (CLOSED)
    // =========================================================================
    {
        movementId: 201,
        entryId: 701,
        description: "Seguro Auto Porto Seguro (À vista)",
        date: new Date("2026-09-20T11:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 245000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 202,
        entryId: 702,
        description: "Passagens Aéreas LATAM (Parcela 1/4)",
        date: new Date("2026-09-10T14:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 80000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 203,
        entryId: 703,
        description: "Notebook Dell Inspiron (Parcela 1/10)",
        date: new Date("2026-09-05T10:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 45000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 204,
        entryId: 704,
        description: "Supermercado Carrefour",
        date: new Date("2026-09-02T18:20:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 92030,
        isReversed: false,
        hasReceipt: true,
    },

    // =========================================================================
    // CICLO AGOSTO 2026 (2026-07-28 a 2026-08-27) -> Fatura Paga (PAID)
    // =========================================================================
    {
        movementId: 101,
        entryId: 601,
        description: "Pagamento de Fatura - Débito em Conta",
        date: new Date("2026-08-26T10:00:00.000Z"),
        type: "INCOME",
        direction: "CREDIT",
        amount: 384590,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 102,
        entryId: 602,
        description: "Mobiliário Escritório Tok&Stok",
        date: new Date("2026-08-14T16:10:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 312000,
        isReversed: false,
        hasReceipt: true,
    },
    {
        movementId: 103,
        entryId: 603,
        description: "Supermercado Atacadão",
        date: new Date("2026-08-03T19:00:00.000Z"),
        type: "EXPENSE",
        direction: "DEBIT",
        amount: 72590,
        isReversed: false,
        hasReceipt: true,
    },
];

export class CardMovementMockService {
    static async getMovements(
        dto: GetWalletMovementsDTO
    ): Promise<Result<Page<WalletMovement>>> {
        await new Promise((resolve) => setTimeout(resolve, 180));

        const { walletId: cardId, pageRequest, filter } = dto;

        if (cardId === 999 || cardId <= 0) {
            return failure("Não foi possível carregar os lançamentos da fatura.");
        }

        // Cartão 2 simula cartão zerado sem compras
        let dataset: WalletMovement[] =
            cardId === 2 ? [] : [...MOCK_CARD_MOVEMENTS];

        if (!filter?.includeReversed) {
            dataset = dataset.filter((item) => !item.isReversed);
        }

        if (filter) {
            const { q, from, to, direction, types } = filter;

            if (q && q.trim().length > 0) {
                const searchLower = q.trim().toLowerCase();
                dataset = dataset.filter((item) =>
                    item.description.toLowerCase().includes(searchLower)
                );
            }

            if (direction) {
                dataset = dataset.filter((item) => item.direction === direction);
            }

            if (types && types.length > 0) {
                dataset = dataset.filter((item) => types.includes(item.type));
            }

            if (from) {
                const fromTime = new Date(`${from}T00:00:00.000Z`).getTime();
                dataset = dataset.filter((item) => item.date.getTime() >= fromTime);
            }

            if (to) {
                const toTime = new Date(`${to}T23:59:59.999Z`).getTime();
                dataset = dataset.filter((item) => item.date.getTime() <= toTime);
            }
        }

        dataset.sort((a, b) => b.date.getTime() - a.date.getTime());

        const total = dataset.length;
        const page = Math.max(1, Number(pageRequest.page) || 1);
        const pageSize = Math.max(1, Number(pageRequest.pageSize) || 10);
        const pageCount = Math.ceil(total / pageSize) || 1;
        const pageIndex = page - 1;
        const skip = pageIndex * pageSize;

        return success({
            data: dataset.slice(skip, skip + pageSize),
            total,
            pageIndex,
            pageSize,
            pageCount,
        });
    }
}
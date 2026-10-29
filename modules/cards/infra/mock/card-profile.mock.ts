import { failure, Result, success } from "@/types/result.types";
import { CardCycleOption, CardProfile } from "../../models/card-profile.schema";

const DEFAULT_CYCLES: CardCycleOption[] = [
    {
        label: "Agosto 2026",
        from: "2026-07-28",
        to: "2026-08-27",
        closingDate: new Date("2026-08-28T00:00:00.000Z"),
        dueDate: new Date("2026-09-05T00:00:00.000Z"),
        status: "PAID",
        invoiceAmount: 384590, // R$ 3.845,90
        paidAmount: 384590,
    },
    {
        label: "Setembro 2026",
        from: "2026-08-28",
        to: "2026-09-27",
        closingDate: new Date("2026-09-28T00:00:00.000Z"),
        dueDate: new Date("2026-10-05T00:00:00.000Z"),
        status: "CLOSED",
        invoiceAmount: 462030, // R$ 4.620,30
        paidAmount: 0,
    },
    {
        label: "Outubro 2026",
        from: "2026-09-28",
        to: "2026-10-27",
        closingDate: new Date("2026-10-28T00:00:00.000Z"),
        dueDate: new Date("2026-11-05T00:00:00.000Z"),
        status: "OPEN",
        invoiceAmount: 294370, // R$ 2.943,70
        paidAmount: 0,
    },
    {
        label: "Novembro 2026",
        from: "2026-10-28",
        to: "2026-11-27",
        closingDate: new Date("2026-11-28T00:00:00.000Z"),
        dueDate: new Date("2026-12-05T00:00:00.000Z"),
        status: "FUTURE",
        invoiceAmount: 125000, // R$ 1.250,00 (Parcelas futuras)
        paidAmount: 0,
    },
];

const MOCK_CARDS: Record<number, CardProfile> = {
    1: {
        id: 1,
        name: "Nubank Ultravioleta Mastercard Black",
        limit: 3500000,          // R$ 35.000,00
        usedLimit: 881400,       // R$ 8.814,00
        availableLimit: 2618600, // R$ 26.186,00
        closingDay: 28,
        dueDay: 5,
        isArchived: false,
        createdAt: new Date("2025-01-15T10:00:00.000Z"),
        cycles: DEFAULT_CYCLES,
    },
    2: {
        id: 2,
        name: "Inter Mastercard Black (Sem Uso)",
        limit: 3000000,
        usedLimit: 0,
        availableLimit: 3000000,
        closingDay: 5,
        dueDay: 12,
        isArchived: false,
        createdAt: new Date("2025-05-10T14:00:00.000Z"),
        cycles: DEFAULT_CYCLES.map((c) => ({
            ...c,
            invoiceAmount: 0,
            paidAmount: 0,
        })),
    },
    3: {
        id: 3,
        name: "Nubank Gold Antigo",
        limit: 800000,
        usedLimit: 120000,
        availableLimit: 680000,
        closingDay: 28,
        dueDay: 5,
        isArchived: true,
        createdAt: new Date("2024-03-01T08:00:00.000Z"),
        cycles: DEFAULT_CYCLES,
    },
};

export class CardProfileMockService {
    static async getProfileById(id: number): Promise<Result<CardProfile>> {
        await new Promise((resolve) => setTimeout(resolve, 150));

        if (id === 999 || id <= 0) {
            return failure("Cartão não encontrado.");
        }

        const profile = MOCK_CARDS[id];
        if (profile) {
            return success({ ...profile, cycles: [...profile.cycles] });
        }

        return success({
            id,
            name: `Cartão #${id}`,
            limit: 2500000,
            usedLimit: 881400,
            availableLimit: 1618600,
            closingDay: 28,
            dueDay: 5,
            isArchived: false,
            createdAt: new Date("2025-02-01T10:00:00.000Z"),
            cycles: [...DEFAULT_CYCLES],
        });
    }
}
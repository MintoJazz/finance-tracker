import { failure, Result, success } from "@/types/result.types";
import { WalletProfile } from "../../models/wallet-profile.schema";

const MOCK_PROFILES: Record<number, WalletProfile> = {
    1: {
        id: 1,
        name: "Carteira Principal",
        currentBalance: 345020, // R$ 3.450,20
        isArchived: false,
        createdAt: new Date("2025-01-10T10:00:00.000Z"),
    },
    2: {
        id: 2,
        name: "Reserva de Emergência",
        currentBalance: 1250000, // R$ 12.500,00
        isArchived: false,
        createdAt: new Date("2025-03-15T14:20:00.000Z"),
    },
    3: {
        id: 3,
        name: "Conta PJ Antiga",
        currentBalance: -45000, // -R$ 450,00
        isArchived: true,
        createdAt: new Date("2024-06-01T08:00:00.000Z"),
    },
};

export class WalletProfileMockService {
    static async getProfileById(id: number): Promise<Result<WalletProfile>> {
        // Simular latência de rede
        await new Promise((resolve) => setTimeout(resolve, 150));

        if (id === 999 || id <= 0) {
            return failure("Carteira não encontrada.");
        }

        const profile = MOCK_PROFILES[id];
        if (profile) {
            return success({ ...profile });
        }

        // Fallback dinâmico para IDs desconhecidos para permitir testes livres
        return success({
            id,
            name: `Carteira #${id}`,
            currentBalance: 100000, // R$ 1.000,00
            isArchived: false,
            createdAt: new Date("2026-01-01T00:00:00.000Z"),
        });
    }
}

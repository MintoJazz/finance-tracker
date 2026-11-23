import { mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type {
    ISpaceAccessProvider,
    SpaceAccessPermissions,
} from "@/modules/space/application/interfaces/space-access-provider.interface";
import { failure, success } from "@/types/result.types";
import type { CardEntity } from "../../models/card.schema";
import type { ICardRepository } from "../interfaces/card-repository.interface";

export const session: SessionPayload = { contextId: 100, partyId: 5 };

export const cardEntity = (overrides: Partial<CardEntity> = {}): CardEntity => ({
    id: 7,
    name: "Nubank",
    contextId: 100,
    isArchived: false,
    ...overrides,
});

interface SetupOptions {
    card?: CardEntity | null;
    permissions?: SpaceAccessPermissions;
    accessError?: string;
    repositoryThrows?: boolean;
}

/** Monta repositório e provider de acesso falsos, registrando cada chamada feita. */
export function setupCardUseCase(options: SetupOptions = {}) {
    const calls: string[] = [];
    const card = "card" in options ? options.card : cardEntity();

    const fail = () => {
        if (options.repositoryThrows) throw new Error("db offline");
    };

    const repository: ICardRepository = {
        create: async (data) => {
            fail();
            calls.push(`create:${data.name}:${data.limit}:${data.closingDay}:${data.dueDay}`);
            return { id: 1, name: data.name };
        },
        findByIdAndContextId: async (id, contextId) => {
            fail();
            calls.push(`find:${id}:${contextId}`);
            return card ?? null;
        },
        update: async (id, contextId, data) => {
            calls.push(`update:${id}:${contextId}:${data.name}`);
            return { id, name: data.name };
        },
        archive: async (id) => {
            calls.push(`archive:${id}`);
            return { id, name: "Nubank" };
        },
        restore: async (id) => {
            calls.push(`restore:${id}`);
            return { id, name: "Nubank" };
        },
    };

    const access: ISpaceAccessProvider = {
        execute: async () =>
            options.accessError
                ? failure(options.accessError)
                : success(
                      options.permissions ?? {
                          canViewBalances: true,
                          canManageBalances: true,
                      }
                  ),
    };

    return { repository, access, calls };
}

/** Silencia console.warn/error esperados durante os cenários de falha. */
export function silenceConsole() {
    mock.method(console, "warn", () => {});
    mock.method(console, "error", () => {});
}

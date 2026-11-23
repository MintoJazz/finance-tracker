import { mock } from "node:test";
import type { SessionPayload } from "@/modules/auth/infra/cryptography/jwt-utils";
import type {
    ISpaceAccessProvider,
    SpaceAccessPermissions,
} from "@/modules/space/application/interfaces/space-access-provider.interface";
import type { Page } from "@/types/pagination.types";
import { failure, success } from "@/types/result.types";
import type { MovementEntry } from "../../models/movement-entry.schema";
import type { IBalanceLookupProvider } from "../interfaces/balance-lookup-provider.interface";
import type { IMovementQueries } from "../interfaces/movement-queries.interface";

export const session: SessionPayload = { contextId: 100, partyId: 5 };
export const pageRequest = { page: 1, pageSize: 10 };

export const emptyPage: Page<MovementEntry> = {
    data: [],
    total: 0,
    pageIndex: 0,
    pageSize: 10,
    pageCount: 0,
};

interface SetupOptions {
    permissions?: SpaceAccessPermissions;
    accessError?: string;
    accessSucceedsWithoutData?: boolean;
    found?: boolean;
    queryThrows?: boolean;
    withCardLookup?: boolean;
}

/** Monta consultas, acesso e lookup falsos, registrando cada chamada. */
export function setupMovements(options: SetupOptions = {}) {
    const calls: string[] = [];

    const queries = {
        listWalletMovementEntries: async (walletId: number) => {
            if (options.queryThrows) throw new Error("db offline");
            calls.push(`wallet-entries:${walletId}`);
            return emptyPage;
        },
        listBalanceMovementEntries: async (balanceId: number, scope: string) => {
            if (options.queryThrows) throw new Error("db offline");
            calls.push(`balance-entries:${balanceId}:${scope}`);
            return emptyPage;
        },
    } as unknown as IMovementQueries;

    const access = {
        execute: async () => {
            if (options.accessError) return failure(options.accessError);
            if (options.accessSucceedsWithoutData) {
                return { success: true, data: undefined } as never;
            }
            return success(
                options.permissions ?? { canViewBalances: true, canManageBalances: false }
            );
        },
    } as ISpaceAccessProvider;

    const found = options.found ?? true;
    const lookup: IBalanceLookupProvider = {
        findWalletById: async (id, contextId) => {
            calls.push(`lookup-wallet:${id}:${contextId}`);
            return found ? { id, name: "Carteira" } : null;
        },
        ...(options.withCardLookup === false
            ? {}
            : {
                  findCardById: async (id: number, contextId: number) => {
                      calls.push(`lookup-card:${id}:${contextId}`);
                      return found ? { id, name: "Nubank" } : null;
                  },
              }),
    };

    return { queries, access, lookup, calls };
}

export function silenceConsole() {
    mock.method(console, "warn", () => {});
    mock.method(console, "error", () => {});
}

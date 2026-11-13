import {
    Movement as PrismaMovement,
    EntryType as PrismaEntryType,
    BalanceType as PrismaBalanceType,
    MovementDirection as PrismaMovementDirection,
} from "@/prisma/generated/prisma/client";
import {
    MovementEntry,
    MovementEntryCounterpartKind,
    MovementEntryScope,
    MovementEntryType,
} from "@/modules/movements/models/movement-entry.schema";
import { MovementCounterpartRegistry } from "../registries/movement-counterpart.registry";
import { MovementEntryTypeResolver } from "../registries/movement-entry-type.registry";

export type MovementWithCounterpart = PrismaMovement & {
    entry: {
        id: number;
        description: string;
        dueDate: Date;
        competanceDate: Date | null;
        type: PrismaEntryType;
        reversedBy: { id: number } | null;
        movements: Array<{
            id: number;
            balanceId: number;
            direction: PrismaMovementDirection;
            amount: number;
            balance: {
                id: number;
                name: string;
                balanceType: PrismaBalanceType;
                appearance: {
                    icon: string | null;
                    color: string | null;
                } | null;
            };
        }>;
    };
};

export class MovementEntryMapper {
    /**
     * Mapeia um lançamento e sua movimentação na perspectiva de uma conta/escopo qualquer.
     */
    static toDomain(
        movement: MovementWithCounterpart,
        scope: MovementEntryScope = "WALLET"
    ): MovementEntry {
        const { entry } = movement;

        const counterpart = MovementCounterpartRegistry.resolveFromMovements(
            entry.movements,
            movement.balanceId
        );

        const type = MovementEntryTypeResolver.resolve(
            scope,
            entry.type,
            movement.direction
        );

        return {
            id: movement.id,
            entryId: entry.id,
            movementId: movement.id,
            date: entry.competanceDate ?? entry.dueDate,
            description: entry.description,
            type,
            direction: movement.direction,
            amount: Math.abs(movement.amount),
            isReversed: entry.reversedBy !== null,
            hasAttachment: false,
            counterpart,
        };
    }

    /**
     * Mapeia um lançamento e sua movimentação na perspectiva de uma carteira
     */
    static toDomainFromWallet(movement: MovementWithCounterpart): MovementEntry {
        return this.toDomain(movement, "WALLET");
    }

    /**
     * Helper de conveniência delegando para o MovementEntryTypeResolver
     */
    static resolveMovementEntryType(
        scope: MovementEntryScope,
        direction: PrismaMovementDirection,
        entryType: PrismaEntryType,
        _counterpartKind?: MovementEntryCounterpartKind
    ): MovementEntryType {
        return MovementEntryTypeResolver.resolve(scope, entryType, direction);
    }
}

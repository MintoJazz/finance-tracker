import {
    EntryType as PrismaEntryType,
    Movement as PrismaMovement,
} from "@/prisma/generated/prisma/client";
import { WalletMovement } from "../../core/schemas/wallet-movement.schema";
import { WalletMovementTypeResolver } from "../../core/policies/wallet-movement-type.registry";

export type MovementWithEntry = PrismaMovement & {
    entry: {
        id: number;
        description: string;
        dueDate: Date;
        competanceDate: Date | null;
        type: PrismaEntryType;
        reversedBy: { id: number } | null;
    };
};

export class WalletMovementMapper {
    static toDomain(movement: MovementWithEntry): WalletMovement {
        const { entry } = movement;

        return {
            movementId: movement.id,
            entryId: movement.entryId,
            description: entry.description,
            date: entry.dueDate,
            type: WalletMovementTypeResolver.resolve(
                entry.type,
                movement.direction
            ),
            direction: movement.direction,
            amount: Math.abs(movement.amount),
            isReversed: entry.reversedBy !== null,
            hasReceipt: false,
        };
    }
}
import {
    EntityHeader,
    EntityHeaderMedia,
    EntityHeaderContent,
    EntityHeaderTitle,
    EntityHeaderDescription,
} from "@/components/entity-header";
import { formatDate } from "@/lib/formatters";
import { cn } from "@/lib/utils";
import { WalletMovement } from "@/modules/ledger/core/schemas/wallet-movement.schema";
import { MovementAmountSpan } from "../movement-amount-span";
import { MOVEMENT_TYPE_UI_CONFIG } from "../../themes/movement-type";

interface WalletMovementActionsDrawerHeaderProps {
    movement: WalletMovement;
}

export function WalletMovementActionsDrawerHeader({
    movement,
}: WalletMovementActionsDrawerHeaderProps) {
    const { description, date, type, direction, amount, isReversed } = movement;
    const config = MOVEMENT_TYPE_UI_CONFIG[type];
    const IconComponent = config.icon;

    return (
        <EntityHeader>
            <EntityHeaderMedia>
                <div
                    className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-md border border-border/60 select-none",
                        config.iconClassName,
                        isReversed && "opacity-60"
                    )}
                >
                    <IconComponent className="size-4" />
                </div>
            </EntityHeaderMedia>
            <EntityHeaderContent>
                <EntityHeaderTitle>{description}</EntityHeaderTitle>
                <EntityHeaderDescription className="flex items-center gap-3 mt-0.5">
                    <MovementAmountSpan
                        amount={amount}
                        direction={direction}
                        isReversed={isReversed}
                    />
                    <span>{formatDate(new Date(date))}</span>
                    {isReversed && <span>Estornada</span>}
                </EntityHeaderDescription>
            </EntityHeaderContent>
        </EntityHeader>
    );
}
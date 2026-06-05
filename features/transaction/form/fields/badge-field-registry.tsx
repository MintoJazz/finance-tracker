import { ReactNode } from "react";
import { SchemaBadgeType } from "../schema/schema-registry";
import { TransactionAddDestinationField, TransactionAddOriginField } from "./to-transfer-field";

export const BADGE_FIELDS: Record<SchemaBadgeType, () => ReactNode> = {
    addOrigin: TransactionAddOriginField,
    addDestination: TransactionAddDestinationField
}
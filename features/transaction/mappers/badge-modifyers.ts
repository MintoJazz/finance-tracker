import { TransactionDetails } from "@/types/database";
import { SchemaBadgeType } from "../form/schema/schema-registry";
import { TransactionFormType } from "../form/schema/types";
import { toTransfer } from "./to-transfer-modifyer";

export const BADGE_MODIFYERS: Record<SchemaBadgeType, (transaction: TransactionDetails, data: TransactionFormType) => TransactionDetails> = {
    addDestination: toTransfer,
    addOrigin: toTransfer
}
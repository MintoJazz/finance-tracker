import { AdaptiveConfig } from "@/components/adaptive"
import { TransactionDetails } from "@/types/database"
import { useTransactionFeatures } from "./hook"
import TransactionDesktopView from "./_views/transaction-desktop-view"
import TransactionMobileView from "./_views/transaction-mobile-view"

export const views: AdaptiveConfig<TransactionDetails[]>["views"] = {
    desktop: {
        hook: useTransactionFeatures,
        View: TransactionDesktopView,
    },
    mobile: {
        hook: useTransactionFeatures,
        View: TransactionMobileView,
    },
}

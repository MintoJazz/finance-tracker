"use client"
import { BucketOption, TransactionDetails } from "@/types/database"
import { useTransactionFeatures } from "../../../features/transaction/hooks/use-transaction-features"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import CreateTransaction from "../../../features/transaction/components/create-transaction-dialog"

import TransactionMobileView from "./transaction-mobile-view"
import TransactionDesktopView from "./transaction-desktop-view"

interface Props {
    transactions: TransactionDetails[]
    buckets: BucketOption[]
}

// Mágica do TypeScript: Inferimos as props direto do retorno do Hook pra não duplicar tipagem
export type TransactionViewProps = Omit<ReturnType<typeof useTransactionFeatures>, "createDialogProps">

export default function TransactionContainer({ transactions, buckets }: Props) {
    // Separa as props do Dialog das props que vão para as Views
    const { createDialogProps, ...viewProps } = useTransactionFeatures(transactions, buckets)
    const isDesktop = useIsDesktop()

    return <div>
        {isDesktop ? (
            <TransactionDesktopView {...viewProps} />
        ) : (
            <TransactionMobileView {...viewProps} />
        )}
        <CreateTransaction {...createDialogProps} />
    </div>

}
"use client"
import { BucketOption, TransactionDetails } from "@/types/database"
import { useTransactionFeatures } from "../hook"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import CreateTransaction from "../../../features/transaction/components/create-transaction-dialog"

import TransactionMobileView from "./transaction-mobile-view"
import TransactionDesktopView from "./transaction-desktop-view"
import { useMounted } from "@/hooks/use-mounted"

interface Props {
    transactions: TransactionDetails[]
    buckets: BucketOption[]
}

export type TransactionViewProps = Omit<ReturnType<typeof useTransactionFeatures>, "createDialogProps">

export default function TransactionViewContainer({ transactions, buckets }: Props) {
    const { createDialogProps, ...viewProps } = useTransactionFeatures(transactions, buckets)
    const isDesktop = useIsDesktop()
    const isMounted = useMounted()

    return <div>
        {isMounted ? (
            isDesktop ? (
                <TransactionDesktopView {...viewProps} />
            ) : (
                <TransactionMobileView {...viewProps} />
            )
        ) : null}
        
        <CreateTransaction {...createDialogProps} />
    </div>

}
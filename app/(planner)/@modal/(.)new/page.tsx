import { RouteModal } from "@/components/route-modal"
import { findAllBucketOptions } from "@/server/bucket/find-bucket-options"
import { CreateTransactionFormContent } from "@/features/transaction/components/create-transaction-form-content"

interface Props {
    searchParams: Promise<{ type?: string }>
}

export default async function InterceptedNewTransactionModal({ searchParams }: Props) {
    const { type } = await searchParams
    const defaultType = type?.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE"
    const buckets = await findAllBucketOptions()

    const title = defaultType === "INCOME" ? "Receber (Nova Receita)" : "Pagar (Nova Despesa)"

    return (
        <RouteModal title={title} description="Insira aqui os dados da nova transação">
            <CreateTransactionFormContent
                buckets={buckets}
                defaultType={defaultType}
            />
        </RouteModal>
    )
}

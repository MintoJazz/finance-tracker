import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { findAllBucketOptions } from "@/server/bucket/find-bucket-options"
import { CreateTransactionFormContent } from "@/features/transaction/components/create-transaction-form-content"

interface Props {
    searchParams: Promise<{ type?: string }>
}

export default async function NewTransactionPage({ searchParams }: Props) {
    const { type } = await searchParams
    const defaultType = type?.toUpperCase() === "INCOME" ? "INCOME" : "EXPENSE"
    const buckets = await findAllBucketOptions()

    const title = defaultType === "INCOME" ? "Receber (Nova Receita)" : "Pagar (Nova Despesa)"

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4 md:p-8">
            <div>
                <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
                    <Link href="/">
                        <ArrowLeft className="size-4" />
                        Voltar para Transações
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>{title}</CardTitle>
                    <CardDescription>
                        Preencha os dados abaixo para registrar uma nova transação.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateTransactionFormContent
                        buckets={buckets}
                        defaultType={defaultType}
                    />
                </CardContent>
            </Card>
        </div>
    )
}

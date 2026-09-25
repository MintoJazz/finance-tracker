import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { findAllUserOptions } from "@/server/user/find-all-user-options"
import { CreateBucketFormContent } from "@/features/buckets/components/create-bucket-form-content"

export default async function NewBucketPage() {
    const users = await findAllUserOptions()

    return (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-4 p-4 md:p-8">
            <div>
                <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
                    <Link href="/buckets">
                        <ArrowLeft className="size-4" />
                        Voltar para Buckets
                    </Link>
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Novo Bucket</CardTitle>
                    <CardDescription>
                        Preencha os dados abaixo para cadastrar um novo bucket.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <CreateBucketFormContent users={users} />
                </CardContent>
            </Card>
        </div>
    )
}

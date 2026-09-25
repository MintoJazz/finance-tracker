import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { findBucketById } from "@/server/bucket/find-bucket-by-id"
import { findAllUserOptions } from "@/server/user/find-all-user-options"
import { UpdateBucketFormContent } from "@/features/buckets/components/update-bucket-form-content"

interface Props {
    params: Promise<{ id: string }>
}

export default async function EditBucketPage({ params }: Props) {
    const { id } = await params
    const [bucket, users] = await Promise.all([
        findBucketById(id).catch(() => null),
        findAllUserOptions(),
    ])

    if (!bucket) {
        notFound()
    }

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
                    <CardTitle>Editar Bucket</CardTitle>
                    <CardDescription>
                        Atualize as informações do bucket &quot;{bucket.name}&quot;.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <UpdateBucketFormContent bucket={bucket} users={users} />
                </CardContent>
            </Card>
        </div>
    )
}

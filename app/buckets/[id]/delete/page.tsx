import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { findBucketById } from "@/server/bucket/find-bucket-by-id"
import { DeleteBucketCard } from "@/features/buckets/components/delete-bucket-card"

interface Props {
    params: Promise<{ id: string }>
}

export default async function DeleteBucketPage({ params }: Props) {
    const { id } = await params
    const bucket = await findBucketById(id).catch(() => null)

    if (!bucket) {
        notFound()
    }

    return (
        <div className="mx-auto flex w-full max-w-lg flex-col gap-4 p-4 md:p-8">
            <div>
                <Button variant="ghost" size="sm" asChild className="gap-2 text-muted-foreground">
                    <Link href="/buckets">
                        <ArrowLeft className="size-4" />
                        Voltar para Buckets
                    </Link>
                </Button>
            </div>

            <DeleteBucketCard
                bucket={{
                    id: bucket.id,
                    name: bucket.name,
                }}
            />
        </div>
    )
}

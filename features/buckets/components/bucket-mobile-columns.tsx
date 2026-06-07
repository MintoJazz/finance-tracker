import { ColumnDef } from "@tanstack/react-table";
import { BucketRow } from "../hooks/use-bucket-features";
import { ItemActions, ItemContent, ItemDescription, ItemMedia, ItemTitle } from "@/components/ui/item";
import { formatarDinheiro } from "@/lib/formatters";
import BucketMenu from "./bucket-menu";
import { BUCKET_TYPE_THEMES } from "../themes/bucket-type";

export const mobileBucketColums: ColumnDef<BucketRow>[] = [
    {
        id: "row",
        accessorFn: (row) => row.bucket.id,
        cell: ({ row }) => {
            const Icon = BUCKET_TYPE_THEMES[row.original.bucket.type]

            return <div className="flex gap-2">
                <ItemMedia variant="image" className="border bg-background">
                    <Icon />
                </ItemMedia>
                <ItemContent>
                    <ItemTitle>{row.original.bucket.name}</ItemTitle>
                    <ItemDescription>{row.original.bucket.user.name}</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <p className="text-xs font-black tracking-tight">{formatarDinheiro(row.original.bucket.balance)}</p>
                    <BucketMenu actions={row.original.actions} bucket={row.original.bucket} />
                </ItemActions>
            </div>
        }
    }
]
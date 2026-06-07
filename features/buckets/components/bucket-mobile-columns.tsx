import { ColumnDef } from "@tanstack/react-table";
import { BucketRow } from "../hooks/use-bucket-features";
import { ItemActions, ItemContent, ItemDescription, ItemMedia } from "@/components/ui/item";
import { formatarDinheiro } from "@/lib/formatters";
import { BUCKET_TYPE_THEMES } from "../themes/bucket-type";
import BucketMenu from "./bucket-menu";

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
                <ItemContent className="w-0 min-w-0 flex-1">
                    <p className="truncate text-[15px] font-semibold leading-tight text-foreground">{row.original.bucket.name}</p>
                    <ItemDescription>{row.original.bucket.user.name}</ItemDescription>
                </ItemContent>
                <ItemActions>
                    <p className="text-xs font-black tracking-tight">{formatarDinheiro(row.original.bucket.balance)}</p>
                </ItemActions>
            </div>
        },
        meta: { className: "w-full" }
    },
    {
        id: "actions",
        cell: ({ row }) => <BucketMenu actions={row.original.actions} bucket={row.original.bucket} />
    }
]
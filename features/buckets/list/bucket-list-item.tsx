import { ActionsMenu } from "@/components/actions-menu"
import { BucketType } from "@/generated/prisma/enums"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"
import { BUCKET_CARD_THEMES } from "../themes/bucket-type"
import { BucketList } from "@/types/database"
import { RowAction } from "@/components/ui/data-table"

interface Props {
    bucket: BucketList
    actions: RowAction<BucketList>[]
}

export default function BucketListItem({ bucket, actions }: Props) {
    const meta = BUCKET_CARD_THEMES[bucket.type as BucketType]
    const Icon = meta.icon

    return (
        <li
            key={bucket.id}
            className={cn(
                "flex items-center gap-3 p-3",
                //   bucket.archived && "text-muted-foreground",
            )}
        >
            <span
                className={cn(
                    "flex size-9 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground [&_svg]:size-4",
                    // bucket.archived && "opacity-60",
                )}
            >
                <Icon />
            </span>

            <div className="flex min-w-0 flex-1 flex-col gap-1">
                <div className="flex items-center gap-2">
                    <span
                        className={cn(
                            "truncate font-medium text-foreground",
                            // bucket.archived && "text-muted-foreground",
                        )}
                    >
                        {bucket.name}
                    </span>
                    {/* {bucket.archived && (
                                <Badge variant="outline" className="shrink-0 text-muted-foreground">
                                    Arquivado
                                </Badge>
                                )} */}
                </div>
                <span className="text-xs text-muted-foreground">{meta.label}</span>
            </div>

            <span
                className={cn(
                    "shrink-0 font-mono text-sm font-medium tabular-nums",
                    bucket.balance < 0 ? "text-destructive" : "text-foreground",
                    // bucket.archived && "text-muted-foreground",
                )}
            >
                {formatMoney(bucket.balance)}
            </span>

            <ActionsMenu
                actions={actions}
                data={bucket}
            />
        </li>
    )
}
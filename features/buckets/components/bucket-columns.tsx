"use client"

import type { ColumnDef } from "@tanstack/react-table"

import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { DataTableColumnHeader } from "@/components/ui/data-table"
import { BUCKET_CARD_THEMES } from "../themes/bucket-type"
import { BucketType } from "@/generated/prisma/enums"
import { BucketList } from "@/types/database"
import { formatMoney } from "@/lib/formatters"

export const BUCKET_COLUMN_LABELS: Record<string, string> = {
    name: "Nome",
    type: "Tipo",
    balance: "Saldo",
}

export const bucketColumns: ColumnDef<BucketList>[] = [
    {
        id: "name",
        accessorFn: (bucket) => bucket.name,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Nome" />,
        enableHiding: false,
        cell: ({ row }) => {
            const bucket = row.original
            const meta = BUCKET_CARD_THEMES[bucket.type as BucketType]
            const Icon = meta.icon
            return (
                <div className="flex items-center gap-3">
                    <span
                        className={cn(
                            "flex size-8 shrink-0 items-center justify-center rounded-md border bg-muted/40 text-muted-foreground [&_svg]:size-4",
                            //   bucket.archived && "opacity-60",
                        )}
                    >
                        <Icon />
                    </span>
                    <div className="flex items-center gap-2">
                        <span
                            className={cn(
                                "font-medium text-foreground",
                                // bucket.archived && "text-muted-foreground",
                            )}
                        >
                            {bucket.name}
                        </span>
                        {/* {bucket.archived && (
                        <Badge variant="outline" className="text-muted-foreground">
                            Arquivado
                        </Badge>
                        )} */}
                    </div>
                </div>
            )
        },
    },
    {
        id: "type",
        accessorFn: (bucket) => bucket.type,
        header: ({ column }) => <DataTableColumnHeader column={column} title="Tipo" />,
        cell: ({ row }) => {
            const meta = BUCKET_CARD_THEMES[row.original.type]
            const Icon = meta.icon
            return (
                <Badge variant="secondary" className="gap-1.5 font-normal">
                    <Icon />
                    {meta.label}
                </Badge>
            )
        },
    },
    {
        id: "balance",
        accessorFn: (bucket) => bucket.balance,
        header: ({ column }) => (
            <DataTableColumnHeader
                column={column}
                title="Saldo"
                className="text-right"
            />
        ),
        meta: { className: "text-right" },
        cell: ({ row }) => <span
            className={cn(
                "font-mono tabular-nums",
                row.original.balance < 0 ? "text-destructive" : "text-foreground",
                // row.original.archived && "text-muted-foreground",
            )}
        >
            {formatMoney(row.original.balance)}
        </span>
    },
]

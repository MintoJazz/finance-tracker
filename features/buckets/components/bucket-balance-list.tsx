"use client"

import { useState } from "react"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { BucketBalance } from "@/types/database"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Item, ItemContent, ItemTitle, ItemDescription } from "@/components/ui/item"
import { Separator } from "@/components/ui/separator"
import { formatMoney } from "@/lib/formatters"
import { cn } from "@/lib/utils"

interface Props {
    buckets: BucketBalance[]
}

export default function BucketBalanceList({ buckets }: Props) {
    const isDesktop = useIsDesktop()
    const [selected, setSelected] = useState<BucketBalance | null>(null)

    return (
        <>
            {isDesktop
                ? <BalanceVerticalList buckets={buckets} onSelect={setSelected} />
                : <BalanceChipList buckets={buckets} onSelect={setSelected} />
            }

            <BucketStatementModal
                bucket={selected}
                onClose={() => setSelected(null)}
            />
        </>
    )
}

// ── Shared ────────────────────────────────────────────────────────────────────

interface ListProps {
    buckets: BucketBalance[]
    onSelect: (bucket: BucketBalance) => void
}

function balanceColor(amount: number) {
    if (amount > 0) return "text-emerald-600 dark:text-emerald-400"
    if (amount < 0) return "text-rose-600 dark:text-rose-400"
    return "text-muted-foreground"
}

// ── Desktop: lista vertical ───────────────────────────────────────────────────

function BalanceVerticalList({ buckets, onSelect }: ListProps) {
    return (
        <div className="rounded-lg border overflow-hidden h-full flex flex-col">
            <p className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide border-b shrink-0">
                Saldos afetados
            </p>
            {buckets.map((bucket, i) => (
                <button
                    key={bucket.id}
                    onClick={() => onSelect(bucket)}
                    className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/50 transition-colors",
                        i < buckets.length - 1 && "border-b"
                    )}
                >
                    <span className="text-muted-foreground truncate">{bucket.name}</span>
                    <span className={cn("font-medium font-mono tabular-nums shrink-0 ml-4", balanceColor(bucket.balance))}>
                        {formatMoney(bucket.balance)}
                    </span>
                </button>
            ))}
        </div>
    )
}

// ── Mobile: chips horizontais ─────────────────────────────────────────────────

function BalanceChipList({ buckets, onSelect }: ListProps) {
    return (
        <div className="relative">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-0.5">
                {buckets.map((bucket) => (
                    <Badge
                        key={bucket.id}
                        variant="outline"
                        onClick={() => onSelect(bucket)}
                        className={cn(
                            "cursor-pointer gap-1.5 h-auto py-1 px-2.5 shrink-0",
                            bucket.balance > 0 && "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/30",
                            bucket.balance < 0 && "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/30",
                            bucket.balance === 0 && "text-muted-foreground"
                        )}
                    >
                        <span>{bucket.name}</span>
                        <span className="font-mono tabular-nums">{formatMoney(bucket.balance)}</span>
                    </Badge>
                ))}
            </div>
            <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
        </div>
    )
}

// ── Modal de extrato ──────────────────────────────────────────────────────────

interface ModalProps {
    bucket: BucketBalance | null
    onClose: () => void
}

function BucketStatementModal({ bucket, onClose }: ModalProps) {
    const total = bucket?.movements.reduce((acc, m) => acc + m.amount, 0) ?? 0

    return (
        <Dialog open={!!bucket} onOpenChange={(open) => !open && onClose()}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{bucket?.name}</DialogTitle>
                </DialogHeader>

                <div className="flex flex-col gap-1">
                    {bucket?.movements.map((movement) => (
                        <Item key={movement.id} variant="muted" size="sm">
                            <ItemContent>
                                <ItemTitle>{movement.role}</ItemTitle>
                                <ItemDescription>Movimentação #{movement.id}</ItemDescription>
                            </ItemContent>
                            <span className={cn("font-mono text-sm tabular-nums shrink-0", balanceColor(movement.amount))}>
                                {formatMoney(movement.amount)}
                            </span>
                        </Item>
                    ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center text-sm px-1">
                    <span className="text-muted-foreground">Impacto total</span>
                    <span className={cn("font-mono font-medium tabular-nums", balanceColor(total))}>
                        {formatMoney(total)}
                    </span>
                </div>
            </DialogContent>
        </Dialog>
    )
}
"use client"
import { TransactionViewProps } from "./transaction-view-container"
import BucketBalanceList from "@/features/buckets/components/bucket-balance-list"
import DateRangeFilter from "@/components/date-range-filter"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group"
import { Minus, Plus, SlidersHorizontal, Search, X } from "lucide-react"
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet"
import TransactionList from "@/features/transaction/components/list/transaction-list"
import { useTransactionList } from "@/features/transaction/hooks/use-transaction-list"

export default function TransactionMobileView(props: TransactionViewProps) {
    const {
        date, setDate,
        onAddClick, onSubmit, 
        balanceListProps, hasDraft,
        actions, onStatusChange, transactions,
        onSelect, selected, selectAll
    } = props
    const { clearSelection, filter, selectionMode, setFilter } = useTransactionList(selected, selectAll)

    const listProps = { actions, selected, onStatusChange, transactions, onSelect }

    return (
        <div className="flex flex-col min-h-0">

            {/* ── Header sticky ── */}
            <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border flex flex-col gap-2 px-4 py-2">

                {/* Linha 1: período + busca */}
                <div className="flex items-center gap-2">
                    <div className="w-32 shrink-0">
                        <DateRangeFilter date={date} setDate={setDate} />
                    </div>
                    <InputGroup className="flex-1">
                        <InputGroupAddon align="inline-start">
                            <Search size={13} className="text-muted-foreground" />
                        </InputGroupAddon>
                        <InputGroupInput
                            placeholder="Buscar..."
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                        />
                        <InputGroupAddon align="inline-end">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <InputGroupButton variant="ghost" size="icon-xs" className="text-muted-foreground">
                                        <SlidersHorizontal size={13} />
                                    </InputGroupButton>
                                </SheetTrigger>
                                <SheetContent side="bottom">
                                    <SheetHeader>
                                        <SheetTitle>Filtros avançados</SheetTitle>
                                    </SheetHeader>
                                    {/* placeholder para filtros futuros */}
                                </SheetContent>
                            </Sheet>
                        </InputGroupAddon>
                    </InputGroup>
                </div>

                {/* Linha 2: chips de saldo (só quando existem) */}
                {balanceListProps.buckets.length > 0 && (
                    <BucketBalanceList {...balanceListProps} />
                )}
            </div>

            {/* ── Lista ── */}
                <TransactionList {...listProps } />

            {/* ── FAB: Pagar / Receber ── */}
            {!selectionMode && (
                <div className="fixed bottom-4 right-4 z-20 flex flex-col gap-2 pb-[env(safe-area-inset-bottom)]">
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onAddClick(false)}
                        className="rounded-full shadow-md"
                        aria-label="Pagar"
                    >
                        <Minus size={18} />
                    </Button>
                    <Button
                        size="icon"
                        variant="outline"
                        onClick={() => onAddClick(true)}
                        className="rounded-full shadow-md"
                        aria-label="Receber"
                    >
                        <Plus size={18} />
                    </Button>
                </div>
            )}

            {/* ── Barra inferior: seleção ativa ou drafts ── */}
            {(selectionMode || hasDraft) && (
                <div className="sticky bottom-0 z-10 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-2 bg-background/95 backdrop-blur-sm">
                    <Card className="flex flex-row items-center justify-between gap-3 px-4 py-3 rounded-xl shadow-lg">
                        <span className="text-sm text-muted-foreground">
                            {selectionMode
                                ? `${selected.length} selecionada${selected.length > 1 ? "s" : ""}`
                                : "Alterações pendentes"
                            }
                        </span>
                        <div className="flex items-center gap-2">
                            {selectionMode && (
                                <Button variant="ghost" size="sm" onClick={clearSelection}>
                                    <X size={14} />
                                    Cancelar
                                </Button>
                            )}
                            {hasDraft && (
                                <Button size="sm" onClick={onSubmit}>
                                    Salvar
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
            )}
        </div>
    )
}
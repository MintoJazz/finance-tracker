import { useManager } from "@/hooks/use-manager"
import { useDraftList } from "@/hooks/use-draft-list"
import { useSelection } from "@/hooks/use-selection"
import { BucketOption, TransactionDetails } from "@/types/database"
import { TransactionStatus } from "@/generated/prisma/browser"
import { toDomain } from "../../features/transaction/mappers/domain-builder"
import { TransactionFormType } from "../../features/transaction/form/schema/types"
import { useState } from "react"
import { DateRange } from "react-day-picker"
import { RowAction } from "@/components/ui/data-table"
import { persistDraftsAction } from "../../features/transaction/actions"
import { toast } from "sonner"
import { useBalanceList } from "@/features/buckets/use-balance-list"

export interface TransactionRow {
    transaction: TransactionDetails
    statusBadgeProps: { current: TransactionStatus; onClick: (status: TransactionStatus) => void }
}

export function useTransactionFeatures(initialTransactions: TransactionDetails[], buckets: BucketOption[]) {
    const [isIncome, setIsIncome] = useState<boolean>(false)
    const [date, setDate] = useState<DateRange | undefined>(undefined)

    const { onDelete, onEdit, isCreateOpen, setIsCreateOpen } = useManager<TransactionDetails>()
    const { select, selectAll, selected } = useSelection()
    const { edit, items, drafts, add } = useDraftList<TransactionDetails>(initialTransactions)
    const balanceListProps = useBalanceList(items.filter(i => selected.includes(i.id)))

    function onStatusChange(id: number, status: TransactionStatus) {
        const original = initialTransactions.find(t => t.id === id) ?? items.find(t => t.id === id)!
        edit(id, { status }, original)
    }

    function onAddClick(isIncome: boolean) {
        setIsIncome(isIncome)
        setIsCreateOpen(true)
    }

    function onSubmitCreate(data: TransactionFormType) {
        add(toDomain(data, buckets))
        setIsCreateOpen(false)
    }

    const actions: RowAction<TransactionDetails>[] = [
        { label: "Editar", onClick: (row) => onEdit(row.original) },
        { label: "Excluir", onClick: (row) => onDelete(row.original) },
    ]

    const transactions: TransactionDetails[] = items.filter(i => {
        const matchesFrom = !date?.from || i.date.getTime() >= date.from.getTime();
        const matchesTo = !date?.to || i.date.getTime() <= date.to.getTime();

        return matchesFrom && matchesTo;
    })

    const onSubmit = async () => {
        try {
            const response = await persistDraftsAction(Object.values(drafts))

            if (response.failed.length > 0) {
                toast.error(`Não foi possível persistir`)
                console.log("[FALHA NO BANCO DE DADOS]", response.failed)
                return
            }
            toast.success("Dados salvos com sucesso!")
        } catch (error) {
            toast.error("Erro de conexão. Não foi possível comunicar com o servidor.")
            console.log("[ERRO DE REDE OU SERVER ACTION]", error)
        }
    }

    const createDialogProps = {
        buckets,
        isIncome,
        isOpen: isCreateOpen,
        onClose: setIsCreateOpen,
        onSubmit: onSubmitCreate,
    }

    const viewProps = {
        actions, selected, onStatusChange, transactions,
        onSelect: select,
    }

    const hasDraft = Object.keys(drafts).length !== 0

    return {
        selectAll,
        hasDraft,
        date,
        setDate,
        onAddClick,
        onSubmit,
        balanceListProps,
        createDialogProps,
        ...viewProps,
    }
}

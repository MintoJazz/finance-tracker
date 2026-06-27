import { Button } from "@/components/ui/button"
import { Minus, Plus } from "lucide-react"

export interface TransactionActionButtonsProps {
    hasDraft: boolean
    onSubmit: () => void
    onAddClick: (isIncome: boolean) => void
}

export function TransactionActionButtons({ hasDraft, onSubmit, onAddClick }: TransactionActionButtonsProps) {
    return (
        <div className="grid grid-cols-2 gap-2">
            {hasDraft && (
                <Button variant="outline" size="sm" onClick={onSubmit} className="col-span-2">
                    Salvar Alterações
                </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => onAddClick(false)}>
                <Minus className="h-4 w-4" /> Pagar
            </Button>
            <Button variant="outline" size="sm" onClick={() => onAddClick(true)}>
                <Plus className="h-4 w-4" /> Receber
            </Button>
        </div>
    )
}
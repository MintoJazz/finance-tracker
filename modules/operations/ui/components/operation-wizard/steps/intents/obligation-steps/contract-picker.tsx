"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { formatMoney } from "@/lib/formatters"
import {
  EntityPicker,
  type EntityPickerItem,
} from "@/modules/operations/ui/components/entity-picker"
import type { ObligationContractItem } from "@/modules/operations/application/interfaces/obligation-contracts-queries.interface"
import { useOperationWizard } from "@/modules/operations/ui/components/operation-wizard/context"
import { getObligationContractsAction } from "@/modules/operations/ui/actions/get-obligation-contracts.action"

export interface ContractPickerProps {
  value?: number | null
  onChange: (id: number | null) => void
  variant?: "carousel" | "grid"
  className?: string
}

export function ContractPicker({
  value,
  onChange,
  variant = "grid",
  className,
}: ContractPickerProps) {
  const { draft, updateDraft } = useOperationWizard()
  const isReceive = draft.nature === "RECEIVE"
  const sliceKey = isReceive ? "SETTLE_RECEIVABLE" : "SETTLE_PAYABLE"

  const [loading, setLoading] = React.useState(true)
  const [contracts, setContracts] = React.useState<ObligationContractItem[]>([])

  const fetchContracts = React.useCallback(
    async (queryText?: string) => {
      setLoading(true)
      const res = await getObligationContractsAction({
        nature: isReceive ? "RECEIVE" : "PAY",
        search: queryText?.trim() || undefined,
      })
      if (res.success && res.data) {
        setContracts(res.data)
      }
      setLoading(false)
    },
    [isReceive]
  )

  React.useEffect(() => {
    fetchContracts()
  }, [fetchContracts])

  const handleSelect = (contractId: number | null) => {
    onChange(contractId)
    const contract = contracts.find((c) => c.agreementId === contractId)
    if (contract) {
      updateDraft({
        [sliceKey]: {
          agreementId: contract.agreementId,
          contractName: contract.name,
          allocations: [],
        },
        base: {
          description: isReceive
            ? `Recebimento - ${contract.name}`
            : `Pagamento - ${contract.name}`,
          amount: 0,
        },
      })
    }
  }

  const selectedId = value ?? (draft as any)?.[sliceKey]?.agreementId

  React.useEffect(() => {
    if (contracts.length > 0 && selectedId) {
      const contract = contracts.find((c) => c.agreementId === selectedId)
      const currentContractName = (draft as any)?.[sliceKey]?.contractName
      if (contract && !currentContractName) {
        updateDraft({
          [sliceKey]: {
            ...((draft as any)?.[sliceKey] ?? {}),
            agreementId: contract.agreementId,
            contractName: contract.name,
          },
        })
      }
    }
  }, [contracts, selectedId, draft, sliceKey, updateDraft])

  const items = React.useMemo<EntityPickerItem<number>[]>(() => {
    return contracts.map((c) => ({
      id: c.agreementId,
      title: (
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="truncate">{c.name}</span>
          {c.balanceType === "CREDIT" && (
            <Badge variant="outline" className="text-[10px] py-0 px-1 shrink-0">
              Cartão
            </Badge>
          )}
        </div>
      ),
      titleText: c.name,
      subtitle: c.subtitle,
      icon:
        c.balanceType === "CREDIT"
          ? "CreditCard"
          : isReceive
            ? "HandCoins"
            : "Receipt",
      extra: (
        <div className="flex flex-col items-end gap-0.5 shrink-0">
          {c.pendingAmount > 0 ? (
            <span className="text-xs font-semibold tabular-nums text-foreground">
              {formatMoney(c.pendingAmount)}
            </span>
          ) : (
            <span className="text-[11px] text-muted-foreground italic">
              Sem pendências
            </span>
          )}
          {c.overdueCount > 0 && (
            <Badge
              variant="destructive"
              className="text-[9px] py-0 px-1 leading-tight"
            >
              Vencido
            </Badge>
          )}
        </div>
      ),
      keywords: [c.name, c.subtitle, c.balanceType.toLowerCase()],
    }))
  }, [contracts, isReceive])

  return (
    <EntityPicker<number>
      items={items}
      value={selectedId ?? null}
      onChange={handleSelect}
      variant={variant}
      indicator="chevron"
      loading={loading}
      listClassName="max-h-[260px]"
      searchPlaceholder={
        isReceive
          ? "Buscar cobrança ou contrato por nome..."
          : "Buscar compromisso ou cartão por nome..."
      }
      emptyMessage={
        isReceive
          ? "Nenhuma cobrança encontrada"
          : "Nenhum compromisso encontrado"
      }
      className={className}
    />
  )
}

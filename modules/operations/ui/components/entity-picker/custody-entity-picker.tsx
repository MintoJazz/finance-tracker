"use client"

import * as React from "react"
import type { CustodyBalanceType } from "@/modules/operations/models/operation-seed.schema"
import { EntityPicker } from "./index"
import type { EntityPickerItem, EntityPickerSingleProps } from "./types"

export interface CustodyEntityOption {
  id: number
  name: string
  type?: CustodyBalanceType
  subtitle?: string
  icon?: string | null
  color?: string | null
}

export interface CustodyEntityPickerProps
  extends Pick<
    EntityPickerSingleProps<number>,
    | "value"
    | "onChange"
    | "variant"
    | "indicator"
    | "searchPlaceholder"
    | "emptyMessage"
    | "listClassName"
    | "className"
    | "hideIcon"
  > {
  custodies: readonly CustodyEntityOption[]
  /** Tipo padrão usado quando os itens não informam `type` (ex.: lista apenas de cartões). */
  defaultType?: CustodyBalanceType
  /** Oculta o subtítulo dos itens (útil quando todos são do mesmo tipo, ex.: apenas cartões). */
  hideSubtitle?: boolean
}

const CUSTODY_META: Record<
  CustodyBalanceType,
  { label: string; icon: string }
> = {
  CREDIT: { label: "Cartão de crédito", icon: "CreditCard" },
  RESERVE: { label: "Reserva", icon: "PiggyBank" },
  WALLET: { label: "Carteira", icon: "Wallet" },
}

/** Seletor reutilizável de meios de pagamento / cartões baseado no `<EntityPicker />`. */
export function CustodyEntityPicker({
  custodies,
  defaultType = "WALLET",
  hideSubtitle = false,
  searchPlaceholder = "Buscar meio de pagamento...",
  emptyMessage = "Nenhum meio de pagamento encontrado",
  ...pickerProps
}: CustodyEntityPickerProps) {
  const items = React.useMemo<EntityPickerItem<number>[]>(
    () =>
      custodies.map((c) => {
        const type = c.type ?? defaultType
        const meta = CUSTODY_META[type]
        return {
          id: c.id,
          title: c.name,
          titleText: c.name,
          subtitle: hideSubtitle ? undefined : c.subtitle || meta.label,
          icon: c.icon ?? meta.icon,
          color: c.color,
          keywords: [
            type.toLowerCase(),
            meta.label.toLowerCase(),
            c.name,
            c.subtitle ?? "",
          ],
        }
      }),
    [custodies, defaultType, hideSubtitle]
  )

  return (
    <EntityPicker<number>
      {...pickerProps}
      items={items}
      searchPlaceholder={searchPlaceholder}
      emptyMessage={emptyMessage}
    />
  )
}

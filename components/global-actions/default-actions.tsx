import { ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { operationHref } from "@/modules/operations/ui/href"
import type { GlobalAction } from "./types"

/** Ações presentes em todas as páginas. */
export const DEFAULT_GLOBAL_ACTIONS: GlobalAction[] = [
  {
    id: "receive",
    tone: "positive",
    featured: true,
    label: "Receber",
    icon: <ArrowDownLeft className="size-4 text-emerald-600 dark:text-emerald-400" />,
    href: operationHref({ nature: "RECEIVE" }),
  },
  {
    id: "pay",
    tone: "negative",
    featured: true,
    label: "Pagar",
    icon: <ArrowUpRight className="size-4 text-destructive" />,
    href: operationHref({ nature: "PAY" }),
  },
]

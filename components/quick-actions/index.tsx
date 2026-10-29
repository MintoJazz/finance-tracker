"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import type { RowData } from "@tanstack/react-table"
import { MoreHorizontal } from "lucide-react"
import { ActionsDrawer } from "@/components/actions/drawer"
import { ActionsMenu, renderActionIcon } from "@/components/actions/menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useIsDesktop } from "@/hooks/use-breakpoint"
import { cn } from "@/lib/utils"
import type {
  ActionCatalog,
  RowAction,
  RowLike,
} from "@/types/actions.types"

export interface QuickActionsProps<
  TData extends RowData = RowData,
  TContext = unknown,
> {
  row: TData | RowLike<TData>
  actions: ActionCatalog<TData, TContext> | RowAction<TData, TContext>[]
  context?: TContext
  optionsHeader?: React.ReactNode
  optionsLabel?: React.ReactNode
  optionsContentClassName?: string
  optionsTriggerLabel?: string
  className?: string
}

const MAX_PRIMARY_SLOTS = 2

const QUICK_ACTION_CARD_COMMON =
  "group relative min-w-0 rounded-lg border border-border/80 dark:border-border bg-muted/45 hover:bg-muted/80 dark:bg-muted/35 dark:hover:bg-muted/65 shadow-2xs transition-all cursor-pointer outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-expanded:bg-muted/80 dark:aria-expanded:bg-muted/65"

const QUICK_ACTION_CARD_COLUMN =
  "w-[calc((100%-1rem)/3)] @[400px]:w-32 shrink-0 flex flex-col items-center text-center justify-between gap-1.5 px-2.5 @[340px]:px-3 py-2.5"

const QUICK_ACTION_CARD_ROW =
  "flex-1 w-full flex flex-row items-center justify-center gap-2 h-9 px-3 py-2 text-center"

const QUICK_ACTION_DESTRUCTIVE_CLASSNAME =
  "text-destructive hover:bg-destructive/10 dark:hover:bg-destructive/20 focus-visible:border-destructive/40 focus-visible:ring-destructive/20 dark:focus-visible:ring-destructive/40"

interface QuickActionCardProps<
  TData extends RowData = RowData,
  TContext = unknown,
> {
  action: RowAction<TData, TContext>
  row: RowLike<TData>
  context?: TContext
  isRowLayout?: boolean
  onConfirmRequest: (action: RowAction<TData, TContext>) => void
}

function QuickActionCard<
  TData extends RowData = RowData,
  TContext = unknown,
>({
  action,
  row,
  context,
  isRowLayout = false,
  onConfirmRequest,
}: QuickActionCardProps<TData, TContext>) {
  const isDisabled = Boolean(
    typeof action.disabled === "function"
      ? action.disabled(row, context)
      : action.disabled
  )
  const isDestructive = action.variant === "destructive"
  const requiresConfirmation = Boolean(
    action.confirmTitle || action.confirmDescription
  )
  const ariaLabel = typeof action.label === "string" ? action.label : undefined

  const cardClassName = cn(
    QUICK_ACTION_CARD_COMMON,
    isRowLayout ? QUICK_ACTION_CARD_ROW : QUICK_ACTION_CARD_COLUMN,
    isDestructive ? QUICK_ACTION_DESTRUCTIVE_CLASSNAME : "text-foreground"
  )

  const content = (
    <>
      {renderActionIcon(
        action.icon,
        cn(
          isRowLayout ? "size-3.5" : "size-5.5",
          "shrink-0 transition-transform group-hover:scale-105",
          isDestructive ? "text-destructive" : "text-muted-foreground"
        )
      )}
      <span
        className={cn(
          isRowLayout
            ? "truncate text-xs font-medium leading-none"
            : "w-full truncate text-xs text-center font-medium leading-tight",
          isDestructive ? "text-destructive" : "text-foreground"
        )}
      >
        {action.label}
      </span>
    </>
  )

  if (action.href && !isDisabled && !requiresConfirmation) {
    return (
      <Link
        href={action.href}
        aria-label={ariaLabel}
        className={cardClassName}
        onClick={() => {
          void action.onClick?.(row, context as TContext)
        }}
      >
        {content}
      </Link>
    )
  }

  return (
    <button
      type="button"
      disabled={isDisabled}
      aria-label={ariaLabel}
      className={cardClassName}
      onClick={() => {
        if (requiresConfirmation) {
          onConfirmRequest(action)
          return
        }
        void action.onClick?.(row, context as TContext)
      }}
    >
      {content}
    </button>
  )
}

interface OptionsCardTriggerProps
  extends React.ComponentPropsWithoutRef<"button"> {
  label?: React.ReactNode
}

const OptionsCardTrigger = React.forwardRef<
  HTMLButtonElement,
  OptionsCardTriggerProps
>(({ label = "Opções", className, children, ...props }, ref) => {
  const ariaLabel = typeof label === "string" ? label : "Opções"

  return (
    <button
      ref={ref}
      type="button"
      aria-label={ariaLabel}
      {...props}
      className={cn(
        QUICK_ACTION_CARD_COMMON,
        QUICK_ACTION_CARD_COLUMN,
        "text-foreground",
        className
      )}
    >
      <MoreHorizontal className="size-5.5 shrink-0 text-muted-foreground transition-transform group-hover:scale-105" />
      <span className="w-full truncate text-xs text-center font-medium leading-tight text-foreground">
        {label}
      </span>
      {children}
    </button>
  )
})
OptionsCardTrigger.displayName = "OptionsCardTrigger"

export function QuickActions<
  TData extends RowData = RowData,
  TContext = unknown,
>({
  row,
  actions,
  context,
  optionsHeader,
  optionsLabel,
  optionsContentClassName,
  optionsTriggerLabel = "Opções",
  className,
}: QuickActionsProps<TData, TContext>) {
  const isDesktop = useIsDesktop()
  const router = useRouter()
  const [confirmingAction, setConfirmingAction] = React.useState<RowAction<
    TData,
    TContext
  > | null>(null)

  const normalizedRow = React.useMemo(() => {
    if (!row) return undefined
    return typeof row === "object" && "original" in row
      ? (row as RowLike<TData>)
      : ({ original: row as TData } as RowLike<TData>)
  }, [row])

  const actionList = React.useMemo<RowAction<TData, TContext>[]>(() => {
    if (Array.isArray(actions)) return actions
    return Object.values(actions) as RowAction<TData, TContext>[]
  }, [actions])

  const visibleActions = React.useMemo(() => {
    if (!normalizedRow) return []
    return actionList.filter(
      (action) => !action.hidden?.(normalizedRow, context)
    )
  }, [actionList, normalizedRow, context])

  if (!normalizedRow || visibleActions.length === 0) return null

  // Se houver mais de 3 ações, os 2 primeiros slots ficam em evidência e o 3º vira "Opções".
  // Se houver exatamente 3 ações, todas cabem nos 3 slots sem precisar do botão de "Opções".
  // Se houver 1 ou 2 ações, elas ficam em row cobrindo a área disponível.
  const hasOverflow = visibleActions.length > 3
  const primaryActions = hasOverflow
    ? visibleActions.slice(0, MAX_PRIMARY_SLOTS)
    : visibleActions
  const overflowActions = hasOverflow
    ? visibleActions.slice(MAX_PRIMARY_SLOTS)
    : []
  const showOptions = hasOverflow
  const isRowLayout = !showOptions && primaryActions.length <= 2

  const optionsTrigger = (
    <OptionsCardTrigger label={optionsTriggerLabel} />
  )

  const handleConfirmAction = () => {
    if (!confirmingAction) return
    const targetAction = confirmingAction
    setConfirmingAction(null)
    void targetAction.onClick?.(normalizedRow, context as TContext)
    if (targetAction.href) {
      router.push(targetAction.href)
    }
  }

  return (
    <div className={cn("@container w-full", className)}>
      <div className="flex items-stretch justify-center gap-2 w-full">
        {primaryActions.map((action, index) => (
          <QuickActionCard
            key={action.id ?? index}
            action={action}
            row={normalizedRow}
            context={context}
            isRowLayout={isRowLayout}
            onConfirmRequest={setConfirmingAction}
          />
        ))}

        {showOptions &&
          (isDesktop ? (
            <ActionsMenu
              row={normalizedRow}
              actions={overflowActions}
              context={context}
              trigger={optionsTrigger}
            />
          ) : (
            <ActionsDrawer
              row={normalizedRow}
              actions={visibleActions}
              context={context}
              trigger={optionsTrigger}
              header={optionsHeader}
              label={optionsLabel}
              contentClassName={optionsContentClassName}
            />
          ))}
      </div>

      <AlertDialog
        open={Boolean(confirmingAction)}
        onOpenChange={(open) => {
          if (!open) setConfirmingAction(null)
        }}
      >
        <AlertDialogContent size="default">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmingAction?.confirmTitle ?? confirmingAction?.label}
            </AlertDialogTitle>
            {confirmingAction?.confirmDescription && (
              <AlertDialogDescription>
                {confirmingAction.confirmDescription}
              </AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setConfirmingAction(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              variant={
                confirmingAction?.variant === "destructive"
                  ? "destructive"
                  : "default"
              }
              onClick={handleConfirmAction}
            >
              Confirmar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

export default QuickActions

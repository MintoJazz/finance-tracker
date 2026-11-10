import Link from "next/link"
import { ArrowDownLeft, ArrowUpRight, Plus, Sparkles } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"

export default function OperationsPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Operações Financeiras
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie e registre novas movimentações de pagamento e recebimento.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/operations/new"
            className={buttonVariants({ size: "sm" })}
          >
            <Plus className="size-4" />
            Nova Operação
          </Link>
        </div>
      </div>

      {/* Ações Rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/operations/new?nature=PAY"
          className="group flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/60 hover:bg-card hover:border-destructive/40 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowUpRight className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Registrar Pagamento
              </p>
              <p className="text-xs text-muted-foreground">
                Saída de carteira ou fatura de cartão
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-destructive group-hover:translate-x-0.5 transition-transform">
            Pagar &rarr;
          </span>
        </Link>

        <Link
          href="/operations/new?nature=RECEIVE"
          className="group flex items-center justify-between p-4 rounded-xl border border-border/70 bg-card/60 hover:bg-card hover:border-emerald-500/40 transition-all shadow-2xs"
        >
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <ArrowDownLeft className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">
                Registrar Recebimento
              </p>
              <p className="text-xs text-muted-foreground">
                Entrada em conta ou carteira física
              </p>
            </div>
          </div>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform">
            Receber &rarr;
          </span>
        </Link>
      </div>

      {/* Atalho Dev para o Playground Enxuto */}
      <div className="mt-4 p-4 rounded-xl border border-dashed border-border/80 bg-muted/20 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Sparkles className="size-4 text-primary" />
          <div>
            <p className="text-xs font-medium text-foreground">
              Playground de Desenvolvimento
            </p>
            <p className="text-[11px] text-muted-foreground">
              Inspecione etapas lógicas e simule seeds do Wizard enxuto.
            </p>
          </div>
        </div>
        <Link
          href="/operations/playground"
          className={buttonVariants({ variant: "outline", size: "xs" })}
        >
          Abrir Playground
        </Link>
      </div>
    </div>
  )
}

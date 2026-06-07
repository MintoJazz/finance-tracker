import { BucketType } from "@/generated/prisma/enums"
import { CreditCard, LucideIcon, PiggyBank, Wallet } from "lucide-react"

export const BUCKET_TYPE_THEMES: Record<BucketType, LucideIcon> = {
    CREDIT: CreditCard,
    RESERVE: PiggyBank,
    WALLET: Wallet,
}

export interface BucketCardTheme {
    gradient: string
    border: string
    accentText: string
    accentBadge: string
    accentAvatar: string
    accentColor: string  // para os SVGs
    chipColor: string    // para os SVGs
    label: string
}

export const BUCKET_CARD_THEMES: Record<BucketType, BucketCardTheme> = {
    CREDIT: {
        gradient: "from-violet-900 via-violet-950 to-zinc-950",
        border: "border-violet-500/30",
        accentText: "text-violet-300",
        accentBadge: "bg-violet-400/10 border-violet-400/30",
        accentAvatar: "bg-violet-400/15 border-violet-400/40",
        accentColor: "#c4b5fd",
        chipColor: "#fde68a",
        label: "Crédito",
    },
    WALLET: {
        gradient: "from-emerald-900 via-emerald-950 to-zinc-950",
        border: "border-emerald-500/30",
        accentText: "text-emerald-300",
        accentBadge: "bg-emerald-400/10 border-emerald-400/30",
        accentAvatar: "bg-emerald-400/15 border-emerald-400/40",
        accentColor: "#6ee7b7",
        chipColor: "#fde68a",
        label: "Débito",
    },
    RESERVE: {
        gradient: "from-blue-900 via-blue-950 to-zinc-950",
        border: "border-blue-500/30",
        accentText: "text-blue-300",
        accentBadge: "bg-blue-400/10 border-blue-400/30",
        accentAvatar: "bg-blue-400/15 border-blue-400/40",
        accentColor: "#93c5fd",
        chipColor: "#fde68a",
        label: "Reserva",
    },
}
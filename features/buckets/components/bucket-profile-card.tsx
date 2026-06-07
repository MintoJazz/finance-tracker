"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"
import { Bucket, User } from "@/generated/prisma/client"
import { BUCKET_CARD_THEMES } from "@/features/buckets/themes/bucket-type"
import { formatarDinheiro } from "@/lib/formatters"
import { cn } from "@/lib/utils"

// ── Helpers ───────────────────────────────────────────────────────────────────

const formatCardNumber = (id: number) => {
    const padded = String(id).padStart(16, "0").slice(-16)
    return `${padded.slice(0, 4)} ${padded.slice(4, 8)} ${padded.slice(8, 12)} ${padded.slice(12, 16)}`
}

const maskedNumber = "•••• •••• •••• ••••"

const initials = (name: string) =>
    name
        .split(" ")
        .slice(0, 2)
        .map((w) => w[0])
        .join("")
        .toUpperCase()

// ── Decorações ────────────────────────────────────────────────────────────────

function ChipSVG({ color, className }: { color: string; className?: string }) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 36 28"
            className={cn("h-6 w-8", className)}
            fill="none"
        >
            <defs>
                <linearGradient id="chip-grad" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.95" />
                    <stop offset="55%" stopColor={color} stopOpacity="0.7" />
                    <stop offset="100%" stopColor={color} stopOpacity="0.4" />
                </linearGradient>
            </defs>
            <rect width="36" height="28" rx="5" fill="url(#chip-grad)" />
            <path
                d="M0 10h12M0 18h12M24 10h12M24 18h12M12 0v10M24 0v10M12 18v10M24 18v10"
                stroke="rgba(0,0,0,0.3)"
                strokeWidth="0.8"
            />
            <rect
                x="12"
                y="10"
                width="12"
                height="8"
                rx="1.5"
                stroke="rgba(0,0,0,0.35)"
                strokeWidth="0.8"
            />
        </svg>
    )
}

function ContactlessSVG({ className }: { className?: string }) {
    return (
        <svg
            aria-hidden
            viewBox="0 0 24 24"
            className={cn("h-4 w-4 opacity-70", className)}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
        >
            <path d="M7 7a8 8 0 0 1 0 10" />
            <path d="M11 5a12 12 0 0 1 0 14" />
            <path d="M15 3a16 16 0 0 1 0 18" />
        </svg>
    )
}

// ── Componente ────────────────────────────────────────────────────────────────

interface Props {
    bucket: Bucket
    user: User
    balance: number
    defaultRevealed?: boolean
    className?: string
}

export function BucketProfileCard({
    bucket,
    user,
    balance,
    defaultRevealed = false,
    className,
}: Props) {
    const [revealed, setRevealed] = useState(defaultRevealed)
    const theme = BUCKET_CARD_THEMES[bucket.type]

    return (
        <div
            aria-label={`Cartão ${bucket.name}, saldo ${revealed ? formatarDinheiro(balance) : "oculto"
                }`}
            className={cn(
                "group relative isolate w-full max-w-[320px] overflow-hidden",
                "rounded-xl text-white",
                "aspect-[1.586/1]",
                "bg-linear-to-br",
                theme.gradient,
                "border",
                theme.border,
                "shadow-[0_16px_40px_-20px_rgba(0,0,0,0.6),0_1px_0_rgba(255,255,255,0.06)_inset]",
                "transition-transform duration-500 ease-out will-change-transform",
                "hover:-translate-y-0.5",
                className,
            )}
        >
            {/* Reflexo diagonal sutil */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.06] mix-blend-overlay"
                style={{
                    backgroundImage:
                        "linear-gradient(115deg, transparent 35%, white 50%, transparent 65%)",
                }}
            />
            {/* Grão sutil */}
            <div
                aria-hidden
                className="pointer-events-none absolute inset-0 opacity-[0.05]"
                style={{
                    backgroundImage:
                        "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
                    backgroundSize: "3px 3px",
                }}
            />

            <div className="relative flex h-full flex-col justify-between p-4">
                {/* Topo: badge do tema + contactless */}
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <span
                            className={cn(
                                "inline-flex items-center rounded-full border px-1.5 py-0.5",
                                theme.accentBadge,
                                "text-[9px] font-medium uppercase tracking-[0.18em]",
                                theme.accentText,
                            )}
                        >
                            {theme.label}
                        </span>
                        <h3 className="mt-1.5 truncate text-sm font-medium tracking-tight text-white">
                            {bucket.name}
                        </h3>
                    </div>
                    <ContactlessSVG className={theme.accentText} />
                </div>

                {/* Meio: chip + saldo */}
                <div className="flex items-end justify-between gap-3">
                    <ChipSVG color={theme.chipColor} />

                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-medium uppercase tracking-[0.22em] text-white/55">
                            Saldo
                        </span>
                        <button
                            type="button"
                            onClick={() => setRevealed((v) => !v)}
                            aria-pressed={revealed}
                            aria-label={revealed ? "Ocultar saldo" : "Mostrar saldo"}
                            className={cn(
                                "mt-0.5 inline-flex items-center gap-1.5 rounded-md px-1 -mx-1",
                                "text-lg font-semibold tracking-tight text-white",
                                "transition-all duration-300",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40",
                            )}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                        >
                            <span
                                className={cn(
                                    "transition-all duration-300",
                                    revealed ? "blur-0 opacity-100" : "blur-[5px] opacity-70",
                                )}
                            >
                                {revealed ? formatarDinheiro(balance) : "R$ ••••••"}
                            </span>
                            {revealed ? (
                                <EyeOff className="h-3 w-3 opacity-60" />
                            ) : (
                                <Eye className="h-3 w-3 opacity-60" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Base: número + titular */}
                <div className="space-y-2">
                    <p
                        className="font-mono text-[11px] tracking-[0.18em] text-white/75"
                        style={{ fontVariantNumeric: "tabular-nums" }}
                    >
                        {revealed ? formatCardNumber(bucket.id) : maskedNumber}
                    </p>

                    <div className="flex items-end justify-between gap-3">
                        <div className="min-w-0">
                            <p className="text-[8px] font-medium uppercase tracking-[0.22em] text-white/50">
                                Titular
                            </p>
                            <p className="mt-0.5 truncate text-xs font-medium text-white/95">
                                {user.name}
                            </p>
                        </div>

                        <div
                            aria-hidden
                            className={cn(
                                "flex size-7 items-center justify-center rounded-full border",
                                theme.accentAvatar,
                                "text-[10px] font-semibold tracking-wider text-white backdrop-blur-sm",
                            )}
                        >
                            {initials(user.name)}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
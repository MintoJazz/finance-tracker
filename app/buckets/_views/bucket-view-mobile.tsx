'use client'

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { RowAction } from "@/components/ui/data-table"
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group"
import { BucketsList } from "@/features/buckets/list/bucket-list"
import { BUCKET_CARD_THEMES } from "@/features/buckets/themes/bucket-type"
import { BucketType } from "@/generated/prisma/enums"
import { BucketList } from "@/types/database"
import { Plus, Search, Wallet } from "lucide-react"
import { useState, useMemo } from "react"

import Link from "next/link"

export type TypeFilter = "ALL" | BucketType

interface Props {
    buckets: BucketList[]
    actions: RowAction<BucketList>[]
}

export default function BucketViewMoblie({ buckets, actions }: Props) {
    const [search, setSearch] = useState("")
    const [typeFilter, setTypeFilter] = useState<TypeFilter>("ALL")

    const filtered = useMemo(() => {
        const term = search.trim().toLowerCase()
        return buckets.filter((bucket) => {
            if (typeFilter !== "ALL" && bucket.type !== typeFilter) return false
            // if (statusFilter === "ACTIVE" && bucket.archived) return false
            // if (statusFilter === "ARCHIVED" && !bucket.archived) return false
            if (term && !bucket.name.toLowerCase().includes(term)) return false
            return true
        })
    }, [search, typeFilter, buckets])

    return <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
        {/* Cabeçalho: identidade da tela + contador + ação primária */}
        <header className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-semibold tracking-tight">Buckets</h1>
                <Badge variant="secondary" className="tabular-nums">
                    {buckets.length}
                </Badge>
            </div>
            <Button size="sm" asChild>
                <Link href="/buckets/new">
                    <Plus data-icon="inline-start" />
                    Novo bucket
                </Link>
            </Button>
        </header>

        {/* Controles de afunilamento: busca, tipo e status */}
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <InputGroup className="lg:max-w-xs">
                <InputGroupAddon>
                    <Search />
                </InputGroupAddon>
                <InputGroupInput
                    placeholder="Buscar por nome"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label="Buscar buckets por nome"
                />
            </InputGroup>

            <div className="flex flex-wrap items-center gap-3 lg:justify-between">
                <ToggleGroup
                    type="single"
                    value={typeFilter}
                    onValueChange={(value) => {
                        if (value.length > 0) setTypeFilter(value as TypeFilter)
                    }}
                    variant="outline"
                    size="sm"
                >
                    {Object.entries(BUCKET_CARD_THEMES).map(([value, { label }]) => (
                        <ToggleGroupItem key={value} value={value}>
                            {label}
                        </ToggleGroupItem>
                    ))}
                </ToggleGroup>

                {/* <Select
                        value={statusFilter}
                        onValueChange={(value) => setStatusFilter(value as StatusFilter)}
                    >
                        <SelectTrigger size="sm" className="w-36" aria-label="Filtrar por status">
                            <SelectValue>
                                {(value: StatusFilter) => STATUS_LABELS[value]}
                            </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">Todos os status</SelectItem>
                            <SelectItem value="ACTIVE">Ativos</SelectItem>
                            <SelectItem value="ARCHIVED">Arquivados</SelectItem>
                        </SelectContent>
                    </Select> */}
            </div>
        </div>

        {filtered.length === 0 ? (
            <Empty className="rounded-lg border">
                <EmptyHeader>
                    <EmptyMedia variant="icon">
                        <Wallet />
                    </EmptyMedia>
                    <EmptyTitle>Nenhum bucket encontrado</EmptyTitle>
                    <EmptyDescription>
                        Ajuste a busca ou os filtros para ver seus buckets.
                    </EmptyDescription>
                </EmptyHeader>
            </Empty>
        ) : <BucketsList actions={actions} buckets={filtered} />}

        <p className="text-xs text-muted-foreground">
            Mostrando {filtered.length} de {buckets.length} buckets
        </p>
    </div>
}
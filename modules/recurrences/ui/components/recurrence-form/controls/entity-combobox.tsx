"use client";

import * as React from "react";
import { Plus, Sparkles } from "lucide-react";
import {
    Combobox,
    ComboboxContent,
    ComboboxEmpty,
    ComboboxInput,
    ComboboxItem,
    ComboboxList,
} from "@/components/ui/combobox";
import { cn } from "@/lib/utils";
import { CategoryIcon } from "@/modules/movements/ui/components/category-badge/category-icon";
import { getCategoryTheme } from "@/modules/movements/ui/components/category-badge";

export interface EntityComboboxOption {
    id: number;
    name: string;
    subtitle?: string;
    icon?: string | null;
    color?: string | null;
}

type ComboItem =
    | ({ kind: "option" } & EntityComboboxOption)
    | { kind: "create"; id: "create"; name: string }
    | { kind: "draft"; id: "draft"; name: string; icon?: string | null; color?: string | null };

interface Props {
    id?: string;
    "aria-invalid"?: boolean;
    options: readonly EntityComboboxOption[];
    /** Id da opção existente selecionada */
    value?: number | null;
    /** Rascunho de entidade nova (exibido como selecionado, com selo "nova") */
    draft?: { name: string; icon?: string | null; color?: string | null } | null;
    placeholder?: string;
    emptyMessage?: string;
    disabled?: boolean;
    /** Desabilita a opção de criar (ex.: falta escolher o pai) */
    createDisabledReason?: string;
    onSelect: (option: EntityComboboxOption) => void;
    onCreate: (name: string) => void;
    onClear: () => void;
}

const norm = (s: string) =>
    s.normalize("NFD").replace(/[̀-ͯ]/g, "").trim().toLowerCase();

function OptionAvatar({ icon, color }: { icon?: string | null; color?: string | null }) {
    const theme = getCategoryTheme(color);
    return (
        <span
            style={theme.style}
            className={cn(
                "flex size-6 shrink-0 items-center justify-center rounded-md border",
                theme.palette
                    ? cn(theme.palette.bg, theme.palette.text, theme.palette.border ?? "border-border/40")
                    : "border-border/40 bg-muted/70 text-foreground"
            )}
        >
            <CategoryIcon name={icon} className="size-3.5" />
        </span>
    );
}

/**
 * Combobox de entidade com busca e opção "Criar 'texto digitado'".
 * Filtra no cliente; o rascunho de entidade nova aparece como valor selecionado.
 */
export function EntityCombobox({
    id,
    "aria-invalid": ariaInvalid,
    options,
    value,
    draft,
    placeholder = "Buscar ou criar...",
    emptyMessage = "Nenhum resultado",
    disabled,
    createDisabledReason,
    onSelect,
    onCreate,
    onClear,
}: Props) {
    const selected = React.useMemo<ComboItem | null>(() => {
        if (draft) return { kind: "draft", id: "draft", ...draft };
        const found = options.find((o) => o.id === value);
        return found ? { kind: "option", ...found } : null;
    }, [draft, options, value]);

    const [query, setQuery] = React.useState(selected?.name ?? "");

    // Mantém o texto do input alinhado ao valor quando ele muda por fora
    const selectedKey = selected ? `${selected.kind}:${selected.id}:${selected.name}` : "";
    const [prevSelectedKey, setPrevSelectedKey] = React.useState(selectedKey);
    if (prevSelectedKey !== selectedKey) {
        setPrevSelectedKey(selectedKey);
        setQuery(selected?.name ?? "");
    }

    const items = React.useMemo<ComboItem[]>(() => {
        const q = norm(query);
        const showAll = !q || (selected != null && q === norm(selected.name));
        const filtered: ComboItem[] = options
            .filter(
                (o) =>
                    showAll ||
                    norm(o.name).includes(q) ||
                    (o.subtitle ? norm(o.subtitle).includes(q) : false)
            )
            .map((o) => ({ kind: "option", ...o }));

        const exact = options.some((o) => norm(o.name) === q);
        const isDraftName = selected?.kind === "draft" && norm(selected.name) === q;
        if (q && !exact && !isDraftName && !createDisabledReason) {
            filtered.push({ kind: "create", id: "create", name: query.trim() });
        }
        if (selected?.kind === "draft" && showAll) {
            filtered.unshift(selected);
        }
        return filtered;
    }, [options, query, selected, createDisabledReason]);

    return (
        <Combobox<ComboItem>
            items={items}
            filter={null}
            value={selected}
            inputValue={query}
            onInputValueChange={(next) => setQuery(next)}
            itemToStringLabel={(item) => item.name}
            isItemEqualToValue={(a, b) => a.kind === b.kind && a.id === b.id}
            disabled={disabled}
            onValueChange={(item) => {
                if (!item) {
                    onClear();
                    return;
                }
                if (item.kind === "create") onCreate(item.name);
                else if (item.kind === "option") onSelect(item);
            }}
        >
            <ComboboxInput
                id={id}
                aria-invalid={ariaInvalid}
                placeholder={placeholder}
                showClear={selected != null}
                className="h-9 w-full"
                disabled={disabled}
            />
            <ComboboxContent>
                <ComboboxEmpty>
                    {createDisabledReason && query.trim()
                        ? createDisabledReason
                        : emptyMessage}
                </ComboboxEmpty>
                <ComboboxList>
                    {(item: ComboItem) =>
                        item.kind === "create" ? (
                            <ComboboxItem key="create" value={item} className="text-primary">
                                <span className="flex size-6 shrink-0 items-center justify-center rounded-md border border-dashed border-primary/40 bg-primary/5">
                                    <Plus className="size-3.5" />
                                </span>
                                <span className="truncate">Criar &quot;{item.name}&quot;</span>
                            </ComboboxItem>
                        ) : (
                            <ComboboxItem key={`${item.kind}-${item.id}`} value={item}>
                                <OptionAvatar icon={item.icon} color={item.color} />
                                <span className="flex min-w-0 flex-col">
                                    <span className="truncate">{item.name}</span>
                                    {item.kind === "option" && item.subtitle && (
                                        <span className="truncate text-[11px] text-muted-foreground">
                                            {item.subtitle}
                                        </span>
                                    )}
                                </span>
                                {item.kind === "draft" && (
                                    <span className="ml-auto flex items-center gap-1 rounded-full border border-primary/30 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                                        <Sparkles className="size-3" />
                                        nova
                                    </span>
                                )}
                            </ComboboxItem>
                        )
                    }
                </ComboboxList>
            </ComboboxContent>
        </Combobox>
    );
}

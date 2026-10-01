"use client";

import { useQueryParams } from "@/hooks/use-query-params";

export function useCrudModals<T extends { id: number }>() {
    const { setParam } = useQueryParams();

    const onAddClick = () => setParam("create", "true");
    const onEdit = (item: T) => setParam("edit", String(item.id));
    const onDelete = (item: T) => setParam("delete", String(item.id));

    return {
        onAddClick,
        actionsMenuContext: {
            onEdit,
            onDelete,
        },
    };
}

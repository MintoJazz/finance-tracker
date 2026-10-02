"use client";

import { useRouter, usePathname } from "next/navigation";
import { useQueryParams } from "./use-query-params";

export function useCrudModals<T extends { id: number }>() {
    const router = useRouter();
    const pathname = usePathname();
    const { setParam } = useQueryParams();

    const basePath = pathname.replace(/\/+$/, "");

    const onAddClick = () => router.push(`${basePath}/create`);

    const onEdit = (item: T) => router.push(`${basePath}/${item.id}/edit`);

    const onDelete = (item: T) => setParam("delete", String(item.id));

    const actionsMenuContext = { onEdit, onDelete };

    return {
        onAddClick,
        actionsMenuContext,
    };
}
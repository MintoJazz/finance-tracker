"use client";

import { useRouter, usePathname } from "next/navigation";

export function useCrudModals<T extends { id: number }>() {
    const router = useRouter();
    const pathname = usePathname();

    const basePath = pathname.endsWith("/") ? pathname.slice(0, -1) : pathname;

    const onAddClick = () => router.push(`${basePath}/create`);
    const onView = (item: T) => router.push(`${basePath}/${item.id}`);
    const onEdit = (item: T) => router.push(`${basePath}/${item.id}/edit`);
    const onDelete = (item: T) => router.push(`${basePath}/${item.id}/delete`);

    return {
        onAddClick, 
        onView,
        onEdit, 
        onDelete
    };
}
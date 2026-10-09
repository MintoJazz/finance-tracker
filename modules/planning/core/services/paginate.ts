import { Page, PageRequest } from "@/types/pagination.types";

/**
 * Função utilitária pura de paginação em memória.
 * Espelha rigorosamente os formatos de PageRequest e Page do sistema.
 */
export function paginate<T>(items: T[], req: PageRequest): Page<T> {
    const rawPage = Number(req.page);
    const rawPageSize = Number(req.pageSize);

    const page = !Number.isNaN(rawPage) && rawPage > 0 ? Math.floor(rawPage) : 1;
    const pageSize = !Number.isNaN(rawPageSize) && rawPageSize > 0 ? Math.floor(rawPageSize) : 10;

    const total = items.length;
    const skip = (page - 1) * pageSize;
    const data = items.slice(skip, skip + pageSize);
    const pageCount = pageSize > 0 ? Math.ceil(total / pageSize) : 0;

    return {
        data,
        total,
        pageIndex: page - 1,
        pageSize,
        pageCount,
    };
}

"use client"

import type { Table } from "@tanstack/react-table"

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { getPaginationItems } from "./utils"

interface DataTablePaginationProps<TData> {
  table: Table<TData>
  pageSizeOptions?: number[]
}

export function DataTablePagination<TData>({
  table,
  pageSizeOptions = [10, 20, 30, 40, 50],
}: DataTablePaginationProps<TData>) {
  const { pageIndex, pageSize } = table.getState().pagination
  const currentPage = pageIndex + 1
  const pages = getPaginationItems(currentPage, table.getPageCount())

  return (
    <div className="flex flex-col items-center justify-between gap-4 px-2 py-4 sm:flex-row">
      {/* Espaço reservado (ex.: contador de linhas selecionadas) */}
      <div className="hidden flex-1 text-sm text-muted-foreground sm:block" />

      <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-6 lg:gap-8">
        <div className="hidden items-center space-x-2 sm:flex">
          <p className="whitespace-nowrap text-sm font-medium">Linhas por página</p>
          <Select
            value={`${pageSize}`}
            onValueChange={(value) => table.setPageSize(Number(value))}
          >
            <SelectTrigger className="h-8 w-17.5">
              <SelectValue placeholder={pageSize} />
            </SelectTrigger>
            <SelectContent side="top">
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={`${size}`}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Pagination className="mx-0 w-auto">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (table.getCanPreviousPage()) table.previousPage()
                }}
                className={!table.getCanPreviousPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>

            {pages.map((p, i) => (
              <PaginationItem key={p === "ellipsis" ? `ellipsis-${i}` : p}>
                {p === "ellipsis" ? (
                  <PaginationEllipsis />
                ) : (
                  <PaginationLink
                    href="#"
                    isActive={p === currentPage}
                    onClick={(e) => {
                      e.preventDefault()
                      table.setPageIndex(p - 1)
                    }}
                  >
                    {p}
                  </PaginationLink>
                )}
              </PaginationItem>
            ))}

            <PaginationItem>
              <PaginationNext
                href="#"
                onClick={(e) => {
                  e.preventDefault()
                  if (table.getCanNextPage()) table.nextPage()
                }}
                className={!table.getCanNextPage() ? "pointer-events-none opacity-50" : ""}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      </div>
    </div>
  )
}
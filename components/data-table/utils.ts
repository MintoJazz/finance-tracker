export type PaginationItemValue = number | "ellipsis"

export function getPaginationItems(
  currentPage: number,
  pageCount: number
): PaginationItemValue[] {
  if (pageCount <= 5) {
    return Array.from({ length: pageCount }, (_, i) => i + 1)
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, "ellipsis", pageCount]
  }

  if (currentPage >= pageCount - 2) {
    return [1, "ellipsis", pageCount - 3, pageCount - 2, pageCount - 1, pageCount]
  }

  return [1, "ellipsis", currentPage - 1, currentPage, currentPage + 1, "ellipsis", pageCount]
}
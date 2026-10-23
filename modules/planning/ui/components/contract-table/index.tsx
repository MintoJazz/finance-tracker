"use client";

import React, { useMemo } from "react";
import { DataTable } from "@/components/data-table";
import { Page } from "@/types/pagination.types";
import { ContractSummaryItem } from "../../../core/schemas/contract.schema";
import { getContractColumns } from "./columns";
import { CONTRACT_ACTIONS, ContractActionContext } from "../contract-actions-drawer";

interface ContractTableProps {
  data: Page<ContractSummaryItem>;
  actionContext: ContractActionContext;
  onRowClick?: (contract: ContractSummaryItem) => void;
  paginationContext?: {
    pageIndex: number;
    pageSize: number;
    pageCount: number;
    setPage: (val: number) => void;
    setPageSize: (val: number) => void;
  };
}

export function ContractTable({ data, actionContext, paginationContext, onRowClick }: ContractTableProps) {
  const columns = useMemo(() => getContractColumns(actionContext), [actionContext]);

  return (
    <DataTable
      columns={columns}
      data={data.data}
      actionContext={actionContext}
      rowActions={CONTRACT_ACTIONS}
      manualPagination={!!paginationContext}
      pageCount={paginationContext?.pageCount}
      pageIndex={paginationContext?.pageIndex}
      onPageChange={paginationContext?.setPage}
      onPageSizeChange={paginationContext?.setPageSize}
      pageSize={paginationContext?.pageSize}
      enablePagination={!!paginationContext}
      showHeader={false}
      onRowClick={onRowClick ? (row) => onRowClick(row.original) : undefined}
    />
  );
}

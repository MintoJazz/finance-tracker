"use client";

import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Archive, Plus, Search } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ContractTable } from "../../../components/contract-table";
import { ContractsOverviewProps } from "../types";
import { ArchiveContractModalConfig } from "../../archive-contract-modal";

const ArchiveContractModal = ArchiveContractModalConfig.views.desktop.View;

export default function ContractsOverviewViewDesktop({
  data,
  counts,
  actionsMenuContext,
  filterContext,
  onAddClick,
  paginationContext,
  archiveContext,
}: ContractsOverviewProps) {
  const { searchProps, typeProps } = filterContext;

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 p-4 md:p-8">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <h1 className="text-xl font-semibold tracking-tight">Contratos</h1>
          <Badge variant="outline" className="tabular-nums">
            {data.total}
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            render={<Link href="/contracts/archived" />}
          >
            <Archive className="size-4" />
          </Button>
          <Button size="sm" onClick={onAddClick}>
            <Plus data-icon="inline-start" />
            Novo contrato
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <InputGroup className="sm:max-w-xs w-full">
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupInput
              {...searchProps}
              placeholder="Buscar contrato..."
            />
          </InputGroup>
        </div>

        <Tabs
          value={typeProps.value}
          onValueChange={(val) => typeProps.onValueChange(val as "ALL" | "PAYABLE" | "RECEIVABLE")}
        >
          <TabsList className="w-full sm:w-fit">
            <TabsTrigger value="ALL">Todos ({counts.total})</TabsTrigger>
            <TabsTrigger value="PAYABLE">A pagar ({counts.payable})</TabsTrigger>
            <TabsTrigger value="RECEIVABLE">A receber ({counts.receivable})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex flex-col gap-2">
        <ContractTable
          data={data}
          actionContext={actionsMenuContext}
          paginationContext={{
            pageIndex: data.pageIndex,
            pageSize: data.pageSize,
            pageCount: data.pageCount,
            setPage: paginationContext.setPage,
            setPageSize: paginationContext.setPageSize,
          }}
        />
      </div>

      <p className="text-xs text-muted-foreground">
        Mostrando {data.data.length} de {data.total} contratos
      </p>

      <ArchiveContractModal {...archiveContext} />
    </div>
  );
}

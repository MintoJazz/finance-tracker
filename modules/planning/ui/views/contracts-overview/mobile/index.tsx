"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Search, Loader2 } from "lucide-react";
import { ContractList } from "../../../components/contract-list";
import { MobileContractsOverviewProps } from "../types";
import { IncludeArchivedToggle } from "@/components/include-archived-toggle";
import { ContractActionsDrawer } from "../../../components/contract-actions-drawer";
import { ContractSummaryItem } from "../../../../core/schemas/contract.schema";
import { ArchiveContractModalConfig } from "../../archive-contract-modal";
import { RestoreContractModalConfig } from "../../restore-contract-modal";

const ArchiveContractModal = ArchiveContractModalConfig.views.mobile.View;
const RestoreContractModal = RestoreContractModalConfig.views.mobile.View;

export default function ContractsOverviewViewMobile({
  items,
  counts,
  total,
  hasMore,
  isLoadingMore,
  sentinelRef,
  actionsMenuContext,
  filterContext,
  onAddClick,
  archiveContext,
  restoreContext,
}: MobileContractsOverviewProps) {
  const { searchProps, showArchived, typeProps } = filterContext;
  
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<ContractSummaryItem | null>(null);

  const handleActionClick = (contract: ContractSummaryItem) => {
    setSelectedContract(contract);
    setActionsOpen(true);
  };

  const handleToggleProjection = (id: number, checked: boolean) => {
    const contract = items.find((c) => c.id === id);
    if (contract) {
      actionsMenuContext.onToggleProjection({ ...contract, includeInProjection: checked });
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 py-4 pb-12">
      <header className="flex items-center justify-between gap-2 px-4">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold tracking-tight">Contratos</h1>
          <Badge variant="outline" className="tabular-nums">
            {total}
          </Badge>
        </div>
        <Button size="sm" onClick={onAddClick} className="gap-1.5">
          <Plus className="size-4" />
          Novo
        </Button>
      </header>

      <div className="flex flex-col gap-4 px-4">
        <div className="flex flex-col gap-3">
          <InputGroup className="w-full">
            <InputGroupAddon>
              <Search className="size-4 text-muted-foreground" />
            </InputGroupAddon>
            <InputGroupInput
              {...searchProps}
              placeholder="Buscar contrato..."
            />
          </InputGroup>

          <div className="flex items-center justify-between">
            <IncludeArchivedToggle
              {...showArchived}
              className="text-xs"
              iconClassName="size-3.5"
            />
            <span className="text-xs text-muted-foreground tabular-nums">
              {items.length} de {total}
            </span>
          </div>
        </div>

        <Tabs
          value={typeProps.value}
          onValueChange={(val) => typeProps.onValueChange(val as "ALL" | "PAYABLE" | "RECEIVABLE")}
          className="w-full"
        >
          <TabsList className="w-full">
            <TabsTrigger value="ALL">Todos ({counts.total})</TabsTrigger>
            <TabsTrigger value="PAYABLE">A pagar ({counts.payable})</TabsTrigger>
            <TabsTrigger value="RECEIVABLE">A receber ({counts.receivable})</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <ContractList
        items={items}
        onActionClick={handleActionClick}
        onToggleProjection={handleToggleProjection}
      />

      {hasMore && (
        <div
          ref={sentinelRef}
          className="flex w-full items-center justify-center py-4 px-4"
        >
          {isLoadingMore && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Loader2 className="size-4 animate-spin text-primary" />
              <span>Carregando mais contratos...</span>
            </div>
          )}
        </div>
      )}

      {!hasMore && items.length > 0 && (
        <p className="text-center text-xs text-muted-foreground py-2 px-4">
          Todos os contratos foram carregados
        </p>
      )}

      <ContractActionsDrawer
        contract={selectedContract}
        context={actionsMenuContext}
        open={actionsOpen}
        onOpenChange={setActionsOpen}
        trigger={null}
      />

      <ArchiveContractModal {...archiveContext} />
      <RestoreContractModal {...restoreContext} />
    </div>
  );
}

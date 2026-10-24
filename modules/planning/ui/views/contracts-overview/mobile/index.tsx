"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Archive, Plus, Search, Loader2 } from "lucide-react";
import { ContractList } from "../../../components/contract-list";
import { MobileContractsOverviewProps } from "../types";
import { ContractActionsDrawer } from "../../../components/contract-actions-drawer";
import { ContractSummaryItem } from "../../../../core/schemas/contract.schema";
import { ArchiveContractModalConfig } from "../../archive-contract-modal";
import { RenameContractModalConfig } from "../../rename-contract-modal";
import { AdjustContractScheduleModalConfig } from "../../adjust-contract-schedule-modal";
import { AdjustContractLimitsModalConfig } from "../../adjust-contract-limits-modal";

const ArchiveContractModal = ArchiveContractModalConfig.views.mobile.View;
const RenameContractModal = RenameContractModalConfig.views.mobile.View;
const useRenameContractModal = RenameContractModalConfig.views.mobile.hook;
const AdjustContractScheduleModal = AdjustContractScheduleModalConfig.views.mobile.View;
const useAdjustContractScheduleModal = AdjustContractScheduleModalConfig.views.mobile.hook;
const AdjustContractLimitsModal = AdjustContractLimitsModalConfig.views.mobile.View;
const useAdjustContractLimitsModal = AdjustContractLimitsModalConfig.views.mobile.hook;

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
  modalsContext,
}: MobileContractsOverviewProps & { modalsContext?: any }) {
  const router = useRouter();
  const { searchProps, typeProps } = filterContext;
  
  const [actionsOpen, setActionsOpen] = React.useState(false);
  const [selectedContract, setSelectedContract] = React.useState<ContractSummaryItem | null>(null);

  const renameModalProps = useRenameContractModal(
    modalsContext?.rename?.contract
      ? ({
          isOpen: modalsContext.rename.isOpen,
          contractId: modalsContext.rename.contract.id,
          contractName: modalsContext.rename.contract.name,
          onClose: modalsContext.rename.onClose,
        } as any)
      : ({} as any)
  );

  const scheduleModalProps = useAdjustContractScheduleModal(
    modalsContext?.schedule?.contract
      ? ({
          isOpen: modalsContext.schedule.isOpen,
          contractId: modalsContext.schedule.contract.id,
          contractName: modalsContext.schedule.contract.name,
          initialDueDay: modalsContext.schedule.contract.dueDay,
          initialClosingDay: (modalsContext.schedule.contract as any).closingDay ?? null,
          initialDueMonth: modalsContext.schedule.contract.dueMonth ?? null,
          initialClosingMonth: (modalsContext.schedule.contract as any).closingMonth ?? null,
          frequency: modalsContext.schedule.contract.frequency,
          onClose: modalsContext.schedule.onClose,
        } as any)
      : ({} as any)
  );

  const limitsModalProps = useAdjustContractLimitsModal(
    modalsContext?.limits?.contract
      ? ({
          isOpen: modalsContext.limits.isOpen,
          contractId: modalsContext.limits.contract.id,
          contractName: modalsContext.limits.contract.name,
          initialValue: modalsContext.limits.contract.value,
          onClose: modalsContext.limits.onClose,
        } as any)
      : ({} as any)
  );

  const handleActionClick = (contract: ContractSummaryItem) => {
    setSelectedContract(contract);
    setActionsOpen(true);
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
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon-sm"
            nativeButton={false}
            render={<Link href="/contracts/archived" />}
            className="gap-1.5 px-2.5"
          >
            <Archive className="size-4" />
            <span className="sr-only sm:not-sr-only">Arquivadas</span>
          </Button>
          <Button size="sm" onClick={onAddClick} className="gap-1.5">
            <Plus className="size-4" />
            Novo
          </Button>
        </div>
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

          <div className="flex items-center justify-end">
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
        onSelect={(contract) => router.push(`/contracts/${contract.id}`)}
        onActionClick={handleActionClick}
        onToggleProjection={actionsMenuContext.onToggleProjection}
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
      <RenameContractModal {...renameModalProps} />
      <AdjustContractScheduleModal {...scheduleModalProps} />
      <AdjustContractLimitsModal {...limitsModalProps} />
    </div>
  );
}

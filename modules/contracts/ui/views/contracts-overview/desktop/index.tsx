"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { RenameContractModalConfig } from "../../rename-contract-modal";
import { AdjustContractScheduleModalConfig } from "../../adjust-contract-schedule-modal";
import { AdjustContractLimitsModalConfig } from "../../adjust-contract-limits-modal";

const ArchiveContractModal = ArchiveContractModalConfig.views.desktop.View;
const RenameContractModal = RenameContractModalConfig.views.desktop.View;
const useRenameContractModal = RenameContractModalConfig.views.desktop.hook;
const AdjustContractScheduleModal = AdjustContractScheduleModalConfig.views.desktop.View;
const useAdjustContractScheduleModal = AdjustContractScheduleModalConfig.views.desktop.hook;
const AdjustContractLimitsModal = AdjustContractLimitsModalConfig.views.desktop.View;
const useAdjustContractLimitsModal = AdjustContractLimitsModalConfig.views.desktop.hook;

export default function ContractsOverviewViewDesktop({
  data,
  counts,
  actionsMenuContext,
  filterContext,
  onAddClick,
  paginationContext,
  archiveContext,
  modalsContext,
}: ContractsOverviewProps & { modalsContext?: any }) {
  const router = useRouter();
  const { searchProps, typeProps } = filterContext;

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
            nativeButton={false}
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
          onRowClick={(contract) => router.push(`/contracts/${contract.id}`)}
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
      <RenameContractModal {...renameModalProps} />
      <AdjustContractScheduleModal {...scheduleModalProps} />
      <AdjustContractLimitsModal {...limitsModalProps} />
    </div>
  );
}

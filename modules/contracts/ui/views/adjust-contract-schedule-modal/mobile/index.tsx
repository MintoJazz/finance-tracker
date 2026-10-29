"use client";

import * as React from "react";
import { Wizard, WizardDrawerLayout, type WizardStep } from "@/components/wizard";
import { Drawer, DrawerContent, DrawerDescription, DrawerTitle } from "@/components/ui/drawer";
import { DataForm } from "@/components/form";
import { cn } from "@/lib/utils";
import type { AdjustContractScheduleModalProps } from "../types";
import type { AdjustContractScheduleFormValues } from "@/modules/contracts/models/adjust-contract-schedule-form.schema";
import {
  getAdjustContractScheduleFieldsStep1,
  getAdjustContractScheduleFieldsStep2,
} from "../components/fields";

export default function AdjustContractScheduleModalViewMobile({
  isOpen,
  onClose,
  onOpenChangeComplete,
  form,
  onSubmit,
  contractName,
}: AdjustContractScheduleModalProps) {
  const effectiveScope = form.watch("effectiveScope");
  const fieldsStep1 = React.useMemo(() => getAdjustContractScheduleFieldsStep1(), []);
  const fieldsStep2 = React.useMemo(
    () => getAdjustContractScheduleFieldsStep2(effectiveScope),
    [effectiveScope]
  );

  const steps = React.useMemo<WizardStep<AdjustContractScheduleFormValues>[]>(
    () => [
      {
        id: "period",
        title: "Prazos",
        component: () => (
          <DataForm
            id="adjust-contract-schedule-step1-mobile"
            form={form}
            fields={fieldsStep1}
            onSubmit={() => {}}
            footer={null}
            className="flex flex-col"
            contentClassName="pb-4"
          />
        ),
      },
      {
        id: "when",
        title: "Quando aplicar",
        submitText: "Salvar",
        component: () => (
          <DataForm
            id="adjust-contract-schedule-step2-mobile"
            form={form}
            fields={fieldsStep2}
            onSubmit={() => {}}
            footer={null}
            className="flex flex-col"
            contentClassName="pb-4"
          />
        ),
      },
    ],
    [form, fieldsStep1, fieldsStep2]
  );

  return (
    <Drawer
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      onOpenChangeComplete={onOpenChangeComplete}
      showSwipeHandle
    >
      <DrawerContent
        className={cn(
          "data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]"
        )}
      >
        <DrawerTitle className="sr-only">{contractName ? `Ajustar prazos - ${contractName}` : "Ajustar prazos"}</DrawerTitle>
        <DrawerDescription className="sr-only">Prazos e vigência</DrawerDescription>
        <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
          <Wizard
            steps={steps}
            initialData={form.getValues()}
            onComplete={async () => {
              await form.handleSubmit(onSubmit)();
            }}
            onClose={onClose}
            pruneInactive={false}
            className="flex flex-col min-h-0 flex-1"
          >
            <WizardDrawerLayout onClose={onClose} />
          </Wizard>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

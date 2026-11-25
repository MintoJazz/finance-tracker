"use client";

import * as React from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Drawer,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from "@/components/ui/drawer";
import {
    Wizard,
    WizardDrawerLayout,
    WizardStepContent,
    type WizardStep,
} from "@/components/wizard";
import type { DefaultValues, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

export interface InstallmentActionModalShellProps {
    isOpen: boolean;
    title: string;
    description: string;
    formId: string;
    submitText?: string;
    isSubmitting?: boolean;
    submitDisabled?: boolean;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
    className?: string;
    children: React.ReactNode;
}

export function InstallmentActionDialog({
    isOpen,
    title,
    description,
    formId,
    submitText = "Salvar",
    isSubmitting = false,
    submitDisabled = false,
    onClose,
    onOpenChangeComplete,
    className,
    children,
}: InstallmentActionModalShellProps) {
    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
        >
            <DialogContent
                className={cn(
                    "sm:max-w-lg max-h-[88dvh] flex flex-col overflow-hidden p-0 gap-0",
                    className
                )}
            >
                <DialogHeader className="px-5 pt-5 pb-3 border-b border-border/60">
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{description}</DialogDescription>
                </DialogHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {children}
                </div>

                <DialogFooter className="mx-0 mb-0 flex-row justify-end gap-2 border-t border-border/60 bg-muted/30 px-5 py-3 rounded-b-xl">
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="submit"
                        form={formId}
                        disabled={isSubmitting || submitDisabled}
                    >
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
                        {isSubmitting ? "Salvando..." : submitText}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function InstallmentActionDrawer({
    isOpen,
    title,
    description,
    formId,
    submitText = "Salvar",
    isSubmitting = false,
    submitDisabled = false,
    onClose,
    onOpenChangeComplete,
    children,
}: InstallmentActionModalShellProps) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
            showSwipeHandle
        >
            <DrawerContent className="max-h-[90dvh] flex flex-col">
                <DrawerHeader className="text-left pb-3 border-b border-border/60">
                    <DrawerTitle>{title}</DrawerTitle>
                    <DrawerDescription>{description}</DrawerDescription>
                </DrawerHeader>

                <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
                    {children}
                </div>

                <DrawerFooter className="border-t border-border/60 pt-3">
                    <Button
                        type="submit"
                        form={formId}
                        disabled={isSubmitting || submitDisabled}
                        className="w-full"
                    >
                        {isSubmitting && (
                            <Loader2 className="animate-spin" data-icon="inline-start" />
                        )}
                        {isSubmitting ? "Salvando..." : submitText}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="w-full"
                    >
                        Cancelar
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export interface InstallmentWizardDrawerProps<TForm extends FieldValues> {
    isOpen: boolean;
    title: string;
    description: string;
    steps: WizardStep<TForm>[];
    initialData?: DefaultValues<TForm>;
    pruneInactive?: boolean;
    /** Conteúdo opcional exibido no topo da área de conteúdo (acima dos campos da etapa). */
    headerExtra?: React.ReactNode;
    /** Conteúdo fixo exibido acima do botão de ação no rodapé do wizard. */
    footerExtra?: React.ReactNode;
    onComplete: (data: TForm) => Promise<void> | void;
    onClose: () => void;
    onOpenChangeComplete?: (open: boolean) => void;
}

/** Shell padrão de Drawer com Wizard multi-etapas para telas de ajuste no mobile. */
export function InstallmentWizardDrawer<TForm extends FieldValues>({
    isOpen,
    title,
    description,
    steps,
    initialData,
    pruneInactive = false,
    headerExtra,
    footerExtra,
    onComplete,
    onClose,
    onOpenChangeComplete,
}: InstallmentWizardDrawerProps<TForm>) {
    return (
        <Drawer
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) onClose();
            }}
            onOpenChangeComplete={onOpenChangeComplete}
            showSwipeHandle
        >
            <DrawerContent className="data-[swipe-axis=y]:[--drawer-content-max-height:calc(100dvh-calc(var(--drawer-inset,0px)*2))] max-h-[calc(100dvh-calc(var(--drawer-inset,0px)*2))]">
                <DrawerTitle className="sr-only">{title}</DrawerTitle>
                <DrawerDescription className="sr-only">
                    {description}
                </DrawerDescription>
                <div className="flex flex-col min-h-0 flex-1 px-3.5 pt-1 pb-3">
                    <Wizard<TForm>
                        steps={steps}
                        initialData={initialData}
                        onComplete={onComplete}
                        onClose={onClose}
                        pruneInactive={pruneInactive}
                        className="flex flex-col min-h-0 flex-1"
                    >
                        <WizardDrawerLayout
                            onClose={onClose}
                            footerExtra={footerExtra}
                        >
                            {headerExtra && (
                                <div className="flex flex-col gap-2">
                                    {headerExtra}
                                    <WizardStepContent />
                                </div>
                            )}
                        </WizardDrawerLayout>
                    </Wizard>
                </div>
            </DrawerContent>
        </Drawer>
    );
}

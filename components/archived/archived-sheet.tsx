"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";

interface ArchivedSheetProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

export function ArchivedSheet({
  title,
  description = "Itens arquivados que podem ser restaurados.",
  children,
}: ArchivedSheetProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(true);

  const handleOpenChange = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) {
      router.back();
    }
  };

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-lg p-0 flex flex-col gap-0">
        <SheetHeader className="p-4 border-b shrink-0">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </div>
      </SheetContent>
    </Sheet>
  );
}

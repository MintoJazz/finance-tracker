"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ArchivedPageLayoutProps {
  title: string;
  description?: string;
  backHref: string;
  children: React.ReactNode;
}

export function ArchivedPageLayout({
  title,
  description = "Itens arquivados que podem ser restaurados.",
  backHref,
  children,
}: ArchivedPageLayoutProps) {
  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4">
      <header className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon-sm"
            render={<Link href={backHref} />}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
            {description && (
              <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </header>

      <div className="w-full">
        {children}
      </div>
    </div>
  );
}

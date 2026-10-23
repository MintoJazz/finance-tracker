"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContractSummaryItem } from "@/modules/planning/core/schemas/contract.schema";
import { Card } from "@/components/ui/card";
import { ListItem, ListItemActions } from "@/components/list-item";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { restoreContractAction } from "@/modules/planning/ui/actions/restore-contract.action";
import { toast } from "@/components/ui/toast";

interface ArchivedContractsListProps {
  initialItems: ContractSummaryItem[];
}

export function ArchivedContractsList({ initialItems }: ArchivedContractsListProps) {
  const router = useRouter();
  const [items, setItems] = useState<ContractSummaryItem[]>(initialItems);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = async (contract: ContractSummaryItem) => {
    try {
      setRestoringId(contract.id);
      const result = await restoreContractAction(contract.id);
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Erro ao recuperar",
          description: result.error ?? "Não foi possível recuperar o contrato.",
        });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== contract.id));
      toast.add({
        type: "success",
        title: "Contrato recuperado",
        description: `O contrato "${contract.name}" foi recuperado com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      console.error("[ArchivedContractsList] Erro ao recuperar contrato:", error);
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar recuperar o contrato.",
      });
    } finally {
      setRestoringId(null);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 p-8 text-center text-muted-foreground border border-dashed rounded-lg bg-muted/10">
        <Archive className="size-8 stroke-[1.5] text-muted-foreground/60" />
        <div className="flex flex-col gap-1">
          <p className="text-sm font-medium text-foreground">Nenhum contrato arquivado</p>
          <p className="text-xs text-muted-foreground">Não há contratos arquivados para exibir.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((contract) => (
          <ListItem
            key={contract.id}
            className="flex-row items-center justify-between gap-3 py-2.5 px-3.5 hover:bg-muted/40 transition-colors"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {contract.name}
            </span>
            <ListItemActions>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                disabled={restoringId === contract.id}
                onClick={() => handleRestore(contract)}
                title="Recuperar contrato"
              >
                {restoringId === contract.id ? (
                  <Loader2 className="size-3.5 animate-spin" />
                ) : (
                  <ArchiveRestore className="size-4" />
                )}
                <span className="sr-only">Recuperar</span>
              </Button>
            </ListItemActions>
          </ListItem>
        ))}
      </div>
    </Card>
  );
}

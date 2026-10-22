"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { WalletSummary } from "@/modules/account/core/schemas/wallet.schema";
import { Card } from "@/components/ui/card";
import { ListItem, ListItemActions } from "@/components/list-item";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Loader2, Wallet } from "lucide-react";
import { restoreWalletAction } from "@/modules/account/ui/actions/restore-wallet.action";
import { toast } from "@/components/ui/toast";

interface ArchivedWalletsListProps {
  initialItems: WalletSummary[];
}

export function ArchivedWalletsList({ initialItems }: ArchivedWalletsListProps) {
  const router = useRouter();
  const [items, setItems] = useState<WalletSummary[]>(initialItems);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = async (wallet: WalletSummary) => {
    try {
      setRestoringId(wallet.id);
      const result = await restoreWalletAction({ id: wallet.id });
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Erro ao recuperar",
          description: result.error ?? "Não foi possível recuperar a carteira.",
        });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== wallet.id));
      toast.add({
        type: "success",
        title: "Carteira recuperada",
        description: `A carteira "${wallet.name}" foi recuperada com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      console.error("[ArchivedWalletsList] Erro ao recuperar carteira:", error);
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar recuperar a carteira.",
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
          <p className="text-sm font-medium text-foreground">Nenhuma carteira arquivada</p>
          <p className="text-xs text-muted-foreground">Não há carteiras arquivadas para exibir.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((wallet) => (
          <ListItem
            key={wallet.id}
            className="flex-row items-center justify-between gap-3 py-2.5 px-3.5 hover:bg-muted/40 transition-colors"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {wallet.name}
            </span>
            <ListItemActions>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                disabled={restoringId === wallet.id}
                onClick={() => handleRestore(wallet)}
                title="Recuperar carteira"
              >
                {restoringId === wallet.id ? (
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

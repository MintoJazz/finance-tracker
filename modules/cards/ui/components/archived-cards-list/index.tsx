"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardSummary } from "@/modules/cards/models/card.schema";
import { Card } from "@/components/ui/card";
import { ListItem, ListItemActions } from "@/components/list-item";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, CreditCard, Loader2 } from "lucide-react";
import { restoreCardAction } from "@/modules/cards/ui/actions/restore-card.action";
import { toast } from "@/components/ui/toast";

interface ArchivedCardsListProps {
  initialItems: CardSummary[];
}

export function ArchivedCardsList({ initialItems }: ArchivedCardsListProps) {
  const router = useRouter();
  const [items, setItems] = useState<CardSummary[]>(initialItems);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = async (card: CardSummary) => {
    try {
      setRestoringId(card.id);
      const result = await restoreCardAction({ id: card.id });
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Erro ao recuperar",
          description: result.error ?? "Não foi possível recuperar o cartão.",
        });
        return;
      }

      setItems((prev) => prev.filter((item) => item.id !== card.id));
      toast.add({
        type: "success",
        title: "Cartão recuperado",
        description: `O cartão "${card.name}" foi recuperado com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      console.error("[ArchivedCardsList] Erro ao recuperar cartão:", error);
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar recuperar o cartão.",
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
          <p className="text-sm font-medium text-foreground">Nenhum cartão arquivado</p>
          <p className="text-xs text-muted-foreground">Não há cartões arquivados para exibir.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((card) => (
          <ListItem
            key={card.id}
            className="flex-row items-center justify-between gap-3 py-2.5 px-3.5 hover:bg-muted/40 transition-colors"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {card.name}
            </span>
            <ListItemActions>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                disabled={restoringId === card.id}
                onClick={() => handleRestore(card)}
                title="Recuperar cartão"
              >
                {restoringId === card.id ? (
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

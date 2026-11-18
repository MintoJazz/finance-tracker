"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RecurrenceListItem } from "@/modules/recurrences/models/schemas/recurrence-item.schema";
import { Card } from "@/components/ui/card";
import { ListItem, ListItemActions } from "@/components/list-item";
import { Button } from "@/components/ui/button";
import { Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { restoreRecurrenceAction } from "@/modules/recurrences/ui/actions/restore-recurrence.action";
import { toast } from "@/components/ui/toast";

interface ArchivedRecurrencesListProps {
  initialItems: RecurrenceListItem[];
}

export function ArchivedRecurrencesList({ initialItems }: ArchivedRecurrencesListProps) {
  const router = useRouter();
  const [items, setItems] = useState<RecurrenceListItem[]>(initialItems);
  const [restoringId, setRestoringId] = useState<number | null>(null);

  const handleRestore = async (recurrence: RecurrenceListItem) => {
    try {
      setRestoringId(recurrence.balanceId);
      const result = await restoreRecurrenceAction({ id: recurrence.balanceId });
      if (!result.success) {
        toast.add({
          type: "error",
          title: "Erro ao recuperar",
          description: result.error ?? "Não foi possível recuperar a recorrência.",
        });
        return;
      }

      setItems((prev) => prev.filter((item) => item.balanceId !== recurrence.balanceId));
      toast.add({
        type: "success",
        title: "Recorrência recuperada",
        description: `A recorrência "${recurrence.name}" foi recuperada com sucesso.`,
      });
      router.refresh();
    } catch (error) {
      console.error("[ArchivedRecurrencesList] Erro ao recuperar recorrência:", error);
      toast.add({
        type: "error",
        title: "Erro inesperado",
        description: "Ocorreu um erro ao tentar recuperar a recorrência.",
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
          <p className="text-sm font-medium text-foreground">Nenhuma recorrência arquivada</p>
          <p className="text-xs text-muted-foreground">Não há recorrências arquivadas para exibir.</p>
        </div>
      </div>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="divide-y divide-border">
        {items.map((recurrence) => (
          <ListItem
            key={recurrence.balanceId}
            className="flex-row items-center justify-between gap-3 py-2.5 px-3.5 hover:bg-muted/40 transition-colors"
          >
            <span className="text-sm font-medium text-foreground truncate">
              {recurrence.name}
            </span>
            <ListItemActions>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="size-7 text-muted-foreground hover:text-foreground shrink-0"
                disabled={restoringId === recurrence.balanceId}
                onClick={() => handleRestore(recurrence)}
                title="Recuperar recorrência"
              >
                {restoringId === recurrence.balanceId ? (
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

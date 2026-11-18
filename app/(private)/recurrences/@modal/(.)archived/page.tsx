import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedSheet } from "@/components/archived/archived-sheet";
import { ArchivedRecurrencesList } from "@/modules/recurrences/ui/components/archived-recurrences-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedRecurrencesModal() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const useCase = RecurrenceFactory.makeGetContextRecurrencesUseCase();
  const { success, data, error } = await useCase.execute({
    session,
    filter: { archivedOnly: true, active: "ALL" },
  });

  if (!success || !data) {
    return (
      <ArchivedSheet title="Recorrências Arquivadas">
        <ErrorView title="Erro ao carregar recorrências" error={error ?? "Não foi possível carregar as recorrências arquivadas."} />
      </ArchivedSheet>
    );
  }

  return (
    <ArchivedSheet
      title="Recorrências Arquivadas"
      description="Gerencie e recupere suas recorrências arquivadas."
    >
      <ArchivedRecurrencesList initialItems={data} />
    </ArchivedSheet>
  );
}

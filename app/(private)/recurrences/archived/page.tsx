import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedPageLayout } from "@/components/archived/archived-page-layout";
import { ArchivedRecurrencesList } from "@/modules/recurrences/ui/components/archived-recurrences-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedRecurrencesPage() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const useCase = RecurrenceFactory.makeGetContextRecurrencesUseCase();
  const { success, data, error } = await useCase.execute({
    session,
    filter: { archivedOnly: true, active: "ALL" },
  });

  if (!success || !data) {
    return (
      <ArchivedPageLayout title="Recorrências Arquivadas" backHref="/recurrences">
        <ErrorView title="Erro ao carregar recorrências" error={error ?? "Não foi possível carregar as recorrências arquivadas."} />
      </ArchivedPageLayout>
    );
  }

  return (
    <ArchivedPageLayout
      title="Recorrências Arquivadas"
      description="Gerencie e recupere suas recorrências arquivadas."
      backHref="/recurrences"
    >
      <ArchivedRecurrencesList initialItems={data} />
    </ArchivedPageLayout>
  );
}

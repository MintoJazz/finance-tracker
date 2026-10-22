import { AccountFactory } from "@/modules/account/infra/factories/account.factory";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedPageLayout } from "@/components/archived/archived-page-layout";
import { ArchivedCardsList } from "@/modules/account/ui/components/archived-cards-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedCardsPage() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const useCase = AccountFactory.makeGetContextCardsUseCase();
  const { success, data, error } = await useCase.execute({
    session,
    pageRequest: { page: 1, pageSize: 50 },
    filter: { archivedOnly: true },
  });

  if (!success || !data) {
    return (
      <ArchivedPageLayout title="Cartões Arquivados" backHref="/cards">
        <ErrorView title="Erro ao carregar cartões" error={error ?? "Não foi possível carregar os cartões arquivados."} />
      </ArchivedPageLayout>
    );
  }

  return (
    <ArchivedPageLayout
      title="Cartões Arquivados"
      description="Gerencie e recupere seus cartões arquivados."
      backHref="/cards"
    >
      <ArchivedCardsList initialItems={data.data} />
    </ArchivedPageLayout>
  );
}

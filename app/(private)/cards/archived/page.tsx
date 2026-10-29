import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedPageLayout } from "@/components/archived/archived-page-layout";
import { ArchivedCardsList } from "@/modules/cards/ui/components/archived-cards-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedCardsPage() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const useCase = CardFactory.makeGetContextCardsUseCase();
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

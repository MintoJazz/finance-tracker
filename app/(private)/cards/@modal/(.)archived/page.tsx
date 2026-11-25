import { getCardsAction } from "@/modules/cards/ui/actions/get-cards.action";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedSheet } from "@/components/archived/archived-sheet";
import { ArchivedCardsList } from "@/modules/cards/ui/components/archived-cards-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedCardsModal() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const { success, data, error } = await getCardsAction({
    pageRequest: { page: 1, pageSize: 50 },
    filter: { archivedOnly: true },
  });

  if (!success || !data) {
    return (
      <ArchivedSheet title="Cartões Arquivados">
        <ErrorView title="Erro ao carregar cartões" error={error ?? "Não foi possível carregar os cartões arquivados."} />
      </ArchivedSheet>
    );
  }

  return (
    <ArchivedSheet
      title="Cartões Arquivados"
      description="Gerencie e recupere seus cartões arquivados."
    >
      <ArchivedCardsList initialItems={data.data} />
    </ArchivedSheet>
  );
}

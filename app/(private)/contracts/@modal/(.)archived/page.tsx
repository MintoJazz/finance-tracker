import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedSheet } from "@/components/archived/archived-sheet";
import { ArchivedContractsList } from "@/modules/planning/ui/components/archived-contracts-list";
import { getContractsOverviewAction } from "@/modules/planning/ui/actions/get-contracts-overview.action";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedContractsModal() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  let data;
  try {
    data = await getContractsOverviewAction(1, {
      archivedOnly: true,
      page: 1,
      pageSize: 50,
    });
  } catch (error) {
    console.error("[ArchivedContractsModal] Falha ao carregar contratos:", error);
    return (
      <ArchivedSheet title="Contratos Arquivados">
        <ErrorView
          title="Erro ao carregar contratos"
          error={error instanceof Error ? error.message : "Não foi possível carregar os contratos arquivados."}
        />
      </ArchivedSheet>
    );
  }

  if (!data) {
    return (
      <ArchivedSheet title="Contratos Arquivados">
        <ErrorView
          title="Erro ao carregar contratos"
          error="Não foi possível carregar os contratos arquivados."
        />
      </ArchivedSheet>
    );
  }

  return (
    <ArchivedSheet
      title="Contratos Arquivados"
      description="Gerencie e recupere seus contratos arquivados."
    >
      <ArchivedContractsList initialItems={data.page.data} />
    </ArchivedSheet>
  );
}

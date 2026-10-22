import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedPageLayout } from "@/components/archived/archived-page-layout";
import { ArchivedContractsList } from "@/modules/planning/ui/components/archived-contracts-list";
import { getContractsOverviewAction } from "@/modules/planning/ui/actions/get-contracts-overview.action";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedContractsPage() {
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
    console.error("[ArchivedContractsPage] Falha ao carregar contratos:", error);
    return (
      <ArchivedPageLayout title="Contratos Arquivados" backHref="/contracts">
        <ErrorView
          title="Erro ao carregar contratos"
          error={error instanceof Error ? error.message : "Não foi possível carregar os contratos arquivados."}
        />
      </ArchivedPageLayout>
    );
  }

  if (!data) {
    return (
      <ArchivedPageLayout title="Contratos Arquivados" backHref="/contracts">
        <ErrorView
          title="Erro ao carregar contratos"
          error="Não foi possível carregar os contratos arquivados."
        />
      </ArchivedPageLayout>
    );
  }

  return (
    <ArchivedPageLayout
      title="Contratos Arquivados"
      description="Gerencie e recupere seus contratos arquivados."
      backHref="/contracts"
    >
      <ArchivedContractsList initialItems={data.page.data} />
    </ArchivedPageLayout>
  );
}

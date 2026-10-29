import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedPageLayout } from "@/components/archived/archived-page-layout";
import { ArchivedWalletsList } from "@/modules/wallets/ui/components/archived-wallets-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedWalletsPage() {
  const session = await SessionHandler.getSession();
  if (!session) redirect("/login");

  const useCase = WalletFactory.makeGetContextWalletsUseCase();
  const { success, data, error } = await useCase.execute({
    session,
    pageRequest: { page: 1, pageSize: 50 },
    filter: { archivedOnly: true },
  });

  if (!success || !data) {
    return (
      <ArchivedPageLayout title="Carteiras Arquivadas" backHref="/wallets">
        <ErrorView title="Erro ao carregar carteiras" error={error ?? "Não foi possível carregar as carteiras arquivadas."} />
      </ArchivedPageLayout>
    );
  }

  return (
    <ArchivedPageLayout
      title="Carteiras Arquivadas"
      description="Gerencie e recupere suas carteiras arquivadas."
      backHref="/wallets"
    >
      <ArchivedWalletsList initialItems={data.data} />
    </ArchivedPageLayout>
  );
}

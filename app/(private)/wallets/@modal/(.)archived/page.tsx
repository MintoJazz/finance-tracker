import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ArchivedSheet } from "@/components/archived/archived-sheet";
import { ArchivedWalletsList } from "@/modules/wallets/ui/components/archived-wallets-list";
import { ErrorView } from "@/components/error-view";

export default async function ArchivedWalletsModal() {
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
      <ArchivedSheet title="Carteiras Arquivadas">
        <ErrorView title="Erro ao carregar carteiras" error={error ?? "Não foi possível carregar as carteiras arquivadas."} />
      </ArchivedSheet>
    );
  }

  return (
    <ArchivedSheet
      title="Carteiras Arquivadas"
      description="Gerencie e recupere suas carteiras arquivadas."
    >
      <ArchivedWalletsList initialItems={data.data} />
    </ArchivedSheet>
  );
}

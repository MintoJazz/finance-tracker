import { WalletFactory } from "@/modules/wallets/infra/factories/wallet.factory";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { PageRequest } from "@/types/pagination.types";
import { BaseFilter, BaseFilterSchema } from "@/types/filters.types";
import { ViewContainer } from "@/components/adaptive";
import { WalletsOverviewConfig } from "@/modules/wallets/ui/views/wallets-overview";
import { ErrorView } from "@/components/error-view";
import { getDeviceViewport } from "@/lib/device";

interface Props {
    searchParams: Promise<PageRequest & BaseFilter>;
}

export default async function Page(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const searchParams = await props.searchParams;
    const { page, pageSize, search } = searchParams;

    const pageRequest: PageRequest = { page, pageSize };
    const filter = BaseFilterSchema.parse({ search });

    const useCase = WalletFactory.makeGetContextWalletsUseCase();
    const { success, data, error } = await useCase.execute({ session, pageRequest, filter });

    if (!success || !data) {
        console.error("[WalletsPage] Falha ao carregar carteiras:", error);
        return <ErrorView title="Erro ao carregar carteiras" error={error ?? "Não foi possível carregar as carteiras."} />;
    }

    const initialViewport = await getDeviceViewport();

    return <ViewContainer initialViewport={initialViewport} data={data} {...WalletsOverviewConfig} />;
}
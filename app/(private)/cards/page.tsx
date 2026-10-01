import { AccountFactory } from "@/modules/account/infra/factories/account.factory";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { PageRequest } from "@/types/pagination.types";
import { BaseFilter, BaseFilterSchema } from "@/types/filters.types";
import { ViewContainer } from "@/components/adaptive";
import { CardsOverviewConfig } from "@/modules/account/ui/views/cards-overview";
import { ErrorView } from "@/components/error-view";

interface Props {
    searchParams: Promise<PageRequest & BaseFilter>;
}

export default async function CardsPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { page, pageSize, search, showArchived } = await props.searchParams;

    const pageRequest: PageRequest = { page, pageSize };
    const filter = BaseFilterSchema.parse({ search, showArchived });

    const useCase = AccountFactory.makeGetContextCardsUseCase();
    const { success, data, error } = await useCase.execute({ session, pageRequest, filter });

    if (!success || !data) {
        console.error("[CardsPage] Falha ao carregar cartões:", error);
        return <ErrorView title="Erro ao carregar cartões" error={error ?? "Não foi possível carregar os cartões."} />;
    }

    return <ViewContainer data={data} {...CardsOverviewConfig} />;
}

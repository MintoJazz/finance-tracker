import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { ContractsOverviewConfig } from "@/modules/contracts/ui/views/contracts-overview";
import { ErrorView } from "@/components/error-view";
import { getContractsOverviewAction } from "@/modules/contracts/ui/actions/get-contracts-overview.action";
import { getDeviceViewport } from "@/lib/device";

interface Props {
    searchParams: Promise<{
        search?: string;
        type?: string;
        page?: string;
        pageSize?: string;
    }>;
}

export default async function ContractsPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const searchParams = await props.searchParams;

    const search = searchParams.search || "";
    const type = (searchParams.type === "PAYABLE" || searchParams.type === "RECEIVABLE") ? searchParams.type as "PAYABLE" | "RECEIVABLE" : "ALL";
    const page = searchParams.page ? Number.parseInt(searchParams.page, 10) : 1;
    const pageSize = searchParams.pageSize ? Number.parseInt(searchParams.pageSize, 10) : 10;

    let data;
    try {
        // mock contextId as 1 for now
        data = await getContractsOverviewAction(1, {
            search,
            type,
            page,
            pageSize
        });
    } catch (error) {
        console.error("[ContractsPage] Falha ao carregar contratos:", error);
        return <ErrorView title="Erro ao carregar contratos" error={error instanceof Error ? error.message : "Erro desconhecido."} />;
    }

    if (!data) {
        return <ErrorView title="Erro ao carregar contratos" error="Não foi possível carregar os contratos." />;
    }

    const initialViewport = await getDeviceViewport();

    return <ViewContainer initialViewport={initialViewport} data={data} {...ContractsOverviewConfig} />;
}

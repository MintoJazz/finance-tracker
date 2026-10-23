import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { ContractProfileMockService } from "@/modules/planning/infra/mock/contract-profile.mock";
import { ContractProfileAdaptiveConfig } from "@/modules/planning/ui/views/contract-profile";

interface ContractProfilePageProps {
    params: Promise<{ id: string }>;
}

export default async function ContractProfilePage(props: ContractProfilePageProps) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const params = await props.params;
    const contractId = Number(params.id);

    if (Number.isNaN(contractId) || contractId <= 0) {
        return (
            <ErrorView
                title="Identificador Inválido"
                error="O identificador do contrato informado na rota é inválido."
            />
        );
    }

    const profileResult = await ContractProfileMockService.getProfileById(contractId);
    if (!profileResult.success || !profileResult.data) {
        return (
            <ErrorView
                title="Erro ao carregar contrato"
                error={profileResult.error ?? "Não foi possível carregar os dados do contrato."}
            />
        );
    }

    const profile = profileResult.data;

    const cyclesResult = await ContractProfileMockService.getCycles({
        contractId,
        pageRequest: {
            page: 1,
            pageSize: 10,
        },
    });

    return (
        <ViewContainer
            data={{
                contractId,
                profile,
                initialCycles: cyclesResult.success && cyclesResult.data ? cyclesResult.data : null,
            }}
            {...ContractProfileAdaptiveConfig}
        />
    );
}

import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { SessionHandler } from "@/modules/identity/infra/handlers/session.handler";
import { CycleRangeSchema } from "@/modules/planning/core/schemas/contract-cycle.schema";
import {
    getContractCycleProfileAction,
    resolveCurrentContractCycleAction,
} from "@/modules/planning/ui/actions/get-contract-cycle-profile.action";
import { ContractCycleProfileAdaptiveConfig } from "@/modules/planning/ui/views/contract-cycle-profile";

interface ContractCyclePageProps {
    params: Promise<{ id: string }>;
    searchParams: Promise<{ from?: string; to?: string }>;
}

export default async function ContractCyclePage(props: ContractCyclePageProps) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const [params, searchParams] = await Promise.all([
        props.params,
        props.searchParams,
    ]);

    const contractId = Number(params.id);
    if (Number.isNaN(contractId) || contractId <= 0) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
                <ErrorView
                    title="Identificador Inválido"
                    error="O identificador do contrato informado na rota é inválido."
                />
            </div>
        );
    }

    // Sem parâmetros: resolve o ciclo atual e redireciona para a URL canônica com from/to
    if (!searchParams.from && !searchParams.to) {
        const resolveResult = await resolveCurrentContractCycleAction(contractId);
        if (resolveResult.success && resolveResult.data) {
            redirect(
                `/contracts/${contractId}/cycle?from=${resolveResult.data.from}&to=${resolveResult.data.to}`
            );
        }
    }

    // Validação estrita do par from/to
    const parsedRange = CycleRangeSchema.safeParse({
        from: searchParams.from,
        to: searchParams.to,
    });

    if (!parsedRange.success) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
                <ErrorView
                    title="Ciclo Inválido"
                    error="O período do ciclo informado na URL é inválido, incompleto ou invertido."
                />
            </div>
        );
    }

    // Busca das informações do ciclo e extrato via Server Action
    const result = await getContractCycleProfileAction(
        contractId,
        parsedRange.data
    );

    if (!result.success || !result.data) {
        return (
            <div className="w-full max-w-2xl mx-auto p-4 md:p-6">
                <ErrorView
                    title="Ciclo não encontrado"
                    error={
                        result.error ??
                        "Não foi possível encontrar as informações deste ciclo para o contrato informado."
                    }
                />
            </div>
        );
    }

    return (
        <ViewContainer
            data={{
                contractId,
                cycle: result.data.cycle,
                entries: result.data.entries,
            }}
            {...ContractCycleProfileAdaptiveConfig}
        />
    );
}

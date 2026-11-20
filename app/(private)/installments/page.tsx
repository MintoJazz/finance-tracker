import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { InstallmentFactory } from "@/modules/installments/infra/factories/installment.factory";
import { InstallmentsOverviewConfig } from "@/modules/installments/ui/views/installments-overview";

export default async function InstallmentsPage() {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const useCase = InstallmentFactory.makeGetContextInstallmentsUseCase();
    const result = await useCase.execute({ session });

    if (!result.success || !result.data) {
        console.error(
            "[InstallmentsPage] Falha ao carregar parcelamentos:",
            result.error
        );
        return (
            <ErrorView
                title="Erro ao carregar parcelamentos"
                error={
                    result.error ?? "Não foi possível carregar os parcelamentos."
                }
            />
        );
    }

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={result.data}
            {...InstallmentsOverviewConfig}
        />
    );
}

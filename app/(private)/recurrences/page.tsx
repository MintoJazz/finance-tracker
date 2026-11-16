import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { ErrorView } from "@/components/error-view";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import { RecurrencesOverviewConfig } from "@/modules/recurrences/ui/views/recurrences-overview";

export default async function RecurrencesPage() {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const useCase = RecurrenceFactory.makeGetContextRecurrencesUseCase();
    const result = await useCase.execute({ session });

    if (!result.success || !result.data) {
        console.error(
            "[RecurrencesPage] Falha ao carregar recorrências:",
            result.error
        );
        return (
            <ErrorView
                title="Erro ao carregar recorrências"
                error={
                    result.error ?? "Não foi possível carregar as recorrências."
                }
            />
        );
    }

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={result.data}
            {...RecurrencesOverviewConfig}
        />
    );
}


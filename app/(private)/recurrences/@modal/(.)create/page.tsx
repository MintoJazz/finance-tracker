import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { RecurrenceFactory } from "@/modules/recurrences/infra/factories/recurrence.factory";
import { MOCK_RECURRENCE_CATEGORY_OPTIONS } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { CreateRecurrenceModalConfig } from "@/modules/recurrences/ui/views/create-recurrence-modal";

export default async function CreateRecurrenceModalPage() {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const optionsResult =
        await RecurrenceFactory.makeGetRecurrenceFormOptionsUseCase().execute({ session });

    if (!optionsResult.success) {
        console.error(
            "[CreateRecurrenceModalPage] Falha ao carregar categorias, usando mock:",
            optionsResult.error
        );
    }
    // Fallback ao mock só para o modal abrir; os ids do mock não existem no banco
    const options = optionsResult.success
        ? optionsResult.data
        : MOCK_RECURRENCE_CATEGORY_OPTIONS;

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ options }}
            {...CreateRecurrenceModalConfig}
        />
    );
}

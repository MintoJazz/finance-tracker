import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { MOCK_RECURRENCE_CATEGORY_OPTIONS } from "@/modules/recurrences/infra/mock/recurrence-category-options.mock";
import { getRecurrenceFormOptionsAction } from "@/modules/recurrences/ui/actions/get-recurrence-form-options.action";
import { getRecurrenceProfileAction } from "@/modules/recurrences/ui/actions/get-recurrence-profile.action";
import { EditRecurrenceModalConfig } from "@/modules/recurrences/ui/views/edit-recurrence-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditRecurrenceModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const balanceId = Number(id);
    if (Number.isNaN(balanceId) || balanceId <= 0) notFound();

    const [profileResult, optionsResult] = await Promise.all([
        getRecurrenceProfileAction(balanceId),
        getRecurrenceFormOptionsAction(),
    ]);
    if (!profileResult.success || !profileResult.data) notFound();

    if (!optionsResult.success) {
        console.error(
            "[EditRecurrenceModalPage] Falha ao carregar categorias, usando mock:",
            optionsResult.error
        );
    }
    // Fallback ao mock só para o modal abrir; os ids do mock não existem no banco
    const options = optionsResult.success
        ? optionsResult.data
        : MOCK_RECURRENCE_CATEGORY_OPTIONS;

    const { name, category } = profileResult.data;
    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                balanceId,
                name,
                categoryId: category?.parentId ?? null,
                subcategoryId: category?.balanceId ?? null,
                options,
            }}
            {...EditRecurrenceModalConfig}
        />
    );
}

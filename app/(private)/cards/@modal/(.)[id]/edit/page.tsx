import { notFound, redirect } from "next/navigation";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getCardByIdAction } from "@/modules/cards/ui/actions/get-card-by-id.action";
import { ViewContainer } from "@/components/adaptive";
import { EditCardModalConfig } from "@/modules/cards/ui/views/edit-card-modal";
import { getDeviceViewport } from "@/lib/device";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditCardModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const cardId = Number(id);

    if (Number.isNaN(cardId) || cardId <= 0) {
        notFound();
    }

    const result = await getCardByIdAction(cardId);

    if (!result.success || !result.data) {
        notFound();
    }

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                id: result.data.id,
                defaultValues: {
                    name: result.data.name,
                    limit: result.data.limit,
                    closingDay: result.data.closingDay,
                    dueDay: result.data.dueDay,
                },
            }}
            {...EditCardModalConfig}
        />
    );
}
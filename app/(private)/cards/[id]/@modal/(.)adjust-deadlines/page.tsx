import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { CardFactory } from "@/modules/cards/infra/factories/card.factory";
import { AdjustCardDeadlinesModalConfig } from "@/modules/cards/ui/views/adjust-card-deadlines-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustCardDeadlinesModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const cardId = Number(id);
    if (Number.isNaN(cardId) || cardId <= 0) notFound();

    const result = await CardFactory.makeGetCardByIdUseCase().execute({
        session,
        cardId,
    });
    if (!result.success || !result.data) notFound();

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ id: result.data.id, name: result.data.name, closingDay: result.data.closingDay, dueDay: result.data.dueDay }}
            {...AdjustCardDeadlinesModalConfig}
        />
    );
}

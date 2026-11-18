import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getRecurrenceProfileAction } from "@/modules/recurrences/ui/actions/get-recurrence-profile.action";
import { AdjustRecurrenceAmountModalConfig } from "@/modules/recurrences/ui/views/adjust-recurrence-amount-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustRecurrenceAmountModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const balanceId = Number(id);
    if (Number.isNaN(balanceId) || balanceId <= 0) notFound();

    const result = await getRecurrenceProfileAction(balanceId);
    if (!result.success || !result.data) notFound();

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{
                balanceId,
                name: result.data.name,
                currentAmount: result.data.currentAmount,
            }}
            {...AdjustRecurrenceAmountModalConfig}
        />
    );
}

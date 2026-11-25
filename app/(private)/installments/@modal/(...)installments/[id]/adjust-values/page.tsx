import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { isFullyConsolidated } from "@/modules/installments/models/schemas/installment-item.schema";
import { getInstallmentByIdAction } from "@/modules/installments/ui/actions/get-installment-by-id.action";
import { AdjustInstallmentValuesModalConfig } from "@/modules/installments/ui/views/adjust-installment-values-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function AdjustInstallmentValuesModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const balanceId = Number(id);
    if (!Number.isInteger(balanceId) || balanceId <= 0) notFound();

    const result = await getInstallmentByIdAction(balanceId);
    if (
        !result.success ||
        !result.data ||
        result.data.isArchived ||
        isFullyConsolidated(result.data)
    ) {
        notFound();
    }

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ installment: result.data }}
            {...AdjustInstallmentValuesModalConfig}
        />
    );
}

import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { getInstallmentByIdAction } from "@/modules/installments/ui/actions/get-installment-by-id.action";
import { EditInstallmentModalConfig } from "@/modules/installments/ui/views/edit-installment-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function EditInstallmentModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const balanceId = Number(id);
    if (!Number.isInteger(balanceId) || balanceId <= 0) notFound();

    const result = await getInstallmentByIdAction(balanceId);
    if (!result.success || !result.data || result.data.isArchived) notFound();

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ installment: result.data }}
            {...EditInstallmentModalConfig}
        />
    );
}

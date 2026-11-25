import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { MOCK_INSTALLMENT_FORM_OPTIONS } from "@/modules/installments/infra/mock/installment-form-options.mock";
import { isFullyConsolidated } from "@/modules/installments/models/schemas/installment-item.schema";
import { getInstallmentByIdAction } from "@/modules/installments/ui/actions/get-installment-by-id.action";
import { getInstallmentFormOptionsAction } from "@/modules/installments/ui/actions/get-installment-form-options.action";
import { ChangeInstallmentCardModalConfig } from "@/modules/installments/ui/views/change-installment-card-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ChangeInstallmentCardModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const balanceId = Number(id);
    if (!Number.isInteger(balanceId) || balanceId <= 0) notFound();

    const [installmentResult, optionsResult] = await Promise.all([
        getInstallmentByIdAction(balanceId, { preferredType: "INVOICE" }),
        getInstallmentFormOptionsAction(),
    ]);
    if (
        !installmentResult.success ||
        !installmentResult.data ||
        installmentResult.data.isArchived ||
        installmentResult.data.type !== "INVOICE" ||
        isFullyConsolidated(installmentResult.data)
    ) {
        notFound();
    }

    const options = optionsResult.success
        ? optionsResult.data
        : MOCK_INSTALLMENT_FORM_OPTIONS;

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ installment: installmentResult.data, cards: options.cards }}
            {...ChangeInstallmentCardModalConfig}
        />
    );
}

import { notFound, redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { MOCK_INSTALLMENT_FORM_OPTIONS } from "@/modules/installments/infra/mock/installment-form-options.mock";
import { getInstallmentByIdAction } from "@/modules/installments/ui/actions/get-installment-by-id.action";
import { getInstallmentFormOptionsAction } from "@/modules/installments/ui/actions/get-installment-form-options.action";
import { ChangeInstallmentCategoryModalConfig } from "@/modules/installments/ui/views/change-installment-category-modal";

interface Props {
    params: Promise<{ id: string }>;
}

export default async function ChangeInstallmentCategoryModalPage(props: Props) {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const { id } = await props.params;
    const balanceId = Number(id);
    if (!Number.isInteger(balanceId) || balanceId <= 0) notFound();

    const [installmentResult, optionsResult] = await Promise.all([
        getInstallmentByIdAction(balanceId),
        getInstallmentFormOptionsAction(),
    ]);
    if (
        !installmentResult.success ||
        !installmentResult.data ||
        installmentResult.data.isArchived
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
            data={{ installment: installmentResult.data, options }}
            {...ChangeInstallmentCategoryModalConfig}
        />
    );
}

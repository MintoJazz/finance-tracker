import { redirect } from "next/navigation";
import { ViewContainer } from "@/components/adaptive";
import { getDeviceViewport } from "@/lib/device";
import { SessionHandler } from "@/modules/auth/infra/handlers/session.handler";
import { InstallmentFactory } from "@/modules/installments/infra/factories/installment.factory";
import { MOCK_INSTALLMENT_FORM_OPTIONS } from "@/modules/installments/infra/mock/installment-form-options.mock";
import { CreateInstallmentModalConfig } from "@/modules/installments/ui/views/create-installment-modal";

export default async function CreateInstallmentModalPage() {
    const session = await SessionHandler.getSession();
    if (!session) redirect("/login");

    const optionsResult =
        await InstallmentFactory.makeGetInstallmentFormOptionsUseCase().execute({ session });

    if (!optionsResult.success) {
        console.error(
            "[CreateInstallmentModalPage] Falha ao carregar opções, usando mock:",
            optionsResult.error
        );
    }
    // Fallback ao mock só para o modal abrir; os ids do mock não existem no banco
    const options = optionsResult.success
        ? optionsResult.data
        : MOCK_INSTALLMENT_FORM_OPTIONS;

    const initialViewport = await getDeviceViewport();

    return (
        <ViewContainer
            initialViewport={initialViewport}
            data={{ options }}
            {...CreateInstallmentModalConfig}
        />
    );
}
